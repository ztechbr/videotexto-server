'use strict';

const { drawHeader, drawFooter } = require('./common');

const CIDADES = [
  { nome: 'SAO PAULO', min: 14, max: 24, cond: 'PARCIALMENTE NUBLADO' },
  { nome: 'RIO DE JANEIRO', min: 20, max: 30, cond: 'ENSOLARADO' },
  { nome: 'BELO HORIZONTE', min: 15, max: 27, cond: 'PANCADAS DE CHUVA' },
  { nome: 'PORTO ALEGRE', min: 10, max: 21, cond: 'CEU LIMPO' },
  { nome: 'SALVADOR', min: 23, max: 29, cond: 'NUBLADO' },
  { nome: 'BRASILIA', min: 16, max: 28, cond: 'TEMPO SECO' },
  { nome: 'MANAUS', min: 24, max: 33, cond: 'CHUVA A TARDE' },
  { nome: 'CURITIBA', min: 9, max: 19, cond: 'FRIO E NUBLADO' },
];

module.exports = {
  code: '02',
  title: 'PREVISAO DO TEMPO',
  render(screen) {
    screen.clear().reset();
    drawHeader(screen, 'PREVISAO DO TEMPO');

    screen.goto(2, 1); screen.fg(6);
    screen.print('PREVISAO PARA HOJE - CAPITAIS');

    screen.goto(4, 1); screen.fg(3);
    screen.print('CIDADE'.padEnd(16) + 'MIN/MAX'.padEnd(10) + 'CONDICAO');
    screen.hr(5, 1, 38, 4);

    CIDADES.forEach((c, i) => {
      screen.goto(6 + i, 1); screen.fg(7);
      screen.print(c.nome.padEnd(16));
      screen.fg(2);
      screen.print(`${c.min}/${c.max}C`.padEnd(10));
      screen.fg(7);
      screen.print(c.cond.slice(0, 14));
    });

    screen.goto(16, 1); screen.fg(2);
    screen.print('(dados ficticios, apenas demonstracao)');

    drawFooter(screen);
  },
};
