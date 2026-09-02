'use strict';

const { drawHeader, drawFooter } = require('./common');
const { cache: logoCache } = require('../data/logo');

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

function edicao1(screen) {
  drawHeader(screen, 'ARTE EM MOSAICO 1/2');

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

  drawFooter(screen, 'S=PROX (foto convertida)  H=SUMARIO  G=GUIA');
}

function edicao2(screen) {
  drawHeader(screen, 'ARTE EM MOSAICO 2/2');

  screen.goto(2, 1); screen.fg(7);
  screen.print('Esta imagem NAO foi desenhada a mao: e um');
  screen.goto(3, 1);
  screen.print('arquivo PNG de verdade, convertido em bloco');
  screen.goto(4, 1);
  screen.print('de mosaico pela funcao imageToMosaic().');

  const cells = logoCache.get();
  if (cells) {
    screen.mosaicImage(6, 12, cells);
  } else {
    screen.goto(9, 8); screen.fg(3);
    screen.print('convertendo imagem...');
  }

  screen.goto(19, 1); screen.fg(2);
  screen.print('src/videotex/image2mosaic.js aceita PNG,');
  screen.goto(20, 1);
  screen.print('JPEG, BMP e GIF (1o quadro) como entrada.');

  drawFooter(screen, 'S=VOLTAR AO LOGO  H=SUMARIO  G=GUIA');
}

module.exports = {
  code: '09',
  title: 'ARTE EM MOSAICO',
  onEnter(ctx) { ctx.vars.arte = { i: 0 }; },
  next(ctx) {
    const st = ctx.vars.arte || (ctx.vars.arte = { i: 0 });
    st.i = (st.i + 1) % 2;
    return null;
  },
  render(screen, ctx) {
    const st = ctx.vars.arte || (ctx.vars.arte = { i: 0 });
    screen.clear().reset();
    if (st.i === 0) edicao1(screen);
    else edicao2(screen);
  },
};
