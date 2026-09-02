'use strict';

const { drawHeader, drawFooter } = require('./common');

const NOMES = ['PRETO', 'VERMELHO', 'VERDE', 'AMARELO', 'AZUL', 'MAGENTA', 'CIANO', 'BRANCO'];

module.exports = {
  code: '10',
  title: 'PALETA E ATRIBUTOS',
  render(screen) {
    screen.clear().reset();
    drawHeader(screen, 'CORES E ATRIBUTOS');

    screen.goto(2, 1); screen.fg(7);
    screen.print('AS 8 CORES DO VIDEOTEXTO (texto):');
    NOMES.forEach((nome, i) => {
      screen.goto(4 + i, 2); screen.fg(i);
      screen.print('* ' + nome);
    });

    screen.goto(4, 22); screen.fg(7);
    screen.print('ATRIBUTOS ESPECIAIS:');

    screen.goto(6, 22); screen.underline(true); screen.fg(7);
    screen.print('SUBLINHADO'); screen.underline(false);

    screen.goto(8, 22); screen.inverse(true); screen.fg(7); screen.bg(0);
    screen.print('  INVERSO  '); screen.inverse(false); screen.reset();

    screen.goto(10, 22); screen.blink(true); screen.fg(1);
    screen.print('PISCA-PISCA'); screen.blink(false); screen.reset();

    screen.goto(12, 22); screen.size('dh'); screen.fg(6);
    screen.print('DUPLA');
    screen.goto(14, 22); screen.print('ALTURA');
    screen.size('normal'); screen.reset();

    drawFooter(screen);
  },
};
