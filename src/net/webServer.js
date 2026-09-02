'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { Session } = require('../videotex/session');

const WEB_DIR = path.join(__dirname, '..', '..', 'web');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.normalize(path.join(WEB_DIR, reqPath));

  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403); res.end('Proibido');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Pagina nao encontrada no terminal de Videotexto.');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function startWebServer(port, host = '0.0.0.0') {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
      return;
    }
    serveStatic(req, res);
  });

  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const session = new Session({
      send: (buf) => { if (ws.readyState === ws.OPEN) ws.send(buf, { binary: true }); },
      close: () => ws.close(),
      userName: `VISITANTE-${req.socket.remotePort}`,
    });

    session.start();

    ws.on('message', (data) => {
      let evt;
      try {
        evt = JSON.parse(data.toString('utf8'));
      } catch (e) {
        return;
      }
      session.handleEvent(evt);
    });

    ws.on('close', () => session.disconnect());
    ws.on('error', () => {});
  });

  server.listen(port, host, () => {
    console.log(`[web] emulador e WebSocket em http://${host}:${port} (rota /ws)`);
  });

  return server;
}

module.exports = { startWebServer };
