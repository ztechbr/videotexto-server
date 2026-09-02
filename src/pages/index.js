'use strict';

const home = require('./00-home');
const noticias = require('./01-noticias');
const tempo = require('./02-tempo');
const horoscopo = require('./03-horoscopo');
const classificados = require('./04-classificados');
const correio = require('./05-correio');
const banco = require('./06-banco');
const batepapo = require('./07-batepapo');
const jogo = require('./08-jogo');
const arte = require('./09-arte');
const cores = require('./10-cores');
const esportes = require('./11-esportes');
const guia = require('./99-guia');

const PAGES = [home, noticias, tempo, horoscopo, classificados, correio, banco, batepapo, jogo, arte, cores, esportes, guia];

const REGISTRY = new Map(PAGES.map((p) => [p.code, p]));

const HOME_CODE = home.code;
const GUIDE_CODE = guia.code;

function getPage(code) {
  return REGISTRY.get(code);
}

module.exports = { PAGES, getPage, HOME_CODE, GUIDE_CODE };
