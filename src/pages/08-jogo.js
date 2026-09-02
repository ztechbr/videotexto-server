'use strict';

const { drawHeader, drawFooter } = require('./common');

const PERGUNTAS = [
  {
    p: 'Qual e a velocidade classica de modem do Minitel?',
    alts: ['A) 300 bps', 'B) 1200/75 bps', 'C) 56000 bps'],
    certa: 'B',
  },
  {
    p: 'O alfabeto grafico do Videotex tambem e chamado:',
    alts: ['A) G1 / mosaico', 'B) Unicode', 'C) ASCII estendido'],
    certa: 'A',
  },
  {
    p: 'A tela do terminal de Videotexto tem quantas colunas?',
    alts: ['A) 80', 'B) 40', 'C) 25'],
    certa: 'B',
  },
  {
    p: 'Que tecla confirma a digitacao no Minitel/Videotexto?',
    alts: ['A) ENVIO', 'B) DELETE', 'C) TAB'],
    certa: 'A',
  },
  {
    p: 'O Videotexto brasileiro operava sobre qual meio?',
    alts: ['A) Fibra optica', 'B) Linha telefonica', 'C) Radio AM'],
    certa: 'B',
  },
];

module.exports = {
  code: '08',
  title: 'JOGOS E QUIZ',
  expectsText: true,
  onEnter(ctx) {
    if (!ctx.vars.jogo) ctx.vars.jogo = { i: 0, acertos: 0, erros: 0, aviso: '' };
  },
  onInput(ctx) {
    const st = ctx.vars.jogo;
    const resp = (ctx.inputText || '').trim().toUpperCase()[0];
    if (!resp) return;
    const atual = PERGUNTAS[st.i];
    if (resp === atual.certa) {
      st.acertos++;
      st.aviso = 'CORRETO! MANDOU BEM.';
    } else {
      st.erros++;
      st.aviso = `ERRADO. RESPOSTA CERTA: ${atual.certa}`;
    }
    st.i = (st.i + 1) % PERGUNTAS.length;
  },
  render(screen, ctx) {
    const st = ctx.vars.jogo;
    const atual = PERGUNTAS[st.i];

    screen.clear().reset();
    drawHeader(screen, 'QUIZ VIDEOTEXTO');

    screen.goto(2, 1); screen.fg(3);
    screen.print(`ACERTOS: ${st.acertos}   ERROS: ${st.erros}`);

    screen.goto(4, 1); screen.fg(6);
    screen.print(`PERGUNTA ${st.i + 1}/${PERGUNTAS.length}:`);
    screen.goto(5, 1); screen.fg(7);
    screen.print(atual.p.slice(0, 38));

    atual.alts.forEach((alt, idx) => {
      screen.goto(7 + idx, 1); screen.fg(2);
      screen.print(alt);
    });

    if (st.aviso) {
      screen.goto(12, 1); screen.fg(5);
      screen.print(st.aviso.slice(0, 38));
    }

    screen.goto(14, 1); screen.fg(2);
    screen.print('Digite A, B ou C e ENVIO para responder.');

    drawFooter(screen, 'ENVIO=responder   /SUMARIO /GUIA /VOLTA');
  },
};
