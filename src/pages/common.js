'use strict';

const FOOTER = 'ENVIO=liga H=SUMARIO G=GUIA S=CONTINUA R=VOLTA';

function drawHeader(screen, title) {
  screen.statusLine(` VIDEOTEXTO BRASIL - ${title}`.slice(0, 40));
}

function drawFooter(screen, text = FOOTER) {
  screen.footer(text);
}

function menuItem(screen, row, code, label) {
  screen.goto(row, 1);
  screen.fg(3); screen.print(code);
  screen.fg(7); screen.print('  ' + label);
}

module.exports = { FOOTER, drawHeader, drawFooter, menuItem };
