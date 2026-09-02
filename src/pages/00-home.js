'use strict';

const { drawHeader, drawFooter, menuItem } = require('./common');

module.exports = {
  code: '00',
  title: 'SUMARIO',
  render(screen) {
    screen.clear().reset();
    drawHeader(screen, 'SUMARIO');

    screen.goto(2, 1);
    screen.fg(6);
    screen.print('*** BEM-VINDO AO VIDEOTEXTO BRASIL ***');

    screen.goto(4, 1); screen.fg(7);
    screen.print('Digite o codigo do servico e ENVIO:');

    menuItem(screen, 6, '01', 'Jornal Eletronico (noticias ao vivo)');
    menuItem(screen, 7, '02', 'Previsao do Tempo (dados ao vivo)');
    menuItem(screen, 8, '03', 'Horoscopo do Dia (previsao ao vivo)');
    menuItem(screen, 9, '04', 'Classificados (precos reais OLX)');
    menuItem(screen, 10, '05', 'Correio Eletronico');
    menuItem(screen, 11, '06', 'Banco Videotexto (extrato)');
    menuItem(screen, 12, '07', 'Bate-Papo (chat real, sala unica)');
    menuItem(screen, 13, '08', 'Jogos e Quiz');
    menuItem(screen, 14, '09', 'Arte em Mosaico');
    menuItem(screen, 15, '10', 'Paleta de Cores e Atributos');
    menuItem(screen, 16, '11', 'Esportes (noticias reais)');
    menuItem(screen, 18, '99', 'Guia de Uso (ajuda)');

    screen.goto(20, 1); screen.fg(2);
    screen.print('Um servico do tempo em que a tela era de');
    screen.goto(21, 1);
    screen.print('fosforo verde e o modem cantava ao conectar.');

    drawFooter(screen);
  },
};
