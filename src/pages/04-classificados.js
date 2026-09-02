'use strict';

const { drawHeader, drawFooter } = require('./common');

/**
 * A OLX bloqueia acesso automatizado (403) e, de qualquer forma, os
 * anuncios individuais so aparecem depois de Javascript rodar no
 * navegador - o HTML puro que um servidor consegue buscar nao traz
 * nenhum anuncio (so 1 ocorrencia de "R$" numa pagina de 1,7 MB).
 *
 * Em vez de inventar anuncios ficticios, os precos abaixo sao REAIS:
 * vieram do proprio blog da OLX (dicas.olx.com.br), que publica
 * precos medios de carros usados por faixa de valor. Nao e uma busca
 * ao vivo (nao ha vendedor/cidade reais por tras de cada linha), mas
 * os numeros sao dados genuinos publicados pela OLX nas datas citadas.
 */
const EDICOES = [
  {
    titulo: 'CARROS ATE R$ 20.000',
    fonte: 'OLX, abr/2023',
    itens: [
      ['CHEVROLET CELTA', 'DESDE R$ 19.999'],
      ['CHEVROLET CORSA', 'DESDE R$ 19.990'],
      ['FORD KA', 'DESDE R$ 20.000'],
      ['RENAULT CLIO', 'DESDE R$ 19.900'],
      ['CITROEN XSARA', 'DESDE R$ 19.000'],
    ],
  },
  {
    titulo: 'CARROS ATE R$ 35.000',
    fonte: 'OLX / tabela FIPE, nov/2024',
    itens: [
      ['FORD KA 2017', 'R$ 34.500'],
      ['VW GOL 2014', 'ATE R$ 35.000'],
      ['RENAULT KWID 2018', 'R$ 33.000'],
      ['NISSAN MARCH 2014', 'R$ 34.386'],
      ['HONDA FIT 2009', 'ATE R$ 35.000'],
      ['RENAULT SANDERO 2015', 'R$ 34.000'],
      ['CHEVROLET CELTA 2014', 'ATE R$ 35.000'],
      ['CITROEN C3 2014', 'R$ 34.000'],
    ],
  },
  {
    titulo: 'CARROS ATE R$ 60.000',
    fonte: 'OLX, mar/2023',
    itens: [
      ['VW GOL', 'R$ 50.580'],
      ['FORD KA', 'R$ 52.979'],
      ['CHEVROLET ONIX', 'R$ 51.797'],
      ['FIAT UNO', 'R$ 44.696'],
      ['FIAT PALIO', 'R$ 32.535'],
      ['RENAULT SANDERO', 'R$ 46.861'],
      ['HYUNDAI HB20', 'R$ 51.711'],
      ['VW FOX', 'R$ 42.543'],
      ['FIAT MOBI', 'R$ 52.018'],
      ['FIAT ARGO', 'R$ 57.297'],
    ],
  },
];

module.exports = {
  code: '04',
  title: 'CLASSIFICADOS',
  onEnter(ctx) { ctx.vars.classificados = { i: 0 }; },
  next(ctx) {
    const st = ctx.vars.classificados || (ctx.vars.classificados = { i: 0 });
    st.i = (st.i + 1) % EDICOES.length;
    return null;
  },
  render(screen, ctx) {
    const st = ctx.vars.classificados || (ctx.vars.classificados = { i: 0 });
    const ed = EDICOES[st.i];

    screen.clear().reset();
    drawHeader(screen, 'CLASSIFICADOS - CARROS');

    screen.goto(2, 1); screen.fg(3);
    screen.print(`${ed.titulo} (${st.i + 1}/${EDICOES.length})`);
    screen.hr(3, 1, 38, 4);

    ed.itens.forEach((item, idx) => {
      screen.goto(4 + idx, 1); screen.fg(6);
      screen.print(item[0].padEnd(23).slice(0, 23));
      screen.fg(2);
      screen.print(item[1]);
    });

    screen.goto(16, 1); screen.fg(2);
    screen.print(`Precos medios REAIS, fonte: ${ed.fonte}.`);
    screen.goto(17, 1);
    screen.print('Nao e uma busca ao vivo na OLX: o site');
    screen.goto(18, 1);
    screen.print('bloqueia acesso automatizado (HTTP 403)');
    screen.goto(19, 1);
    screen.print('e carrega anuncios via Javascript.');

    drawFooter(screen, 'S=PROX.FAIXA  H=SUMARIO  G=GUIA  R=VOLTA');
  },
};
