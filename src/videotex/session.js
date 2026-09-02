'use strict';

const { Screen } = require('./screen');
const { getPage, HOME_CODE, GUIDE_CODE } = require('../pages');

const MAX_HISTORY = 30;

/**
 * Uma sessao representa uma "conexao" ao servidor de Videotexto,
 * independente do transporte (telnet/TCP ou WebSocket do emulador web).
 * Ela guarda a pagina atual, o historico de navegacao (para RETORNO) e
 * um espaco de variaveis por-servico (para os quadros com estado, como o
 * banco, o correio e o quiz).
 */
class Session {
  constructor({ send, close, userName }) {
    this.send = send;
    this.close = close;
    this.userName = userName || 'VISITANTE';
    this.vars = {};
    this.history = [];
    this.currentCode = null;
  }

  _ctx(extra = {}) {
    return { vars: this.vars, userName: this.userName, ...extra };
  }

  _renderCurrent() {
    const page = getPage(this.currentCode) || getPage(HOME_CODE);
    const screen = new Screen();
    page.render(screen, this._ctx());
    this.send(screen.toBuffer());
  }

  _navigate(code, { pushHistory = true } = {}) {
    const page = getPage(code);
    if (!page) return this._showError(`SERVICO ${code} INEXISTENTE.`);
    if (pushHistory && this.currentCode && this.currentCode !== code) {
      this.history.push(this.currentCode);
      if (this.history.length > MAX_HISTORY) this.history.shift();
    }
    this.currentCode = code;
    if (page.onEnter) page.onEnter(this._ctx());
    this._renderCurrent();
  }

  _showError(msg) {
    const screen = new Screen();
    const page = getPage(this.currentCode) || getPage(HOME_CODE);
    page.render(screen, this._ctx());
    screen.goto(21, 1);
    screen.inverse(true); screen.fg(0); screen.bg(1);
    screen.print((' ' + msg).padEnd(38, ' ').slice(0, 38));
    screen.inverse(false); screen.reset();
    this.send(screen.toBuffer());
  }

  start() {
    this._navigate(HOME_CODE, { pushHistory: false });
  }

  _sayGoodbyeAndClose() {
    const screen = new Screen();
    screen.clear().reset();
    screen.goto(10, 6); screen.fg(6);
    screen.print('CONEXAO ENCERRADA');
    screen.goto(12, 3); screen.fg(7);
    screen.print('Obrigado por visitar o Videotexto Brasil.');
    screen.goto(14, 3);
    screen.print('Ate a proxima conexao!');
    this.send(screen.toBuffer());
    this.close();
  }

  /**
   * Processa um evento de entrada do usuario. Tipos aceitos:
   *   { type: 'SUBMIT', text }  - ENVIO com o conteudo digitado (pode ser vazio)
   *   { type: 'SUITE' }         - tecla CONTINUA
   *   { type: 'RETORNO' }       - tecla VOLTA
   *   { type: 'GUIA' }          - tecla GUIA
   *   { type: 'SUMARIO' }       - tecla SUMARIO (indice)
   *   { type: 'REPETICAO' }     - repete a tela atual
   *   { type: 'FIM' }           - encerra a sessao
   */
  handleEvent(evt) {
    const page = getPage(this.currentCode);

    switch (evt.type) {
      case 'SUITE': {
        if (page && page.next) {
          const target = page.next(this._ctx());
          if (target) return this._navigate(target);
          return this._renderCurrent();
        }
        return this._showError('NAO HA CONTINUACAO NESTA TELA.');
      }
      case 'RETORNO': {
        const prev = this.history.pop();
        return this._navigate(prev || HOME_CODE, { pushHistory: false });
      }
      case 'GUIA':
        return this._navigate(GUIDE_CODE);
      case 'SUMARIO':
        return this._navigate(HOME_CODE);
      case 'REPETICAO':
        return this._renderCurrent();
      case 'FIM':
        return this._sayGoodbyeAndClose();
      case 'SUBMIT':
        return this._handleSubmit(evt.text || '');
      default:
        return this._renderCurrent();
    }
  }

  _handleSubmit(raw) {
    const text = raw.trim();

    // Comandos globais com barra, sempre disponiveis (mesmo em paginas com
    // campo de texto livre).
    const slashCmd = text.match(/^\/(\w+)/);
    if (slashCmd) {
      const w = slashCmd[1].toLowerCase();
      if (['s', 'suite', 'continua'].includes(w)) return this.handleEvent({ type: 'SUITE' });
      if (['r', 'retorno', 'volta'].includes(w)) return this.handleEvent({ type: 'RETORNO' });
      if (['g', 'guia'].includes(w)) return this.handleEvent({ type: 'GUIA' });
      if (['h', 'sumario'].includes(w)) return this.handleEvent({ type: 'SUMARIO' });
      if (['q', 'fim'].includes(w)) return this.handleEvent({ type: 'FIM' });
      return this._showError('COMANDO DESCONHECIDO.');
    }

    if (text === '') return this._renderCurrent();

    // Navegacao direta por codigo de servico (duas ou mais casas numericas
    // exatas, exatamente como discar um codigo real de Videotexto).
    if (/^\d+$/.test(text) && getPage(text)) {
      return this._navigate(text);
    }

    const page = getPage(this.currentCode);
    if (page && (page.expectsText || page.onInput)) {
      if (page.onInput) page.onInput(this._ctx({ inputText: text }));
      return this._renderCurrent();
    }

    // Palavras de atalho tambem funcionam sem a barra fora de paginas de texto livre.
    const w = text.toLowerCase();
    if (['s', 'suite', 'continua'].includes(w)) return this.handleEvent({ type: 'SUITE' });
    if (['r', 'retorno', 'volta'].includes(w)) return this.handleEvent({ type: 'RETORNO' });
    if (['g', 'guia'].includes(w)) return this.handleEvent({ type: 'GUIA' });
    if (['h', 'sumario', '*'].includes(w)) return this.handleEvent({ type: 'SUMARIO' });
    if (['q', 'fim'].includes(w)) return this.handleEvent({ type: 'FIM' });

    return this._showError('CODIGO INVALIDO. DIGITE G PARA O GUIA.');
  }
}

module.exports = { Session };
