'use strict';

const { C0, ESC_ATTR, ACCENT_MAP, ROWS, COLS } = require('./constants');

/**
 * Screen: monta um "quadro" (page) de Videotexto exatamente como um
 * terminal Minitel/Videotexto real esperaria receber pela linha serial:
 * um fluxo de bytes com códigos de controle intercalados ao texto.
 *
 * O mesmo fluxo de bytes é usado tanto para a saída telnet/TCP (onde um
 * emulador de terminal Minitel de verdade poderia decodificá-lo) quanto
 * para o emulador web embutido — ambos leem o protocolo real.
 */
class Screen {
  constructor() {
    this.bytes = [];
  }

  _b(...vals) {
    for (const v of vals) this.bytes.push(v & 0xff);
    return this;
  }

  /** Limpa a tela inteira e recolhe o cursor para 0,0 (Form Feed). */
  clear() {
    return this._b(C0.FF_CLS);
  }

  /** Endereçamento direto de cursor (linha 0-24, coluna 0-39). */
  goto(row, col) {
    row = Math.max(0, Math.min(ROWS - 1, row));
    col = Math.max(0, Math.min(COLS - 1, col));
    return this._b(C0.US, 0x40 + row + 1, 0x40 + col + 1);
  }

  cursorOn() { return this._b(C0.DC1_CON); }
  cursorOff() { return this._b(C0.DC4_COFF); }

  /** Cor do caractere (0-7): preto, vermelho, verde, amarelo, azul, magenta, ciano, branco. */
  fg(n) { return this._b(C0.ESC, ESC_ATTR.FG_BASE + (n & 7)); }
  /** Cor do fundo (0-7). */
  bg(n) { return this._b(C0.ESC, ESC_ATTR.BG_BASE + (n & 7)); }

  inverse(on) { return this._b(C0.ESC, on ? ESC_ATTR.INVERSE_ON : ESC_ATTR.INVERSE_OFF); }
  underline(on) { return this._b(C0.ESC, on ? ESC_ATTR.UNDERLINE_ON : ESC_ATTR.UNDERLINE_OFF); }
  blink(on) { return this._b(C0.ESC, on ? ESC_ATTR.BLINK_ON : ESC_ATTR.BLINK_OFF); }

  size(mode) {
    // mode: 'normal' | 'dh' (dupla altura) | 'dw' (dupla largura) | 'both'
    const m = {
      normal: ESC_ATTR.SIZE_NORMAL,
      dh: ESC_ATTR.SIZE_DOUBLE_HEIGHT,
      dw: ESC_ATTR.SIZE_DOUBLE_WIDTH,
      both: ESC_ATTR.SIZE_DOUBLE_BOTH,
    }[mode] || ESC_ATTR.SIZE_NORMAL;
    return this._b(C0.ESC, m);
  }

  /** Reseta os atributos correntes para o padrão (texto branco sobre fundo preto). */
  reset() {
    this.inverse(false); this.underline(false); this.blink(false);
    this.size('normal'); this._b(C0.SI);
    return this.fg(7).bg(0);
  }

  /** Alfabeto G0 (texto normal). */
  alphaG0() { return this._b(C0.SI); }
  /** Alfabeto G1 (semigráfico/mosaico). */
  alphaG1() { return this._b(C0.SO); }

  /** Escreve texto em G0, compondo acentos portugueses via diacrítico + letra base. */
  print(text) {
    for (const ch of String(text)) {
      const code = ch.codePointAt(0);
      if (ACCENT_MAP[ch]) {
        const [diacritic, base] = ACCENT_MAP[ch];
        this._b(C0.ESC, diacritic, base.charCodeAt(0));
      } else if (code >= 0x20 && code <= 0x7e) {
        this._b(code);
      } else {
        this._b(0x3f); // '?' para o que não sabemos representar
      }
    }
    return this;
  }

  printAt(row, col, text) {
    this.goto(row, col);
    return this.print(text);
  }

  /** Desenha uma linha horizontal sólida de mosaico (bloco cheio) na largura dada. */
  hr(row, col, width, colorFg = 7) {
    this.goto(row, col);
    this.fg(colorFg);
    this.alphaG1();
    for (let i = 0; i < width; i++) this._b(0x20 + 0x3f); // padrão 0x3f = bloco cheio
    this.alphaG0();
    return this;
  }

  /**
   * Desenha uma faixa quadriculada (xadrez de blocos cheios), decoração
   * clássica dos menus de Videotexto para separar seções ou emoldurar
   * um título.
   */
  checkerboard(row, col, cols, rows, colorA = 1, colorB = 7) {
    this.alphaG1();
    for (let r = 0; r < rows; r++) {
      this.goto(row + r, col);
      for (let c = 0; c < cols; c++) {
        this.fg((r + c) % 2 === 0 ? colorA : colorB);
        this._b(0x20 + 0x3f);
      }
    }
    this.alphaG0();
    return this;
  }

  /**
   * Desenha uma imagem multicolorida em mosaico, celula por celula, a
   * partir da saida de `image2mosaic.imageToMosaic()`. Ao contrario de
   * `mosaicArt` (uma unica cor de traço/fundo para o desenho todo), aqui
   * cada celula pode ter seu proprio par fg/bg - e assim que uma foto ou
   * logotipo digitalizado aparecia num terminal Videotex de verdade.
   * So emite os codigos de cor quando eles mudam de uma celula para a
   * proxima, para nao desperdiçar bytes na linha (que no Videotexto real
   * custavam caro, a 1200 bps).
   */
  mosaicImage(row, col, cells) {
    let curFg = -1, curBg = -1;
    for (let r = 0; r < cells.length; r++) {
      this.goto(row + r, col);
      this.alphaG1();
      for (let c = 0; c < cells[r].length; c++) {
        const cell = cells[r][c];
        if (cell.fg !== curFg) { this.fg(cell.fg); curFg = cell.fg; }
        if (cell.bg !== curBg) { this.bg(cell.bg); curBg = cell.bg; }
        this._b(0x20 + cell.mask);
      }
      this.alphaG0();
    }
    return this;
  }

  /**
   * Desenha uma "imagem" em mosaico Minitel a partir de uma matriz de pixels
   * 0/1 (array de strings, cada caractere '1' ou '0'/'.'). A matriz deve ter
   * altura múltipla de 3 e largura múltipla de 2 — exatamente a resolução de
   * sub-célula do alfabeto G1 real (2 colunas x 3 linhas de "pixels" por
   * caractere de tela).
   */
  mosaicArt(row, col, pixelRows, fgColor = 7, bgColor = 0) {
    const h = pixelRows.length;
    const w = pixelRows[0].length;
    this.fg(fgColor).bg(bgColor);
    for (let cellRow = 0; cellRow < h / 3; cellRow++) {
      this.goto(row + cellRow, col);
      this.alphaG1();
      for (let cellCol = 0; cellCol < w / 2; cellCol++) {
        let mask = 0;
        const bitAt = (dr, dc, bit) => {
          const r = cellRow * 3 + dr, c = cellCol * 2 + dc;
          const px = pixelRows[r][c];
          if (px === '1' || px === '#') mask |= bit;
        };
        // Ordem padrão do mosaico teletexto: sup-esq, sup-dir, meio-esq,
        // meio-dir, inf-esq, inf-dir (bits 0..5).
        bitAt(0, 0, 0x01); bitAt(0, 1, 0x02);
        bitAt(1, 0, 0x04); bitAt(1, 1, 0x08);
        bitAt(2, 0, 0x10); bitAt(2, 1, 0x20);
        this._b(0x20 + mask);
      }
      this.alphaG0();
    }
    return this;
  }

  /** Linha decorativa de rodapé com o menu de teclas de navegação. */
  footer(text) {
    this.goto(23, 0);
    this.fg(0); this.bg(3);
    this.print(text.padEnd(COLS, ' ').slice(0, COLS));
    this.reset();
    return this;
  }

  /** Linha de status (linha 0), como no Minitel real (protegida/reservada). */
  statusLine(text) {
    this.goto(0, 0);
    this.bg(4); this.fg(7);
    this.print(text.padEnd(COLS, ' ').slice(0, COLS));
    this.reset();
    return this;
  }

  toBuffer() {
    return Buffer.from(this.bytes);
  }
}

module.exports = { Screen };
