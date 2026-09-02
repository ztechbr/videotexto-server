'use strict';

/**
 * Códigos de controle do protocolo Videotex (STUM1B / Teletel), o mesmo
 * dialeto usado pelos terminais Minitel e, por licença/derivação, pelos
 * terminais do Videotexto brasileiro (Embratel/Telesp, início dos anos 80).
 *
 * Este servidor implementa um subconjunto fiel do protocolo real:
 * limpeza de tela, endereçamento direto de cursor, cores de 8 posições
 * para texto e fundo, alfabeto G0 (texto) e G1 (semigráfico/mosaico),
 * inversão, sublinhado, pisca-pisca e composição de acentos.
 */

const C0 = {
  NUL: 0x00,
  SO: 0x0E,   // Shift Out  -> ativa o alfabeto G1 (mosaico)
  SI: 0x0F,   // Shift In   -> ativa o alfabeto G0 (texto)
  DC1_CON: 0x11, // Curseur ON  - liga o cursor visível
  DC4_COFF: 0x14, // Curseur OFF - desliga o cursor visível
  BEL: 0x07,
  BS: 0x08,
  LF: 0x0A,
  VT_CLEAR_LINE: 0x0B,
  FF_CLS: 0x0C, // Form Feed -> limpa a tela inteira e volta o cursor para 0,0
  CR: 0x0D,
  CAN: 0x18,
  US: 0x1F, // Unit Separator -> inicia endereçamento direto de cursor (PDC)
  ESC: 0x1B,
};

// Códigos ESC (após 0x1B) do protocolo real de atributos Videotex.
const ESC_ATTR = {
  FG_BASE: 0x40,  // ESC 0x40..0x47 -> cor do caractere (0..7)
  BG_BASE: 0x50,  // ESC 0x50..0x57 -> cor do fundo (0..7)
  BLINK_ON: 0x48,
  BLINK_OFF: 0x49,
  INVERSE_ON: 0x5D,
  INVERSE_OFF: 0x5C,
  UNDERLINE_ON: 0x5A,
  UNDERLINE_OFF: 0x59,
  SIZE_NORMAL: 0x4C,
  SIZE_DOUBLE_HEIGHT: 0x4D,
  SIZE_DOUBLE_WIDTH: 0x4E,
  SIZE_DOUBLE_BOTH: 0x4F,
  // Composição de acentos (diacríticos), no espírito do mecanismo real
  // de acentuação do Videotex, adaptado para o português do Brasil.
  // Atenção: os valores 0x40-0x47 e 0x50-0x57 já são usados para cor de
  // texto/fundo, por isso os diacríticos ocupam as posições livres
  // remanescentes na faixa de atributos (0x4A,0x4B,0x58,0x5B,0x5E,0x5F).
  DIA_GRAVE: 0x4A,     // à
  DIA_ACUTE: 0x4B,     // á é í ó ú
  DIA_CIRCUMFLEX: 0x58,// â ê ô
  DIA_TILDE: 0x5B,     // ã õ
  DIA_TREMA: 0x5E,     // ü
  DIA_CEDILLA: 0x5F,   // ç
};

// Paleta de 8 cores do Videotex/Minitel (idêntica em espírito à ordem CEPT).
const COLORS = {
  PRETO: 0,
  VERMELHO: 1,
  VERDE: 2,
  AMARELO: 3,
  AZUL: 4,
  MAGENTA: 5,
  CIANO: 6,
  BRANCO: 7,
};

const COLOR_RGB = [
  '#000000', // preto
  '#e6222a', // vermelho
  '#2ecc40', // verde
  '#f4d23c', // amarelo
  '#3355ee', // azul
  '#e455e0', // magenta
  '#39c7d6', // ciano
  '#ffffff', // branco
];

const ROWS = 25; // linha 0 = linha de status (protegida), 1..24 = área útil
const COLS = 40;

// Tabela de composição de acentos: caractere Unicode -> [código diacrítico, letra base]
const ACCENT_MAP = {
  'á': [ESC_ATTR.DIA_ACUTE, 'a'], 'é': [ESC_ATTR.DIA_ACUTE, 'e'],
  'í': [ESC_ATTR.DIA_ACUTE, 'i'], 'ó': [ESC_ATTR.DIA_ACUTE, 'o'],
  'ú': [ESC_ATTR.DIA_ACUTE, 'u'],
  'Á': [ESC_ATTR.DIA_ACUTE, 'A'], 'É': [ESC_ATTR.DIA_ACUTE, 'E'],
  'Í': [ESC_ATTR.DIA_ACUTE, 'I'], 'Ó': [ESC_ATTR.DIA_ACUTE, 'O'],
  'Ú': [ESC_ATTR.DIA_ACUTE, 'U'],
  'à': [ESC_ATTR.DIA_GRAVE, 'a'], 'À': [ESC_ATTR.DIA_GRAVE, 'A'],
  'â': [ESC_ATTR.DIA_CIRCUMFLEX, 'a'], 'ê': [ESC_ATTR.DIA_CIRCUMFLEX, 'e'],
  'ô': [ESC_ATTR.DIA_CIRCUMFLEX, 'o'],
  'Â': [ESC_ATTR.DIA_CIRCUMFLEX, 'A'], 'Ê': [ESC_ATTR.DIA_CIRCUMFLEX, 'E'],
  'Ô': [ESC_ATTR.DIA_CIRCUMFLEX, 'O'],
  'ã': [ESC_ATTR.DIA_TILDE, 'a'], 'õ': [ESC_ATTR.DIA_TILDE, 'o'],
  'Ã': [ESC_ATTR.DIA_TILDE, 'A'], 'Õ': [ESC_ATTR.DIA_TILDE, 'O'],
  'ü': [ESC_ATTR.DIA_TREMA, 'u'], 'Ü': [ESC_ATTR.DIA_TREMA, 'U'],
  'ç': [ESC_ATTR.DIA_CEDILLA, 'c'], 'Ç': [ESC_ATTR.DIA_CEDILLA, 'C'],
};

module.exports = { C0, ESC_ATTR, COLORS, COLOR_RGB, ROWS, COLS, ACCENT_MAP };
