'use strict';

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};

function unescapeHtml(str) {
  return String(str)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ENTITIES[name]);
}

const SPECIAL_CHARS = {
  'º': 'o', 'ª': 'a', '–': '-', '—': '-', '…': '...',
  '‘': "'", '’': "'", '“': '"', '”': '"',
};

/** Remove acentos/pontuacao exotica que o alfabeto G0 do Videotex nao imprime bem. */
function toTerminalSafe(str) {
  return String(str)
    .replace(/[ºª–—…‘’“”]/g, (ch) => SPECIAL_CHARS[ch])
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]/g, '?');
}

/** Quebra um texto em linhas de ate `width` colunas, sem cortar palavras ao meio. */
function wordWrap(text, width) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      if (cur) lines.push(cur);
      cur = w.length > width ? w.slice(0, width) : w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

module.exports = { unescapeHtml, toTerminalSafe, wordWrap };
