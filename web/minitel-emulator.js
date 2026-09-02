/* Emulador web de terminal de Videotexto/Minitel.
 * Decodifica o MESMO fluxo de bytes de protocolo (STUM1B/Teletel-like)
 * que o servidor envia para conexoes telnet/TCP — nao existe um segundo
 * formato "so para a web". */
(function () {
  'use strict';

  const ROWS = 25, COLS = 40;
  const COLOR_RGB = [
    '#000000', '#e6222a', '#2ecc40', '#f4d23c',
    '#3355ee', '#e455e0', '#39c7d6', '#ffffff',
  ];

  const canvas = document.getElementById('tela');
  const ctx = canvas.getContext('2d');
  const cellW = canvas.width / COLS;
  const cellH = canvas.height / ROWS;

  const DIACRITIC_MARK = {
    grave: '`', acute: '´', circ: 'ˆ',
    tilde: '˜', trema: '¨', cedilla: '¸',
  };

  function freshState() {
    return {
      row: 0, col: 0, fg: 7, bg: 0,
      inverse: false, underline: false, blink: false,
      size: 'normal', charset: 'G0', cursorVisible: true,
      pendingDiacritic: null,
    };
  }
  let st = freshState();
  let blinkPhase = true;
  const grid = []; // guarda o ultimo desenho de cada celula, para o pisca-pisca redesenhar

  function clearGrid() {
    for (let r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS; c++) grid[r][c] = null;
    }
  }
  clearGrid();

  function clearScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    clearGrid();
  }

  function paintCellBg(row, col, color) {
    ctx.fillStyle = COLOR_RGB[color];
    ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
  }

  function drawMosaicCell(row, col, mask, fg, bg) {
    grid[row][col] = { type: 'mosaic', mask, fg, bg };
    paintCellBg(row, col, bg);
    ctx.fillStyle = COLOR_RGB[fg];
    const subW = cellW / 2, subH = cellH / 3;
    const bits = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20];
    for (let i = 0; i < 6; i++) {
      if (mask & bits[i]) {
        const dc = i % 2, dr = Math.floor(i / 2);
        ctx.fillRect(col * cellW + dc * subW, row * cellH + dr * subH, subW + 0.5, subH + 0.5);
      }
    }
  }

  function drawTextCell(row, col, char, attrs) {
    grid[row][col] = { type: 'text', char, attrs: { ...attrs } };
    renderTextCell(row, col, char, attrs, blinkPhase);
  }

  function renderTextCell(row, col, char, attrs, showBlink) {
    const x = col * cellW, y = row * cellH;
    const showChar = !attrs.blink || showBlink;
    const fgColor = attrs.inverse ? COLOR_RGB[attrs.bg] : COLOR_RGB[attrs.fg];
    const bgColor = attrs.inverse ? COLOR_RGB[attrs.fg] : COLOR_RGB[attrs.bg];

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, cellW, cellH);

    if (!showChar) return;

    const scaleX = (attrs.size === 'dw' || attrs.size === 'both') ? 2 : 1;
    const scaleY = (attrs.size === 'dh' || attrs.size === 'both') ? 2 : 1;

    ctx.save();
    ctx.translate(x + cellW / 2, y + cellH / 2);
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = fgColor;
    ctx.font = `${Math.floor(cellH * 0.82)}px "VT323", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 0, 1);
    if (attrs.diacritic) {
      ctx.fillText(DIACRITIC_MARK[attrs.diacritic] || '', 0, -cellH * 0.34);
    }
    ctx.restore();

    if (attrs.underline) {
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 1, y + cellH - 2);
      ctx.lineTo(x + cellW - 1, y + cellH - 2);
      ctx.stroke();
    }
  }

  function repaintBlink() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell && cell.type === 'text' && cell.attrs.blink) {
          renderTextCell(r, c, cell.char, cell.attrs, blinkPhase);
        }
      }
    }
  }
  setInterval(() => { blinkPhase = !blinkPhase; repaintBlink(); }, 600);

  function advance() {
    st.col++;
    if (st.col >= COLS) { st.col = 0; st.row = Math.min(ROWS - 1, st.row + 1); }
  }

  function decode(bytes) {
    let i = 0;
    while (i < bytes.length) {
      const b = bytes[i++];
      if (b === 0x0c) { clearScreen(); st = freshState(); continue; }
      if (b === 0x0e) { st.charset = 'G1'; continue; }
      if (b === 0x0f) { st.charset = 'G0'; continue; }
      if (b === 0x11) { st.cursorVisible = true; continue; }
      if (b === 0x14) { st.cursorVisible = false; continue; }
      if (b === 0x0d) { st.col = 0; continue; }
      if (b === 0x0a) { st.row = Math.min(ROWS - 1, st.row + 1); continue; }
      if (b === 0x1f) {
        const rb = bytes[i++], cb = bytes[i++];
        st.row = Math.max(0, Math.min(ROWS - 1, (rb || 0x41) - 0x41));
        st.col = Math.max(0, Math.min(COLS - 1, (cb || 0x41) - 0x41));
        continue;
      }
      if (b === 0x1b) {
        const c = bytes[i++];
        if (c >= 0x40 && c <= 0x47) st.fg = c - 0x40;
        else if (c >= 0x50 && c <= 0x57) st.bg = c - 0x50;
        else if (c === 0x48) st.blink = true;
        else if (c === 0x49) st.blink = false;
        else if (c === 0x5d) st.inverse = true;
        else if (c === 0x5c) st.inverse = false;
        else if (c === 0x5a) st.underline = true;
        else if (c === 0x59) st.underline = false;
        else if (c === 0x4c) st.size = 'normal';
        else if (c === 0x4d) st.size = 'dh';
        else if (c === 0x4e) st.size = 'dw';
        else if (c === 0x4f) st.size = 'both';
        else if (c === 0x4a) st.pendingDiacritic = 'grave';
        else if (c === 0x4b) st.pendingDiacritic = 'acute';
        else if (c === 0x58) st.pendingDiacritic = 'circ';
        else if (c === 0x5b) st.pendingDiacritic = 'tilde';
        else if (c === 0x5e) st.pendingDiacritic = 'trema';
        else if (c === 0x5f) st.pendingDiacritic = 'cedilla';
        continue;
      }
      if (b >= 0x20 && b <= 0x7e) {
        if (st.charset === 'G1') {
          drawMosaicCell(st.row, st.col, b - 0x20, st.fg, st.bg);
        } else {
          drawTextCell(st.row, st.col, String.fromCharCode(b), {
            fg: st.fg, bg: st.bg, inverse: st.inverse, underline: st.underline,
            blink: st.blink, size: st.size, diacritic: st.pendingDiacritic,
          });
          st.pendingDiacritic = null;
        }
        advance();
        continue;
      }
      // byte de controle desconhecido: ignora
    }
  }

  clearScreen();

  // --- conexao WebSocket ---
  const statusEl = document.getElementById('status');
  const typedEl = document.getElementById('typed');
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  let ws;

  function connect() {
    statusEl.textContent = 'conectando...';
    ws = new WebSocket(`${proto}://${location.host}/ws`);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => { statusEl.textContent = 'conectado ao Videotexto Brasil'; };
    ws.onclose = () => {
      statusEl.textContent = 'desconectado — tentando religar em 3s...';
      setTimeout(connect, 3000);
    };
    ws.onerror = () => { statusEl.textContent = 'erro de conexao'; };
    ws.onmessage = (ev) => decode(new Uint8Array(ev.data));
  }
  connect();

  function sendEvent(evt) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(evt));
  }

  function submitTyped() {
    sendEvent({ type: 'SUBMIT', text: typedEl.value });
    typedEl.value = '';
  }

  document.querySelectorAll('.key').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      if (cmd === 'ENVIO') submitTyped();
      else sendEvent({ type: cmd });
      typedEl.focus();
    });
  });

  typedEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitTyped(); }
    else if (e.key === 'Escape') { e.preventDefault(); sendEvent({ type: 'SUMARIO' }); }
    else if (e.key === 'Tab') { e.preventDefault(); sendEvent({ type: 'SUITE' }); }
    else if (e.key === 'F1') { e.preventDefault(); sendEvent({ type: 'GUIA' }); }
    else if (e.key === 'F2') { e.preventDefault(); sendEvent({ type: 'REPETICAO' }); }
    else if (e.key === 'F3') { e.preventDefault(); sendEvent({ type: 'RETORNO' }); }
  });

  typedEl.focus();
})();
