'use strict';

const { drawHeader, drawFooter } = require('./common');
const { wordWrap } = require('../data/util');
const { cache, SIGNOS } = require('../data/horoscopo');

module.exports = {
  code: '03',
  title: 'HOROSCOPO',
  onEnter(ctx) { ctx.vars.horoscopo = { i: 0 }; },
  next(ctx) {
    const st = ctx.vars.horoscopo || (ctx.vars.horoscopo = { i: 0 });
    st.i = (st.i + 1) % SIGNOS.length;
    return null;
  },
  render(screen, ctx) {
    const dados = cache.get();

    screen.clear().reset();
    drawHeader(screen, 'HOROSCOPO DO DIA');

    if (!dados) {
      screen.goto(8, 1); screen.fg(3);
      screen.print('CARREGANDO HOROSCOPO AO VIVO...');
      screen.goto(10, 1); screen.fg(7);
      screen.print('O servidor ainda esta buscando e');
      screen.goto(11, 1);
      screen.print('traduzindo a previsao real de hoje.');
      screen.goto(12, 1);
      screen.print('Tente de novo em instantes (pode levar');
      screen.goto(13, 1);
      screen.print('ate 1 minuto na primeira vez).');
      drawFooter(screen);
      return;
    }

    const st = ctx.vars.horoscopo || (ctx.vars.horoscopo = { i: 0 });
    const signo = SIGNOS[st.i];
    const texto = dados[signo.pt] || 'Sem previsao disponivel para este signo agora.';
    const hoje = new Date().toISOString().slice(0, 10);

    screen.goto(2, 1); screen.fg(3);
    screen.print(`SIGNO ${st.i + 1}/${SIGNOS.length} - ${hoje} - AO VIVO`);

    screen.goto(4, 1); screen.fg(6); screen.inverse(true);
    screen.print(' ' + signo.pt.padEnd(38, ' ').slice(0, 38) + ' ');
    screen.inverse(false); screen.reset();

    const linhas = wordWrap(texto, 38);
    linhas.slice(0, 13).forEach((linha, idx) => {
      screen.goto(6 + idx, 1); screen.fg(7);
      screen.print(linha);
    });

    screen.goto(20, 1); screen.fg(2);
    screen.print('Fonte: previsao real do dia, traduzida');
    screen.goto(21, 1);
    screen.print('automaticamente do ingles.');

    drawFooter(screen, 'S=PROX.SIGNO  H=SUMARIO  G=GUIA  R=VOLTA');
  },
};
