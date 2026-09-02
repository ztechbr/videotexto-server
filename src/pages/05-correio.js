'use strict';

const { drawHeader, drawFooter } = require('./common');

const MAX_MSGS = 8;

module.exports = {
  code: '05',
  title: 'CORREIO ELETRONICO',
  expectsText: true,
  onEnter(ctx) {
    if (!ctx.vars.correio) {
      ctx.vars.correio = {
        caixa: [
          { de: 'SYSOP', texto: 'Bem-vindo ao Correio Eletronico do Videotexto!' },
        ],
      };
    }
  },
  onInput(ctx) {
    const texto = (ctx.inputText || '').trim();
    if (!texto) return;
    const caixa = ctx.vars.correio.caixa;
    caixa.push({ de: ctx.userName || 'VISITANTE', texto: texto.slice(0, 34) });
    while (caixa.length > MAX_MSGS) caixa.shift();
  },
  render(screen, ctx) {
    const caixa = (ctx.vars.correio && ctx.vars.correio.caixa) || [];

    screen.clear().reset();
    drawHeader(screen, 'CORREIO ELETRONICO');

    screen.goto(2, 1); screen.fg(6);
    screen.print('CAIXA DE MENSAGENS (demonstracao local)');
    screen.hr(3, 1, 38, 4);

    const visiveis = caixa.slice(-9);
    visiveis.forEach((m, idx) => {
      screen.goto(4 + idx, 1); screen.fg(3);
      screen.print((m.de + ':').padEnd(11).slice(0, 11));
      screen.fg(7);
      screen.print(m.texto.slice(0, 27));
    });

    screen.goto(21, 1); screen.fg(2);
    screen.print('Digite uma mensagem e ENVIO para postar.');
    screen.goto(22, 1);
    screen.print('Use /sumario /guia /volta para navegar.');

    drawFooter(screen, 'ENVIO=enviar msg   /SUMARIO /GUIA /VOLTA');
  },
};
