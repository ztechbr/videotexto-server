'use strict';

const { drawHeader, drawFooter } = require('./common');

const CATEGORIAS = [
  {
    nome: 'VEICULOS',
    anuncios: [
      'FUSCA 1978, motor revisado, unico dono.',
      'VENDO MOTO 125cc, pouco rodada, doc. ok.',
      'TROCO KOMBI POR CARRO DE PASSEIO.',
    ],
  },
  {
    nome: 'IMOVEIS',
    anuncios: [
      'ALUGA-SE APTO 2 QTOS, CENTRO, PROX. METRO.',
      'VENDE-SE CHACARA COM POMAR E POCO ARTESIANO.',
      'SALA COMERCIAL 30M2, PRONTA P/ USO.',
    ],
  },
  {
    nome: 'EMPREGOS',
    anuncios: [
      'PRECISA-SE DE DIGITADOR(A) COM EXPERIENCIA.',
      'OPERADOR DE TELEX - TURNO NOITE.',
      'TECNICO EM ELETRONICA PARA ASSIST. TECNICA.',
    ],
  },
  {
    nome: 'DIVERSOS',
    anuncios: [
      'VENDO ENCICLOPEDIA COMPLETA, 20 VOLUMES.',
      'COMPRO SELOS E MOEDAS ANTIGAS.',
      'AULAS PARTICULARES DE DATILOGRAFIA.',
    ],
  },
];

module.exports = {
  code: '04',
  title: 'CLASSIFICADOS',
  onEnter(ctx) { ctx.vars.classificados = { i: 0 }; },
  next(ctx) {
    const st = ctx.vars.classificados || (ctx.vars.classificados = { i: 0 });
    st.i = (st.i + 1) % CATEGORIAS.length;
    return null;
  },
  render(screen, ctx) {
    const st = ctx.vars.classificados || (ctx.vars.classificados = { i: 0 });
    const cat = CATEGORIAS[st.i];

    screen.clear().reset();
    drawHeader(screen, 'CLASSIFICADOS');

    screen.goto(2, 1); screen.fg(3);
    screen.print(`CATEGORIA: ${cat.nome} (${st.i + 1}/${CATEGORIAS.length})`);
    screen.hr(3, 1, 38, 4);

    cat.anuncios.forEach((linha, idx) => {
      screen.goto(5 + idx * 2, 1); screen.fg(6);
      screen.print('> ');
      screen.fg(7);
      screen.print(linha.slice(0, 36));
    });

    screen.goto(19, 1); screen.fg(2);
    screen.print('(anuncios ficticios, apenas demonstracao)');

    drawFooter(screen, 'S=PROX.CATEGORIA  H=SUMARIO  G=GUIA  R=VOLTA');
  },
};
