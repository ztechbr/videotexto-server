'use strict';

const { drawHeader, drawFooter } = require('./common');

module.exports = {
  code: '99',
  title: 'GUIA',
  render(screen) {
    screen.clear().reset();
    drawHeader(screen, 'GUIA DE USO');

    screen.goto(2, 1); screen.fg(6);
    screen.print('COMO NAVEGAR:');

    const linhas = [
      ['NN + ENVIO', 'vai direto ao servico NN (ex: 01)'],
      ['S / SUITE', 'continua / proxima tela'],
      ['R / RETORNO', 'volta a tela anterior'],
      ['G / GUIA', 'mostra este guia'],
      ['H / SUMARIO', 'volta ao indice principal'],
      ['ENVIO vazio', 'repete a tela atual'],
      ['Q / FIM', 'encerra a conexao'],
    ];
    linhas.forEach((l, i) => {
      screen.goto(4 + i, 1); screen.fg(3);
      screen.print(l[0].padEnd(13));
      screen.fg(7); screen.print(l[1]);
    });

    screen.goto(12, 1); screen.fg(6);
    screen.print('EM PAGINAS COM CAMPO DE TEXTO:');
    screen.goto(13, 1); screen.fg(7);
    screen.print('Digite o texto e ENVIO para confirmar.');
    screen.goto(14, 1);
    screen.print('Para navegar, use /SUMARIO /GUIA /VOLTA');
    screen.goto(15, 1);
    screen.print('/CONTINUA (com a barra no inicio).');

    screen.goto(17, 1); screen.fg(2);
    screen.print('No emulador web, use as teclas de funcao');
    screen.goto(18, 1);
    screen.print('mostradas na barra inferior da tela.');

    drawFooter(screen, 'H=SUMARIO   R=VOLTA');
  },
};
