'use strict';

const { drawHeader, drawFooter } = require('./common');
const { cache } = require('../data/tempo');

module.exports = {
  code: '02',
  title: 'PREVISAO DO TEMPO',
  render(screen) {
    const dados = cache.get();

    screen.clear().reset();
    drawHeader(screen, 'PREVISAO DO TEMPO');

    if (!dados) {
      screen.goto(8, 1); screen.fg(3);
      screen.print('CARREGANDO DADOS AO VIVO...');
      screen.goto(10, 1); screen.fg(7);
      screen.print('O servidor ainda esta buscando a previsao');
      screen.goto(11, 1);
      screen.print('em tempo real. Tente de novo em instantes.');
      drawFooter(screen);
      return;
    }

    screen.goto(2, 1); screen.fg(6);
    screen.print('TEMPO AGORA - CAPITAIS (dados AO VIVO)');

    screen.goto(4, 1); screen.fg(3);
    screen.print('CIDADE'.padEnd(16) + 'AGORA'.padEnd(7) + 'MIN/MAX');
    screen.hr(5, 1, 38, 4);

    dados.forEach((c, i) => {
      screen.goto(6 + i, 1); screen.fg(7);
      screen.print(c.nome.padEnd(16));
      screen.fg(2);
      screen.print(`${c.atual}C`.padEnd(7));
      screen.fg(7);
      screen.print(`${c.min}/${c.max}C`);
    });

    screen.goto(15, 1); screen.fg(3);
    screen.print('CONDICAO EM SAO PAULO:');
    screen.goto(16, 1); screen.fg(6);
    screen.print(dados[0].condicao);

    screen.goto(18, 1); screen.fg(2);
    screen.print('Fonte: Open-Meteo (dados meteorologicos');
    screen.goto(19, 1);
    screen.print('publicos, atualizados a cada 30 minutos).');

    drawFooter(screen);
  },
};
