'use strict';

const { createCache } = require('./cache');
const { toTerminalSafe } = require('./util');

// Fonte: horoscope-app-api.vercel.app entrega a previsao diaria real (em
// ingles); a Folha/F5 foi a fonte pedida originalmente, mas a previsao de
// cada signo la e carregada via Javascript no navegador (nao esta no HTML
// que um servidor consegue buscar). Traduzimos o texto real para
// portugues via a API publica MyMemory.
const SIGNOS = [
  { pt: 'ARIES', slug: 'aries' },
  { pt: 'TOURO', slug: 'taurus' },
  { pt: 'GEMEOS', slug: 'gemini' },
  { pt: 'CANCER', slug: 'cancer' },
  { pt: 'LEAO', slug: 'leo' },
  { pt: 'VIRGEM', slug: 'virgo' },
  { pt: 'LIBRA', slug: 'libra' },
  { pt: 'ESCORPIAO', slug: 'scorpio' },
  { pt: 'SAGITARIO', slug: 'sagittarius' },
  { pt: 'CAPRICORNIO', slug: 'capricorn' },
  { pt: 'AQUARIO', slug: 'aquarius' },
  { pt: 'PEIXES', slug: 'pisces' },
];

function firstSentences(text, maxLen) {
  const trimmed = text.slice(0, maxLen);
  const lastStop = Math.max(trimmed.lastIndexOf('. '), trimmed.lastIndexOf('.'));
  return (lastStop > 40 ? trimmed.slice(0, lastStop + 1) : trimmed).trim();
}

async function fetchOne(slug) {
  const res = await fetch(
    `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${slug}&day=today`,
    { headers: { 'User-Agent': 'VideotextoBrasil/1.0' } },
  );
  if (!res.ok) throw new Error(`horoscope-api HTTP ${res.status}`);
  const data = await res.json();
  return firstSentences(data.data.horoscope, 220);
}

async function translate(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`;
  const res = await fetch(url, { headers: { 'User-Agent': 'VideotextoBrasil/1.0' } });
  if (!res.ok) throw new Error(`mymemory HTTP ${res.status}`);
  const data = await res.json();
  const translated = data && data.responseData && data.responseData.translatedText;
  if (!translated) throw new Error('traducao vazia');
  return translated;
}

async function fetchHoroscopo() {
  const resultado = {};
  for (const s of SIGNOS) {
    const original = await fetchOne(s.slug);
    let texto;
    try {
      texto = await translate(original);
    } catch (e) {
      texto = original; // sem traducao disponivel: mostra o original em ingles
    }
    resultado[s.pt] = toTerminalSafe(texto);
  }
  return resultado;
}

const cache = createCache({
  label: 'horoscopo (horoscope-api + traducao)',
  fetcher: fetchHoroscopo,
  ttlMs: 60 * 60 * 1000, // 1 hora (previsao diaria muda pouco)
});

module.exports = { cache, SIGNOS };
