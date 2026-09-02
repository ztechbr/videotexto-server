'use strict';

const { drawHeader, drawFooter } = require('./common');
const { BOLA, TROFEU } = require('./sports-art');

const DATA_REF = '02/09/2026';
const ICON_COL = 29; // reservado para o desenho em mosaico; texto nao deve passar disso

const EDICOES = [
  {
    titulo: 'BRASILEIRAO SERIE A - TOP 6',
    icon: 'trofeu',
    tabela: [
      ['1 PALMEIRAS', '51 PTS'],
      ['2 FLAMENGO', '45 PTS'],
      ['3 ATHLETICO-PR', '44 PTS'],
      ['4 FLUMINENSE', '41 PTS'],
      ['5 CRUZEIRO', '39 PTS'],
      ['6 BAHIA', '37 PTS'],
    ],
    obs: 'Flamengo tem 1 jogo a menos.',
  },
  {
    titulo: 'BASTIDORES DO FUTEBOL',
    icon: 'bola',
    texto: [
      'CRUZEIRO CAI NA COPA DO',
      'BRASIL, apos a queda na',
      'Libertadores; Jardim',
      'deixa o cargo de tecnico.',
      '',
      'GREMIO contrata Luis Castro',
      'BRAGANTINO renova com',
      'Vagner Mancini.',
    ],
  },
  {
    titulo: 'FORMULA 1 - PILOTOS',
    icon: 'bandeira',
    tabela: [
      ['1 ANTONELLI', '242'],
      ['2 RUSSELL', '183'],
      ['3 HAMILTON', '183'],
      ['4 NORRIS', '159'],
      ['5 LECLERC', '155'],
      ['6 VERSTAPPEN', '112'],
    ],
    obs: 'Apos o GP dos Paises Baixos (12a etapa).',
  },
  {
    titulo: 'FORMULA 1 - CONSTRUTORES',
    icon: 'bandeira',
    tabela: [
      ['1 MERCEDES', '425'],
      ['2 FERRARI', '338'],
      ['3 MCLAREN', '263'],
      ['4 RED BULL', '186'],
      ['5 RACING BULLS', '66'],
    ],
  },
];

function drawIcon(screen, icon) {
  if (icon === 'trofeu') screen.mosaicArt(5, ICON_COL, TROFEU, 3, 0);
  else if (icon === 'bola') screen.mosaicArt(5, ICON_COL, BOLA, 7, 0);
  else if (icon === 'bandeira') screen.checkerboard(5, ICON_COL, 8, 4, 0, 7);
}

module.exports = {
  code: '11',
  title: 'ESPORTES',
  onEnter(ctx) { ctx.vars.esportes = { i: 0 }; },
  next(ctx) {
    const st = ctx.vars.esportes || (ctx.vars.esportes = { i: 0 });
    st.i = (st.i + 1) % EDICOES.length;
    return null;
  },
  render(screen, ctx) {
    const st = ctx.vars.esportes || (ctx.vars.esportes = { i: 0 });
    const ed = EDICOES[st.i];

    screen.clear().reset();
    drawHeader(screen, 'ESPORTES');

    screen.checkerboard(1, 0, 40, 1, 2, 0);

    screen.goto(2, 1); screen.fg(3);
    screen.print(`EDICAO ${st.i + 1}/${EDICOES.length}`);

    screen.goto(3, 1); screen.fg(6); screen.inverse(true);
    screen.print(' ' + ed.titulo.padEnd(38, ' ').slice(0, 38) + ' ');
    screen.inverse(false); screen.reset();

    if (ed.tabela) {
      ed.tabela.forEach((linha, idx) => {
        screen.goto(5 + idx, 1); screen.fg(3);
        screen.print(linha[0].padEnd(13).slice(0, 13));
        screen.fg(7);
        screen.print(linha[1].slice(0, 10));
      });
    } else if (ed.texto) {
      ed.texto.forEach((linha, idx) => {
        screen.goto(5 + idx, 1); screen.fg(7);
        screen.print(linha.slice(0, ICON_COL - 2));
      });
    }

    drawIcon(screen, ed.icon);

    if (ed.obs) {
      screen.goto(12, 1); screen.fg(2);
      screen.print(ed.obs.slice(0, 38));
    }

    screen.checkerboard(20, 0, 40, 1, 2, 0);

    screen.goto(21, 1); screen.fg(2);
    screen.print(`Dados reais de esportes, referencia ${DATA_REF}.`.slice(0, 38));
    screen.goto(22, 1);
    screen.print('Sujeitos a mudanca apos novas rodadas.');

    drawFooter(screen, 'S=PROX.EDICAO  H=SUMARIO  G=GUIA  R=VOLTA');
  },
};
