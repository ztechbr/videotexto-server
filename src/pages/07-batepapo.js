'use strict';

const { drawHeader, drawFooter } = require('./common');

const RESPOSTAS = [
  'legal, conta mais!',
  'aqui no VIDEOTEXTO tambem gostamos disso.',
  'interessante seu ponto de vista.',
  'rs, boa!',
  'e o modem ai, esta firme?',
  'passando otimo dia por aqui na central.',
];

module.exports = {
  code: '07',
  title: 'BATE-PAPO',
  expectsText: true,
  onEnter(ctx) {
    if (!ctx.vars.chat) {
      ctx.vars.chat = {
        log: [{ de: 'SALA', texto: 'Voce entrou na sala VIDEOTEXTO.' }],
      };
    }
  },
  onInput(ctx) {
    const texto = (ctx.inputText || '').trim();
    if (!texto) return;
    const log = ctx.vars.chat.log;
    log.push({ de: ctx.userName || 'VOCE', texto: texto.slice(0, 30) });
    const resposta = RESPOSTAS[Math.floor(Math.random() * RESPOSTAS.length)];
    log.push({ de: 'ROBO-SALA', texto: resposta });
    while (log.length > 9) log.shift();
  },
  render(screen, ctx) {
    const log = (ctx.vars.chat && ctx.vars.chat.log) || [];

    screen.clear().reset();
    drawHeader(screen, 'BATE-PAPO');

    screen.goto(2, 1); screen.fg(6);
    screen.print('SALA UNICA - conversa simulada local');
    screen.hr(3, 1, 38, 4);

    log.slice(-9).forEach((m, idx) => {
      screen.goto(4 + idx, 1); screen.fg(3);
      screen.print((m.de + ':').padEnd(11).slice(0, 11));
      screen.fg(7);
      screen.print(m.texto.slice(0, 27));
    });

    drawFooter(screen, 'ENVIO=enviar msg   /SUMARIO /GUIA /VOLTA');
  },
};
