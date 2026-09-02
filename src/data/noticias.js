'use strict';

const { createCache } = require('./cache');
const { unescapeHtml, toTerminalSafe } = require('./util');

const FEED_URL = 'https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-BR';

async function fetchNoticias() {
  const res = await fetch(FEED_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (VideotextoBrasil/1.0; +telnet-3615)' },
  });
  if (!res.ok) throw new Error(`Google News HTTP ${res.status}`);
  const xml = await res.text();

  const itens = [];
  const re = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<\/item>/g;
  let m;
  while ((m = re.exec(xml)) && itens.length < 20) {
    const titulo = toTerminalSafe(unescapeHtml(m[1].trim()));
    if (titulo) itens.push(titulo);
  }
  if (itens.length === 0) throw new Error('feed sem itens');
  return itens;
}

const cache = createCache({
  label: 'noticias (Google Noticias RSS)',
  fetcher: fetchNoticias,
  ttlMs: 20 * 60 * 1000, // 20 minutos
});

module.exports = { cache };
