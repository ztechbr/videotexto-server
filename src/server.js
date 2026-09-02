'use strict';

const { startTelnetServer } = require('./net/telnetServer');
const { startWebServer } = require('./net/webServer');

const TELNET_PORT = parseInt(process.env.TELNET_PORT || '3615', 10);
const HTTP_PORT = parseInt(process.env.PORT || process.env.HTTP_PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

console.log('================================================');
console.log(' SERVIDOR DE VIDEOTEXTO BRASIL - iniciando...');
console.log('================================================');

startTelnetServer(TELNET_PORT, HOST);
startWebServer(HTTP_PORT, HOST);

process.on('SIGTERM', () => {
  console.log('Encerrando servidor de Videotexto (SIGTERM).');
  process.exit(0);
});
