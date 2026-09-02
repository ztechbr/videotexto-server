'use strict';

const { drawHeader, drawFooter } = require('./common');

module.exports = {
  code: '06',
  title: 'BANCO VIDEOTEXTO',
  expectsText: true,
  onEnter(ctx) {
    if (!ctx.vars.banco) {
      ctx.vars.banco = {
        saldo: 15000.00,
        extrato: [
          'SALDO INICIAL DE DEMONSTRACAO',
        ],
        aviso: '',
      };
    }
  },
  onInput(ctx) {
    const st = ctx.vars.banco;
    const linha = (ctx.inputText || '').trim().toUpperCase();
    const partes = linha.split(/\s+/);
    const cmd = partes[0];
    const valor = parseFloat((partes[1] || '').replace(',', '.'));

    if (cmd === 'SAQUE' && !isNaN(valor) && valor > 0) {
      if (valor > st.saldo) {
        st.aviso = 'SALDO INSUFICIENTE.';
      } else {
        st.saldo -= valor;
        st.extrato.push(`SAQUE .......... - R$ ${valor.toFixed(2)}`);
        st.aviso = 'SAQUE REALIZADO COM SUCESSO.';
      }
    } else if (cmd === 'DEPOSITO' && !isNaN(valor) && valor > 0) {
      st.saldo += valor;
      st.extrato.push(`DEPOSITO ....... + R$ ${valor.toFixed(2)}`);
      st.aviso = 'DEPOSITO REALIZADO COM SUCESSO.';
    } else if (linha) {
      st.aviso = 'COMANDO INVALIDO. VEJA EXEMPLOS ABAIXO.';
    }
    while (st.extrato.length > 6) st.extrato.shift();
  },
  render(screen, ctx) {
    const st = ctx.vars.banco;

    screen.clear().reset();
    drawHeader(screen, 'BANCO VIDEOTEXTO');

    screen.goto(2, 1); screen.fg(6);
    screen.print('CONTA CORRENTE DE DEMONSTRACAO');

    screen.goto(4, 1); screen.fg(7);
    screen.print('SALDO ATUAL:');
    screen.fg(2);
    screen.print(`  R$ ${st.saldo.toFixed(2)}`);

    screen.goto(6, 1); screen.fg(3);
    screen.print('ULTIMAS MOVIMENTACOES:');
    st.extrato.slice(-6).forEach((linha, idx) => {
      screen.goto(7 + idx, 1); screen.fg(7);
      screen.print(linha.slice(0, 36));
    });

    if (st.aviso) {
      screen.goto(15, 1); screen.fg(5);
      screen.print(st.aviso.slice(0, 38));
    }

    screen.goto(17, 1); screen.fg(2);
    screen.print('Comandos: SAQUE 100  /  DEPOSITO 100');

    drawFooter(screen, 'ENVIO=comando   /SUMARIO /GUIA /VOLTA');
  },
};
