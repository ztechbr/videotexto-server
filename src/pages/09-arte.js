'use strict';

const { drawHeader, drawFooter } = require('./common');

// Logotipo "VT" desenhado pixel a pixel (20 x 9), usando a resolucao real
// de sub-celula do alfabeto grafico G1 (2 colunas x 3 linhas por caractere).
// Montado a partir de duas letras de 9x9, coladas com 2 colunas de folga,
// para nao errar a mao na concatenacao das strings.
const LETRA_V = [
  '1.......1',
  '1.......1',
  '.1.....1.',
  '.1.....1.',
  '..1...1..',
  '..1...1..',
  '...1.1...',
  '...1.1...',
  '....1....',
];
const LETRA_T = [
  '111111111',
  '....1....',
  '....1....',
  '....1....',
  '....1....',
  '....1....',
  '....1....',
  '....1....',
  '....1....',
];
const GAP = '..';
const LOGO = LETRA_V.map((row, i) => row + GAP + LETRA_T[i]);

module.exports = {
  code: '09',
  title: 'ARTE EM MOSAICO',
  render(screen) {
    screen.clear().reset();
    drawHeader(screen, 'ARTE EM MOSAICO');

    screen.goto(2, 1); screen.fg(7);
    screen.print('Demonstracao do alfabeto grafico G1 (semi-');
    screen.goto(3, 1);
    screen.print('grafico), o mesmo usado pelos terminais reais');
    screen.goto(4, 1);
    screen.print('para desenhar logotipos e icones na tela.');

    screen.mosaicArt(6, 9, LOGO, 6, 0);

    screen.goto(16, 1); screen.fg(7);
    screen.print('Barra das 8 cores do Videotexto (mosaico):');

    screen.goto(17, 1);
    screen.alphaG1();
    for (let c = 0; c < 8; c++) {
      screen.fg(c);
      for (let i = 0; i < 5; i++) screen._b(0x20 + 0x3f);
    }
    screen.alphaG0(); screen.reset();

    drawFooter(screen);
  },
};
