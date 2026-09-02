'use strict';

const { drawHeader, drawFooter } = require('./common');
const { wordWrap } = require('../data/util');
const { cache } = require('../data/noticias');

const POR_EDICAO = 3;

module.exports = {
  code: '01',
  title: 'NOTICIAS',
  onEnter(ctx) { ctx.vars.noticias = { i: 0 }; },
  next(ctx) {
    const dados = cache.get();
    if (!dados) return null;
    const totalEdicoes = Math.ceil(dados.length / POR_EDICAO);
    const st = ctx.vars.noticias || (ctx.vars.noticias = { i: 0 });
    st.i = (st.i + 1) % totalEdicoes;
    return null;
  },
  render(screen, ctx) {
    const dados = cache.get();

    screen.clear().reset();
    drawHeader(screen, 'JORNAL ELETRONICO');

    if (!dados) {
      screen.goto(8, 1); screen.fg(3);
      screen.print('CARREGANDO NOTICIAS AO VIVO...');
      screen.goto(10, 1); screen.fg(7);
      screen.print('O servidor ainda esta buscando as');
      screen.goto(11, 1);
      screen.print('manchetes reais. Tente de novo em instantes.');
      drawFooter(screen);
      return;
    }

    const st = ctx.vars.noticias || (ctx.vars.noticias = { i: 0 });
    const totalEdicoes = Math.ceil(dados.length / POR_EDICAO);
    const pagina = dados.slice(st.i * POR_EDICAO, st.i * POR_EDICAO + POR_EDICAO);

    screen.goto(2, 1); screen.fg(3);
    screen.print(`EDICAO ${st.i + 1}/${totalEdicoes} - AO VIVO`);

    let row = 4;
    pagina.forEach((titulo) => {
      screen.goto(row, 1); screen.fg(6);
      screen.print('>');
      screen.fg(7);
      const linhas = wordWrap(titulo, 36);
      linhas.slice(0, 4).forEach((linha, idx) => {
        screen.goto(row, 3);
        screen.print(linha);
        row++;
      });
      row++;
    });

    screen.goto(21, 1); screen.fg(2);
    screen.print('Fonte: Google Noticias (RSS publico).');

    drawFooter(screen, 'S=PROX.EDICAO  H=SUMARIO  G=GUIA  R=VOLTA');
  },
};
