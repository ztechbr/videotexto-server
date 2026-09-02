'use strict';

const { drawHeader, drawFooter } = require('./common');

const SIGNOS = [
  'ARIES', 'TOURO', 'GEMEOS', 'CANCER', 'LEAO', 'VIRGEM',
  'LIBRA', 'ESCORPIAO', 'SAGITARIO', 'CAPRICORNIO', 'AQUARIO', 'PEIXES',
];

const FRASES = [
  'dia favoravel para decisoes rapidas.',
  'evite discussoes desnecessarias hoje.',
  'boas noticias chegam por carta ou telex.',
  'momento de cuidar das financas com calma.',
  'uma amizade antiga pode reaparecer.',
  'confie na sua intuicao nos negocios.',
  'otimo dia para reencontros em familia.',
  'paciencia sera sua maior aliada agora.',
  'oportunidade de trabalho no horizonte.',
  'cuide da saude e descanse um pouco mais.',
  'viagem curta traz boas surpresas.',
  'e hora de organizar o que ficou pendente.',
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

module.exports = {
  code: '03',
  title: 'HOROSCOPO',
  render(screen) {
    const today = new Date().toISOString().slice(0, 10);

    screen.clear().reset();
    drawHeader(screen, 'HOROSCOPO DO DIA');

    screen.goto(2, 1); screen.fg(6);
    screen.print(`PREVISOES PARA ${today}`);

    SIGNOS.forEach((signo, i) => {
      const row = 4 + i * 1;
      const frase = FRASES[hash(today + signo) % FRASES.length];
      screen.goto(row, 1); screen.fg(5);
      screen.print(signo.padEnd(13));
      screen.fg(7);
      screen.print(frase.slice(0, 26));
    });

    screen.goto(17, 1); screen.fg(2);
    screen.print('(entretenimento, sem qualquer base cientifica)');

    drawFooter(screen);
  },
};
