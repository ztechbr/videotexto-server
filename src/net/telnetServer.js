'use strict';

const net = require('net');
const { Session } = require('../videotex/session');

const IAC = 0xff;

/**
 * Remove sequencias de negociacao Telnet (IAC ...) do fluxo recebido,
 * sem tentar negociar nada com o cliente - suficiente para um `telnet
 * host porta` comum ou para uma ponte serial-para-TCP de um Minitel real.
 */
function stripTelnetIAC(buffer) {
  const out = [];
  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    if (b === IAC) {
      const cmd = buffer[i + 1];
      if (cmd === 0xfb || cmd === 0xfc || cmd === 0xfd || cmd === 0xfe) {
        i += 2; // WILL/WONT/DO/DONT + option
      } else if (cmd === IAC) {
        out.push(IAC); i += 1;
      } else {
        i += 1; // comando simples de 2 bytes
      }
      continue;
    }
    out.push(b);
  }
  return Buffer.from(out);
}

function startTelnetServer(port, host = '0.0.0.0') {
  const server = net.createServer((socket) => {
    socket.setNoDelay(true);
    let lineBuf = '';

    const session = new Session({
      send: (buf) => { if (socket.writable) socket.write(buf); },
      close: () => socket.end(),
      userName: `VISITANTE-${socket.remotePort}`,
    });

    session.start();

    socket.on('data', (chunk) => {
      const clean = stripTelnetIAC(chunk).toString('latin1');
      for (const ch of clean) {
        if (ch === '\r') continue;
        if (ch === '\n') {
          const line = lineBuf;
          lineBuf = '';
          session.handleEvent({ type: 'SUBMIT', text: line });
        } else if (ch === '\b' || ch.charCodeAt(0) === 0x7f) {
          lineBuf = lineBuf.slice(0, -1);
        } else {
          lineBuf += ch;
        }
      }
    });

    socket.on('error', () => {});
  });

  server.listen(port, host, () => {
    console.log(`[telnet] servidor de Videotexto escutando em ${host}:${port}`);
  });

  return server;
}

module.exports = { startTelnetServer };
