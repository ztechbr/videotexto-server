'use strict';

const { drawHeader, drawFooter } = require('./common');

const MAX_LOG = 12;

/**
 * Estado do bate-papo. Ao contrario de `ctx.vars` (que e privado por
 * conexao), este objeto vive no escopo do modulo - como o modulo e
 * carregado uma unica vez pelo Node, TODAS as sessoes leem e escrevem
 * o mesmo `sala`, e por isso enxergam as mesmas mensagens. Quem garante
 * que a tela de cada participante seja atualizada na hora (sem precisar
 * apertar ENVIO) e o broadcast de sala em `session.js`.
 */
const sala = {
  log: [{ de: 'SALA', texto: 'Bate-papo publico do Videotexto Brasil.' }],
};

function registrar(de, texto) {
  sala.log.push({ de, texto: texto.slice(0, 32) });
  while (sala.log.length > MAX_LOG) sala.log.shift();
}

module.exports = {
  code: '07',
  title: 'BATE-PAPO',
  expectsText: true,
  room: 'chat', // sala compartilhada - ver session.js (joinRoom/broadcastRoom)

  onEnter(ctx) {
    registrar('SALA', `${ctx.userName} entrou na sala.`);
  },

  onLeave(ctx) {
    registrar('SALA', `${ctx.userName} saiu da sala.`);
  },

  onInput(ctx) {
    const texto = (ctx.inputText || '').trim();
    if (!texto) return;
    registrar(ctx.userName, texto);
  },

  render(screen, ctx) {
    screen.clear().reset();
    drawHeader(screen, 'BATE-PAPO');

    screen.goto(2, 1); screen.fg(6);
    screen.print(`SALA UNICA - ${ctx.roomSize} pessoa(s) conectada(s)`);
    screen.hr(3, 1, 38, 4);

    sala.log.slice(-9).forEach((m, idx) => {
      screen.goto(4 + idx, 1); screen.fg(3);
      screen.print((m.de + ':').padEnd(11).slice(0, 11));
      screen.fg(7);
      screen.print(m.texto.slice(0, 27));
    });

    screen.goto(20, 1); screen.fg(2);
    screen.print('Chat real e ao vivo: quem estiver aqui ve');
    screen.goto(21, 1);
    screen.print('sua mensagem na hora, sem precisar repetir.');

    drawFooter(screen, 'ENVIO=enviar msg   /SUMARIO /GUIA /VOLTA');
  },
};
