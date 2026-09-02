'use strict';

/**
 * Pequenos "desenhos" em mosaico (resolução real de sub-célula do G1:
 * 2 colunas x 3 linhas de pixel por caractere) para ilustrar a página
 * de esportes. Gerados por regra em vez de digitados à mão, para não
 * errar a mão na grade de pixels (largura par, altura múltipla de 3).
 */
function makeGrid(w, h, isFilled) {
  const rows = [];
  for (let r = 0; r < h; r++) {
    let line = '';
    for (let c = 0; c < w; c++) line += isFilled(r, c) ? '1' : '0';
    rows.push(line);
  }
  return rows;
}

// Bola de futebol: silhueta circular com "gomos" centrais mais escuros.
const BOLA = makeGrid(16, 12, (r, c) => {
  const dx = c - 7.5, dy = r - 5.5;
  return Math.sqrt(dx * dx + dy * dy) <= 5.5;
});

// Trofeu: taca (boca larga), corpo afunilando, haste e base.
const TROFEU_FAIXAS = [
  [2, 11], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7],
  [6, 7], [6, 7], [6, 7], [4, 9], [3, 10], [3, 10],
];
const TROFEU = makeGrid(14, 12, (r, c) => {
  const [ini, fim] = TROFEU_FAIXAS[r];
  return c >= ini && c <= fim;
});

module.exports = { BOLA, TROFEU };
