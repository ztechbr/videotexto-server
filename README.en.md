# Videotexto Brasil — Minitel / Videotex Server

*Leia em [português](README.md).*

*Written the way an old engineer would explain it — one who spent the
1980s keeping switching centers and Videotexto terminals alive, back
when Brazil ran its own cousin of the French Minitel. Pull up a chair,
we're powering up the central office.*

This is a complete **Videotexto/Minitel server** written in Node.js
that speaks the same protocol dialect real Minitel/Videotex terminals
used: direct cursor addressing, 8-color text/background, the G0/G1
(mosaic) character sets, and accented characters built through
diacritic composition. It was born out of admiration for
[minitel-server](https://github.com/BwanaFr/minitel-server) by BwanaFr
(Python/Pynitel, port 3615) — this is a from-scratch Node.js rewrite,
with its own set of "pages" (called *quadros*/frames in the original
Brazilian service) full of examples in the spirit of the Videotexto
services that ran in Brazil in the early 1980s (Embratel/Telesp):
an electronic newspaper, weather forecast, and horoscope **backed by
real, live data**, classifieds, electronic mail, a simulated bank, a
**genuine multi-user chat** (single shared room, messages broadcast to
everyone connected in real time), games, a sports page with real data
(Brazilian league standings, Formula 1) illustrated with classic
mosaic-block graphics, and mosaic-art demos — including a converter
that turns real PNG/JPEG/GIF images into Videotex mosaic blocks.

It serves the exact same content through **two front doors**:

1. **Telnet/TCP port** (default `3615`, a nod to the French dialing
   code) — for real telnet clients, or for a serial-to-TCP bridge
   wired up to a physical Minitel/Videotexto terminal.
2. **Browser-based terminal emulator**, served over HTTP/WebSocket
   (default port `8080`) — a "Minitel" drawn on an HTML `<canvas>`
   that decodes the exact same protocol byte stream. This is the
   quickest way to try everything right after you deploy, with no
   telnet client or vintage hardware required.

---

## 1. How the protocol works (technical summary)

The server sends a byte stream per connection, exactly as a real
Videotex/Minitel terminal would expect over a serial line:

| Byte(s)                              | Meaning                                                   |
|----------------------------------------|-------------------------------------------------------------|
| `0x0C`                                | Clear the whole screen (Form Feed) and home the cursor      |
| `0x1F row col`                        | Direct cursor addressing (PDC)                              |
| `0x0E` / `0x0F`                        | Switch to G1 (mosaic) / G0 (text) character set             |
| `0x11` / `0x14`                        | Cursor visible on / off                                     |
| `ESC 0x40..0x47`                       | Text color (0=black ... 7=white)                            |
| `ESC 0x50..0x57`                       | Background color                                            |
| `ESC 0x48` / `0x49`                    | Blink on / off                                               |
| `ESC 0x5A` / `0x59`                    | Underline on / off                                           |
| `ESC 0x5D` / `0x5C`                    | Inverse video on / off                                       |
| `ESC 0x4C..0x4F`                       | Size: normal / double-height / double-width / both           |
| `ESC 0x4A,0x4B,0x58,0x5B,0x5E,0x5F`    | Accent composition (grave, acute, circumflex, tilde, trema, cedilla) + base letter |
| `0x20-0x7E` in G0                      | Regular text character (ASCII)                               |
| `0x20-0x5F` in G1                      | Mosaic cell: the byte's 6 bits define the 6 "sub-pixels" (2 columns x 3 rows) of the cell |

This is the **exact same subset** used for both telnet and the web
emulator — there's no separate "web-only" format. If you plug in a
real Minitel (through a serial/modem-to-TCP bridge), it should
understand most of this stream too, since it follows the spirit of the
real STUM1B/Teletel protocol (this is **not** a fully certified
implementation of the French standard or of the official Brazilian
Embratel/Telesp protocol — it's a simplified, educational subset built
for teaching and demonstration).

### Navigation (same scheme over telnet and in the browser)

| Key / command            | Action                                                |
|----------------------------|----------------------------------------------------------|
| `NN` + ENVIO (send)        | Jump straight to service code `NN` (e.g. `01`)           |
| `S` / CONTINUA (continue)  | Next screen / next edition within a service               |
| `R` / RETORNO (back)       | Go back to the previous screen (history)                  |
| `G` / GUIA (guide)         | Show the usage guide                                       |
| `H` / SUMÁRIO (summary)    | Go back to the main index                                  |
| Empty ENVIO                | Redraw the current screen                                   |
| `Q` / FIM (end)            | Close the connection (with a goodbye screen)               |

On pages with a free-text field (mail, chat, bank, quiz), anything you
type becomes the field's content — to navigate without leaving text
mode, use the slash commands: `/sumario`, `/guia`, `/volta`,
`/continua`, `/fim`.

---

## 2. Live data and real chat

Three pages fetch real data in the background as soon as the server
boots (and periodically afterward), keeping the last known-good result
in memory — the screen never waits on the network, it always reads the
freshest cached value:

| Page | Real source used | Why |
|---|---|---|
| `01` News | [Google News RSS](https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-BR) (pt-BR) | Public feed, plain text, refreshed every ~20 min |
| `02` Weather | [Open-Meteo](https://open-meteo.com) (public weather API) | Climatempo (the originally requested source) renders its forecast in client-side JavaScript — the HTML a server can fetch doesn't contain the numbers. Open-Meteo serves the same kind of real data as plain JSON |
| `03` Horoscope | [horoscope-app-api](https://horoscope-app-api.vercel.app) + translation via [MyMemory](https://mymemory.translated.net) | Folha/F5's daily horoscope (the originally requested source) is also loaded via client-side JavaScript. We use a real horoscope API instead and machine-translate the text (English → Portuguese) automatically |
| `04` Classifieds | Real average prices published by OLX's own blog ([dicas.olx.com.br](https://dicas.olx.com.br)) | OLX's car search (the originally requested source) returns **HTTP 403** to automated access, on top of loading listings via JavaScript — the honest option is a real, dated snapshot, not a live search |
| `11` Sports | Real snapshot (Brazilian league, Formula 1) written into the code | See the disclaimer in section 7 — not fetched live |

In short: when the original sources (Climatempo, Folha, OLX's search)
only serve data through client-side JavaScript — or block automated
access outright, like OLX — and the server has no browser to work
around that, the honest alternative is either an equivalent real
source that answers plain HTTP, or a real, dated snapshot when no live
equivalent exists. We never fabricate the numbers.

If a source is down, the page shows "CARREGANDO..." (loading, on the
very first boot) or keeps showing the last known-good data, without
ever freezing the terminal.

### Real chat (page `07`)

The chat room is **shared across every active connection** (telnet and
browser clients alike, at the same time) — it's not a local
simulation. When someone joins, leaves, or sends a message, the server
**broadcasts the updated screen to everyone in the room** immediately,
with no need to press ENVIO. It's implemented in `session.js` via a
per-page "room" registry — any page can opt in with `room: 'name'` to
get this behavior.

### Image-to-mosaic converter

`src/videotex/image2mosaic.js` converts a real PNG, JPEG, BMP, or GIF
(first frame) file into genuine Videotex mosaic blocks — each screen
cell becomes a 2x3 sub-pixel block with up to 2 colors from the
protocol's 8-color palette, the same way a Minitel artist would
digitize an image by hand. Page `09` (Mosaic Art, edition 2/2)
demonstrates this live with a sample image at
`assets/sample-logo.png`. Use `imageToMosaic(pathOrBuffer, cols, rows)`
and then `screen.mosaicImage(row, col, cells)` to draw the result.

---

## 3. Running locally (without Docker)

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

This starts:
- the web emulator at `http://localhost:8080`
- the telnet/TCP server at `localhost:3615`

Quick telnet test:

```bash
telnet localhost 3615
```

(On Windows, enable the "Telnet Client" optional feature, or use
PuTTY in Raw/Telnet mode on port 3615.)

Or just open `http://localhost:8080` in your browser — the fastest
way to see the terminal actually working.

Accepted environment variables:

| Variable       | Default    | Description                              |
|----------------|------------|--------------------------------------------|
| `PORT`         | `8080`     | HTTP port (web emulator + WebSocket at `/ws`) |
| `TELNET_PORT`  | `3615`     | Telnet/TCP server port                     |
| `HOST`         | `0.0.0.0`  | Bind address                               |

---

## 4. Running with Docker

```bash
docker build -t videotexto-brasil .
docker run --rm -p 8080:8080 -p 3615:3615 videotexto-brasil
```

Then visit `http://localhost:8080` or `telnet localhost 3615`.

The `Dockerfile` already exposes both ports (`8080` and `3615`), runs
as a non-root user (`node`), and has a `HEALTHCHECK` hitting `/health`.

---

## 5. Deploying to EasyPanel (step by step)

EasyPanel builds the image straight from the `Dockerfile` in this
repository, so the process is direct. This section walks through the
full setup, **including how to open the raw telnet port 3615**.

### 5.1 Deploy the web app (HTTP + WebSocket, port 8080)

1. **Push this project to a Git repository** (GitHub, GitLab, etc.)
   that EasyPanel can access — or use EasyPanel's own upload/monorepo
   deploy option if you prefer.

2. In EasyPanel, create a **new "App" service** and pick **"Dockerfile"**
   as the build source (or "Git" pointing at this repository, with
   "Build Method: Dockerfile").

3. Under **"Build"**, confirm it picked up the `Dockerfile` at the
   project root. No build arguments are needed.

4. Under **"Environment"**, you can leave the defaults, or set:
   - `PORT=8080` (internal HTTP port — no need to change)
   - `TELNET_PORT=3615` (internal telnet port)

5. Under **"Domains"**, attach a domain (or use EasyPanel's free
   subdomain) pointing at **container port 8080** — that's the port
   serving the web emulator, with automatic HTTPS through Traefik.
   This alone is enough to use the entire server from a browser.

6. Click **Deploy**. EasyPanel builds the image, starts the
   container, and once the healthcheck at `/health` returns `OK` the
   service goes live.

7. Open the configured domain — you should see the retro
   "TERMINAL DE VIDEOTEXTO — MODELO BR-82" screen connecting over
   WebSocket. Type `01` and ENVIO to jump straight to the electronic
   newspaper, or `G` for the usage guide.

> **Note on WebSocket behind the proxy:** the WebSocket runs on the
> same HTTP port (`/ws`), so no extra proxy configuration is needed —
> EasyPanel's Traefik already upgrades HTTP connections to WebSocket
> for regular HTTP services automatically.

### 5.2 Opening port 3615 for raw telnet access

The web emulator alone already exposes the whole service — opening
3615 is only needed if you want **real telnet clients**, or a
**serial-to-TCP bridge from a physical Minitel/Videotexto terminal**,
to connect directly, bypassing the browser. EasyPanel's default domain
proxy (Traefik) only understands HTTP/HTTPS/WebSocket, so a raw TCP
port like 3615 has to be published separately, straight to the host:

1. Open your app's service page in EasyPanel and go to the
   **"Advanced"** tab (in some EasyPanel versions this section is
   simply labeled the port-mapping/exposed-ports area of the service —
   the exact tab name has moved between panel versions, so look for
   wherever the panel lets you map a **container port** to a
   **published/host port**).

2. Add a new port mapping with:
   - **Container port:** `3615`
   - **Published/host port:** `3615` (or any free port on the host —
     just remember to use that port number when connecting)
   - **Protocol:** `TCP`

3. Save the mapping and **redeploy** the service so the new port
   mapping takes effect.

4. **Open the port on your server's firewall/security group too.**
   EasyPanel publishing the port on the container is not enough if
   the underlying VPS/cloud firewall still blocks inbound traffic on
   that port:
   - On a typical Linux firewall (ufw): `sudo ufw allow 3615/tcp`
   - On cloud providers (Hetzner, DigitalOcean, AWS, etc.), add an
     inbound rule for TCP port 3615 in the server's firewall/security
     group settings from the provider's dashboard.

5. Test it from your own machine:

   ```bash
   telnet your-server-ip 3615
   ```

   You should immediately see the Videotexto Brasil main menu appear,
   exactly like the web emulator shows.

> **Security note:** port 3615 as implemented here is a plain,
> unauthenticated line-mode TCP service meant for demonstration and
> retro-computing fun — it has no encryption and no login. Treat it
> like you would any other open telnet port: fine for a hobby/demo
> deployment, not something you'd want fronting sensitive data.

> **Note on internet access:** the news, weather, and horoscope pages
> (section 2) fetch real data from external public APIs over outbound
> HTTPS. EasyPanel containers have outbound internet access by
> default, so this usually needs no extra configuration — but if those
> pages get stuck on "CARREGANDO...", check whether the service sits
> behind a firewall/egress policy blocking outbound HTTPS.

---

## 6. Project structure

```
minitel-videotexto-br/
├── Dockerfile
├── package.json
├── assets/
│   └── sample-logo.png        # sample image for the mosaic converter
├── src/
│   ├── server.js              # entry point: starts telnet + web/ws + data cache
│   ├── net/
│   │   ├── telnetServer.js    # raw TCP server (with telnet IAC filtering)
│   │   └── webServer.js       # static HTTP + WebSocket (/ws)
│   ├── videotex/
│   │   ├── constants.js       # control codes, colors, accents
│   │   ├── screen.js          # "Screen": builds a page's byte stream
│   │   ├── session.js         # per-connection state machine + shared rooms
│   │   └── image2mosaic.js    # converts PNG/JPEG/BMP/GIF into mosaic blocks
│   ├── data/                  # background fetching and caching of real data
│   │   ├── cache.js           # generic cache with background refresh
│   │   ├── noticias.js        # Google News RSS
│   │   ├── tempo.js           # Open-Meteo (real weather)
│   │   ├── horoscopo.js       # horoscope-app-api + MyMemory translation
│   │   ├── logo.js            # converts assets/sample-logo.png once, cached
│   │   └── util.js            # HTML unescaping, word wrap, terminal-safe text
│   └── pages/                 # the Videotexto "frames" (content)
│       ├── 00-home.js         # main index
│       ├── 01-noticias.js     # electronic newspaper (real data, multi-edition)
│       ├── 02-tempo.js        # weather forecast (real data)
│       ├── 03-horoscopo.js    # daily horoscope (real data, translated)
│       ├── 04-classificados.js
│       ├── 05-correio.js      # electronic mail (text field)
│       ├── 06-banco.js        # simulated balance/withdraw/deposit
│       ├── 07-batepapo.js     # REAL multi-user chat (shared room)
│       ├── 08-jogo.js         # multiple-choice quiz
│       ├── 09-arte.js         # G1 mosaic art (hand-drawn logo + real PNG converted)
│       ├── 10-cores.js        # color palette and attribute demo
│       ├── 11-esportes.js     # sports page with real data + mosaic graphics
│       ├── sports-art.js      # generates the mosaic drawings (trophy, ball)
│       └── 99-guia.js         # usage guide
└── web/
    ├── index.html             # emulator shell
    ├── minitel.css            # retro terminal styling
    └── minitel-emulator.js    # protocol decoder + canvas + WebSocket
```

### Adding a new page

Every page in `src/pages/` exports an object shaped like this:

```js
module.exports = {
  code: '11',               // 2-digit code the user types
  title: 'MY SERVICE',
  expectsText: false,       // true if the page has a free-text field
  room: undefined,          // optional: a room name (e.g. 'chat') to enable live broadcast
  onEnter(ctx) {},           // optional: runs once when entering the page
  onLeave(ctx) {},           // optional: runs once when leaving (only useful with `room`)
  onInput(ctx) {},           // optional: runs when ENVIO is sent with content
  next(ctx) {},              // optional: what CONTINUA (next) should do
  render(screen, ctx) {
    screen.clear().reset();
    screen.goto(2, 1).fg(6).print('HELLO, VIDEOTEXTO!');
    // ...
  },
};
```

Register the new page in `src/pages/index.js` and it's immediately
navigable both over telnet and in the web emulator.

---

## 7. Credits and disclaimers

- Inspired by [BwanaFr's minitel-server](https://github.com/BwanaFr/minitel-server),
  which in turn builds on Christian Quest's Pynitel work.
- Pages **01** (news), **02** (weather), and **03** (horoscope) show
  real, live data fetched from the public sources listed in section 2
  — everything else (bank statements, quiz questions, etc.) is
  **fictional**, created purely for the didactic demonstration of the
  Videotexto protocol. The real-but-static exceptions are page **04 -
  Classificados** (real average prices published by OLX, not a live
  search — see section 2) and page **11 - Esportes**, whose data
  (Brazilian league standings, Formula 1 championship) was real at the
  time this content was written — a snapshot baked into the code that
  will go stale over time.
- This project implements a **simplified subset** of the
  Videotex/Teletel protocol for educational purposes — it is not a
  certified implementation of the French STUM1B standard, nor of the
  official protocol used by Embratel/Telesp in the 1980s.
- Live/real data credits: Google News RSS ("made available solely
  for... personal, non-commercial use" in a feed reader, per the
  feed's own copyright notice), Open-Meteo (open weather API),
  horoscope-app-api, MyMemory (machine translation), and the
  dicas.olx.com.br blog (average used-car prices published by OLX
  itself). These are third-party public services outside this
  project's control — they may change or go
  down at any time.
- `src/videotex/image2mosaic.js` uses the [Jimp](https://github.com/jimp-dev/jimp)
  library (MIT) to decode images.

73, and a warm hello from the green-phosphor days. Happy connecting!
