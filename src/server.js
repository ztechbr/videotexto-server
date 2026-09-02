'use strict';

const { startTelnetServer } = require('./net/telnetServer');
const { startWebServer } = require('./net/webServer');
const noticiasData = require('./data/noticias');
const tempoData = require('./data/tempo');
const horoscopoData = require('./data/horoscopo');
const logoData = require('./data/logo');

const TELNET_PORT = parseInt(process.env.TELNET_PORT || '3615', 10);
const HTTP_PORT = parseInt(process.env.PORT || process.env.HTTP_PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

console.log('================================================');
console.log(' SERVIDOR DE VIDEOTEXTO BRASIL - iniciando...');
console.log('================================================');

startTelnetServer(TELNET_PORT, HOST);
startWebServer(HTTP_PORT, HOST);

console.log('[dados] buscando noticias, tempo e horoscopo reais em segundo plano...');
noticiasData.cache.startBackgroundRefresh();
tempoData.cache.startBackgroundRefresh();
horoscopoData.cache.startBackgroundRefresh();
logoData.cache.startBackgroundRefresh();

process.on('SIGTERM', () => {
  console.log('Encerrando servidor de Videotexto (SIGTERM).');
  process.exit(0);
});
