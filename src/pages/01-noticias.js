'use strict';

const { drawHeader, drawFooter } = require('./common');

const EDICOES = [
  {
    titulo: 'REDE VIDEOTEXTO CHEGA A NOVAS CIDADES',
    corpo: [
      'A rede experimental de Videotexto amplia',
      'seus terminais publicos em mais capitais.',
      'Usuarios acessam servicos de informacao',
      'discando um numero local e digitando o',
      'codigo do servico desejado na tela.',
    ],
  },
  {
    titulo: 'BANCOS TESTAM EXTRATO POR VIDEOTEXTO',
    corpo: [
      'Instituicoes financeiras iniciam testes',
      'de consulta de saldo e extrato via',
      'terminal de Videotexto, dispensando a',
      'ida ate a agencia para servicos simples.',
    ],
  },
  {
    titulo: 'MODEM DE 1200/75 BAUD E NOVIDADE',
    corpo: [
      'Terminais domesticos comecam a usar',
      'modems assimetricos: 1200 bps para',
      'receber a tela e 75 bps para o teclado,',
      'suficiente para a natureza do servico.',
    ],
  },
  {
    titulo: 'CLASSIFICADOS ELETRONICOS FAZEM SUCESSO',
    corpo: [
      'Sessao de classificados do Videotexto',
      'reduz o tempo entre anuncio e resposta,',
      'com atualizacao quase imediata da',
      'central de dados do servico.',
    ],
  },
];

module.exports = {
  code: '01',
  title: 'NOTICIAS',
  onEnter(ctx) { ctx.vars.noticias = { i: 0 }; },
  next(ctx) {
    const st = ctx.vars.noticias || (ctx.vars.noticias = { i: 0 });
    st.i = (st.i + 1) % EDICOES.length;
    return null; // permanece na mesma pagina, apenas avanca a edicao
  },
  render(screen, ctx) {
    const st = ctx.vars.noticias || (ctx.vars.noticias = { i: 0 });
    const ed = EDICOES[st.i];

    screen.clear().reset();
    drawHeader(screen, 'JORNAL ELETRONICO');

    screen.goto(2, 1); screen.fg(3);
    screen.print(`EDICAO ${st.i + 1}/${EDICOES.length}`);

    screen.goto(4, 1); screen.fg(6); screen.inverse(true);
    screen.print(' ' + ed.titulo.padEnd(38, ' ').slice(0, 38) + ' ');
    screen.inverse(false); screen.reset();

    ed.corpo.forEach((linha, idx) => {
      screen.goto(6 + idx, 1); screen.fg(7);
      screen.print(linha);
    });

    screen.goto(18, 1); screen.fg(2);
    screen.print('(manchetes ficticias, apenas demonstracao)');

    drawFooter(screen, 'S=PROX.EDICAO  H=SUMARIO  G=GUIA  R=VOLTA');
  },
};
