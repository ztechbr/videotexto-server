'use strict';

const Jimp = require('jimp');
const { COLOR_RGB } = require('./constants');

const PALETTE_RGB = COLOR_RGB.map((hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
}));

/** Indice (0-7) da cor da paleta Videotexto mais proxima de um RGB dado. */
function nearestColorIndex(r, g, b) {
  let best = 0, bestDist = Infinity;
  for (let i = 0; i < PALETTE_RGB.length; i++) {
    const p = PALETTE_RGB[i];
    const dist = (r - p.r) ** 2 + (g - p.g) ** 2 + (b - p.b) ** 2;
    if (dist < bestDist) { bestDist = dist; best = i; }
  }
  return best;
}

// Ordem dos 6 sub-pixels dentro de uma celula G1 real (2 col x 3 lin):
// sup-esq, sup-dir, meio-esq, meio-dir, inf-esq, inf-dir.
const BIT_FOR_INDEX = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20];

/**
 * Converte uma imagem PNG/JPEG/BMP/GIF (a primeira quadro, se animado) em
 * uma grade de celulas de mosaico Videotex, exatamente como um artista de
 * Minitel faria a mao: cada caractere de tela vira um bloco de 2x3
 * "sub-pixels" com no maximo 2 cores (uma de "traço"/fg, uma de "fundo"/bg),
 * escolhidas por proximidade a paleta real de 8 cores do Videotexto.
 *
 * @param {Buffer|string} input - bytes da imagem, ou caminho/URL (Jimp aceita ambos)
 * @param {number} cols - largura em celulas de tela (cada uma = 2 sub-pixels)
 * @param {number} rows - altura em celulas de tela (cada uma = 3 sub-pixels)
 * @returns {Promise<Array<Array<{mask:number, fg:number, bg:number}>>>}
 */
async function imageToMosaic(input, cols, rows) {
  const img = await Jimp.read(input);
  const w = cols * 2, h = rows * 3;
  img.cover(w, h); // redimensiona preenchendo o quadro (com corte), mantendo proporcao

  const cells = [];
  for (let r = 0; r < rows; r++) {
    const rowCells = [];
    for (let c = 0; c < cols; c++) {
      const pix = [];
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const x = c * 2 + dc, y = r * 3 + dr;
          const { r: pr, g: pg, b: pb } = Jimp.intToRGBA(img.getPixelColor(x, y));
          pix.push({ r: pr, g: pg, b: pb, lum: 0.299 * pr + 0.587 * pg + 0.114 * pb });
        }
      }

      const lums = pix.map((p) => p.lum);
      const spread = Math.max(...lums) - Math.min(...lums);
      const avgLum = lums.reduce((s, v) => s + v, 0) / lums.length;

      const avgOf = (arr) => {
        const n = arr.length || 1;
        return {
          r: arr.reduce((s, p) => s + p.r, 0) / n,
          g: arr.reduce((s, p) => s + p.g, 0) / n,
          b: arr.reduce((s, p) => s + p.b, 0) / n,
        };
      };

      if (spread < 14) {
        // Bloco quase uniforme: preenche a celula inteira com a cor media.
        const avg = avgOf(pix);
        const idx = nearestColorIndex(avg.r, avg.g, avg.b);
        rowCells.push({ mask: 0x3f, fg: idx, bg: idx });
        continue;
      }

      let mask = 0;
      pix.forEach((p, i) => { if (p.lum >= avgLum) mask |= BIT_FOR_INDEX[i]; });

      const onPix = pix.filter((p) => p.lum >= avgLum);
      const offPix = pix.filter((p) => p.lum < avgLum);
      const fgAvg = avgOf(onPix.length ? onPix : pix);
      const bgAvg = avgOf(offPix.length ? offPix : pix);

      rowCells.push({
        mask,
        fg: nearestColorIndex(fgAvg.r, fgAvg.g, fgAvg.b),
        bg: nearestColorIndex(bgAvg.r, bgAvg.g, bgAvg.b),
      });
    }
    cells.push(rowCells);
  }
  return cells;
}

module.exports = { imageToMosaic, nearestColorIndex };
