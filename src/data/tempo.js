'use strict';

const { createCache } = require('./cache');

// Fonte: Open-Meteo (https://open-meteo.com), API publica e gratuita.
// A Climatempo foi a fonte pedida originalmente, mas sua previsao e
// renderizada em Javascript no navegador - o HTML puro que um servidor
// consegue buscar nao contem os numeros. Open-Meteo entrega os mesmos
// dados meteorologicos reais em JSON, direto, sem precisar de navegador.
const CIDADES = [
  { nome: 'SAO PAULO', lat: -23.5505, lon: -46.6333 },
  { nome: 'RIO DE JANEIRO', lat: -22.9068, lon: -43.1729 },
  { nome: 'BELO HORIZONTE', lat: -19.9167, lon: -43.9345 },
  { nome: 'PORTO ALEGRE', lat: -30.0346, lon: -51.2177 },
  { nome: 'SALVADOR', lat: -12.9714, lon: -38.5014 },
  { nome: 'BRASILIA', lat: -15.7939, lon: -47.8828 },
  { nome: 'MANAUS', lat: -3.1190, lon: -60.0217 },
  { nome: 'CURITIBA', lat: -25.4284, lon: -49.2733 },
];

// Codigos de tempo WMO (padrao usado pelo Open-Meteo) -> descricao em portugues.
const WMO = {
  0: 'CEU LIMPO', 1: 'POUCAS NUVENS', 2: 'PARC. NUBLADO', 3: 'NUBLADO',
  45: 'NEBLINA', 48: 'NEBLINA GELADA',
  51: 'GAROA LEVE', 53: 'GAROA', 55: 'GAROA FORTE',
  56: 'GAROA GELADA', 57: 'GAROA GELADA FORTE',
  61: 'CHUVA LEVE', 63: 'CHUVA', 65: 'CHUVA FORTE',
  66: 'CHUVA GELADA', 67: 'CHUVA GELADA FORTE',
  71: 'NEVE LEVE', 73: 'NEVE', 75: 'NEVE FORTE', 77: 'GRANIZO FINO',
  80: 'PANCADAS LEVES', 81: 'PANCADAS DE CHUVA', 82: 'PANCADAS FORTES',
  85: 'PANCADAS DE NEVE', 86: 'PANCADAS DE NEVE FORTES',
  95: 'TROVOADA', 96: 'TROVOADA C/ GRANIZO', 99: 'TEMPESTADE FORTE',
};

function condicao(code) {
  return WMO[code] || 'INDEFINIDO';
}

async function fetchTempo() {
  const lat = CIDADES.map((c) => c.lat).join(',');
  const lon = CIDADES.map((c) => c.lon).join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=America%2FSao_Paulo&forecast_days=1`;

  const res = await fetch(url, { headers: { 'User-Agent': 'VideotextoBrasil/1.0' } });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length !== CIDADES.length) throw new Error('resposta inesperada');

  return CIDADES.map((cidade, i) => {
    const d = data[i];
    return {
      nome: cidade.nome,
      atual: Math.round(d.current.temperature_2m),
      min: Math.round(d.daily.temperature_2m_min[0]),
      max: Math.round(d.daily.temperature_2m_max[0]),
      condicao: condicao(d.current.weather_code),
    };
  });
}

const cache = createCache({
  label: 'previsao do tempo (Open-Meteo)',
  fetcher: fetchTempo,
  ttlMs: 30 * 60 * 1000, // 30 minutos
});

module.exports = { cache };
