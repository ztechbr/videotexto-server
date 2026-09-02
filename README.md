# Videotexto Brasil — Servidor de Videotex/Minitel

*Read in [English](README.en.md).*

*Escrito nos moldes de um engenheiro que passou os anos 80 cuidando de
centrais de comutação e terminais de Videotexto — a versão brasileira
do Minitel francês. Netos, arrumem a poltrona: bora ligar essa central.*

Este é um servidor de **Videotexto** completo, escrito em Node.js, que
fala o mesmo dialeto de protocolo dos terminais Minitel/Videotex reais
(controle de cursor, cores, alfabeto semigráfico G1/mosaico, acentos por
composição de diacríticos). Ele nasceu inspirado no
[minitel-server](https://github.com/BwanaFr/minitel-server) do BwanaFr
(Python/Pynitel, porta 3615) — aqui está reescrito do zero em Node.js,
com um conjunto próprio de "quadros" (páginas) recheados de exemplos
no espírito dos serviços de Videotexto que rodaram no Brasil no início
dos anos 80 (Embratel/Telesp): jornal eletrônico, previsão do tempo,
horóscopo, classificados, correio eletrônico, banco, bate-papo, jogos,
**esportes com dados reais** (Brasileirão, Fórmula 1) ilustrados com
gráficos em blocos mosaico clássicos (troféu, bola, bandeira
quadriculada) e demonstrações de arte em mosaico.

Ele fornece **duas portas de entrada** para o mesmo conteúdo:

1. **Porta telnet/TCP** (padrão `3615`, em homenagem ao número francês) —
   para clientes telnet de verdade, ou para uma ponte serial-para-TCP
   ligada a um terminal Minitel/Videotexto físico.
2. **Emulador de terminal no navegador**, servido por HTTP/WebSocket
   (padrão porta `8080`) — um "Minitel" desenhado em `<canvas>` que
   decodifica exatamente o mesmo fluxo de bytes de protocolo. É a forma
   mais simples de testar tudo assim que você fizer o deploy, sem
   precisar de telnet nem de hardware antigo.

---

## 1. Como o protocolo funciona (resumo técnico)

O servidor manda um fluxo de bytes por conexão, igual a um terminal
Videotex/Minitel real esperaria receber por uma linha serial:

| Byte(s)                    | Significado                                   |
|-----------------------------|------------------------------------------------|
| `0x0C`                      | Limpa a tela inteira (Form Feed) e recolhe o cursor para 0,0 |
| `0x1F row col`               | Endereçamento direto de cursor (PDC)          |
| `0x0E` / `0x0F`              | Ativa alfabeto G1 (mosaico) / G0 (texto)      |
| `0x11` / `0x14`              | Cursor visível ligado / desligado             |
| `ESC 0x40..0x47`             | Cor do caractere (0=preto ... 7=branco)       |
| `ESC 0x50..0x57`             | Cor do fundo                                  |
| `ESC 0x48` / `0x49`          | Pisca-pisca ligado / desligado                |
| `ESC 0x5A` / `0x59`          | Sublinhado ligado / desligado                 |
| `ESC 0x5D` / `0x5C`          | Vídeo inverso ligado / desligado              |
| `ESC 0x4C..0x4F`             | Tamanho normal / dupla altura / dupla largura / ambos |
| `ESC 0x4A,0x4B,0x58,0x5B,0x5E,0x5F` | Composição de acento (crase, agudo, circunflexo, til, trema, cedilha) + letra base |
| `0x20-0x7E` em G0             | Caractere de texto comum (ASCII)              |
| `0x20-0x5F` em G1             | Célula de mosaico: os 6 bits do byte definem os 6 "sub-pixels" (2 colunas x 3 linhas) da célula |

Este é o **mesmo subconjunto** usado tanto para telnet quanto para o
emulador web — não existe um formato paralelo "só para a web". Se você
plugar um Minitel de verdade (via ponte serial/modem-para-TCP), ele
também deveria entender boa parte deste fluxo, já que segue o espírito
do STUM1B/Teletel real (não é uma implementação 100% certificada do
padrão francês — é um subconjunto didático, pensado para ensino e
demonstração).

### Como navegar (mesmo esquema em telnet e no navegador)

| Tecla / comando        | Ação                                             |
|-------------------------|---------------------------------------------------|
| `NN` + ENVIO             | Vai direto ao serviço de código `NN` (ex: `01`)   |
| `S` / CONTINUA           | Próxima tela / próxima edição dentro do serviço   |
| `R` / VOLTA              | Volta à tela anterior (histórico)                 |
| `G` / GUIA               | Mostra o guia de uso                              |
| `H` / SUMÁRIO            | Volta ao índice principal                         |
| ENVIO vazio              | Repete a tela atual                               |
| `Q` / FIM                | Encerra a conexão (com tela de despedida)         |

Em páginas com campo de texto livre (correio, bate-papo, banco, quiz),
qualquer linha digitada vira o conteúdo do campo — para navegar sem
sair do modo texto, use os comandos com barra: `/sumario`, `/guia`,
`/volta`, `/continua`, `/fim`.

---

## 2. Rodando localmente (sem Docker)

Requer Node.js 18 ou mais novo.

```bash
npm install
npm start
```

Isso sobe:
- o emulador web em `http://localhost:8080`
- o servidor telnet/TCP em `localhost:3615`

Teste rápido por telnet:

```bash
telnet localhost 3615
```

(No Windows, habilite o "Cliente Telnet" em
*Recursos do Windows* ou use PuTTY em modo Raw/Telnet na porta 3615.)

Ou simplesmente abra `http://localhost:8080` no navegador — é o
caminho mais direto para ver o terminal funcionando de verdade.

Variáveis de ambiente aceitas:

| Variável       | Padrão     | Descrição                          |
|----------------|------------|-------------------------------------|
| `PORT`         | `8080`     | Porta HTTP (emulador web + WebSocket em `/ws`) |
| `TELNET_PORT`  | `3615`     | Porta do servidor telnet/TCP        |
| `HOST`         | `0.0.0.0`  | Endereço de bind                    |

---

## 3. Rodando com Docker

```bash
docker build -t videotexto-brasil .
docker run --rm -p 8080:8080 -p 3615:3615 videotexto-brasil
```

Depois acesse `http://localhost:8080` ou `telnet localhost 3615`.

O `Dockerfile` já expõe as duas portas (`8080` e `3615`), roda como
usuário não-root (`node`) e tem `HEALTHCHECK` batendo em `/health`.

---

## 4. Deploy no EasyPanel (passo a passo)

O EasyPanel constrói a imagem a partir do `Dockerfile` do repositório,
então o processo é direto:

1. **Suba este projeto para um repositório Git** (GitHub, GitLab etc.)
   que o EasyPanel consiga acessar — ou use a opção de deploy via
   upload/monorepo do próprio EasyPanel, se preferir.

2. No EasyPanel, crie um **novo serviço do tipo "App"** e escolha a
   fonte **"Dockerfile"** (ou "Git" apontando para este repositório,
   com "Build Method: Dockerfile").

3. Em **"Build"**, confirme que o Dockerfile detectado é o da raiz do
   projeto (`Dockerfile`). Nenhum argumento de build é necessário.

4. Em **"Environment"**, você pode deixar os padrões, ou ajustar:
   - `PORT=8080` (porta HTTP interna — não precisa mudar)
   - `TELNET_PORT=3615` (porta telnet interna)

5. Em **"Domains" / "Proxy"**, associe um domínio (ou use o subdomínio
   gratuito do EasyPanel) apontando para a **porta 8080** — é essa
   porta que serve o emulador web com HTTPS automático via Traefik.
   Isso já é suficiente para usar o servidor inteiro pelo navegador,
   sem precisar de mais nada.

6. **(Opcional) Acesso telnet real por fora do EasyPanel:** se você
   quiser permitir conexões telnet brutas (por exemplo, para ligar uma
   ponte serial de um Minitel físico), abra a aba de **"Ports"** do
   serviço no EasyPanel e publique a porta do container `3615` como
   uma porta TCP direta do host (fora do proxy HTTP do Traefik, que só
   entende HTTP/HTTPS/WebSocket). Consulte a documentação do EasyPanel
   para "Port Mapping"/"Published Ports", pois a nomenclatura pode
   variar entre versões do painel. Isso é **opcional** — o emulador
   web já expõe o serviço inteiro sem precisar dessa porta.

7. Clique em **Deploy**. O EasyPanel vai construir a imagem, subir o
   container e, assim que o healthcheck em `/health` responder `OK`,
   o serviço fica no ar.

8. Abra o domínio configurado — você deve ver o terminal retrô
   "TERMINAL DE VIDEOTEXTO — MODELO BR-82" conectando via WebSocket.
   Digite `01` e ENVIO para ir direto ao Jornal Eletrônico, ou `G` para
   o guia de uso.

> **Nota sobre WebSocket atrás de proxy:** o WebSocket roda na mesma
> porta HTTP (`/ws`), então nenhuma configuração extra de proxy é
> necessária — o Traefik do EasyPanel já faz upgrade de conexão
> HTTP→WebSocket automaticamente para serviços HTTP comuns.

---

## 5. Estrutura do projeto

```
minitel-videotexto-br/
├── Dockerfile
├── package.json
├── src/
│   ├── server.js              # ponto de entrada: sobe telnet + web/ws
│   ├── net/
│   │   ├── telnetServer.js    # servidor TCP bruto (com filtro de IAC telnet)
│   │   └── webServer.js       # HTTP estático + WebSocket (/ws)
│   ├── videotex/
│   │   ├── constants.js       # códigos de controle, cores, acentos
│   │   ├── screen.js          # "Screen": monta o fluxo de bytes de um quadro
│   │   └── session.js         # máquina de estados de navegação por conexão
│   └── pages/                 # os "quadros" de Videotexto (conteúdo)
│       ├── 00-home.js         # sumário / índice
│       ├── 01-noticias.js     # jornal eletrônico (multi-edição)
│       ├── 02-tempo.js        # previsão do tempo
│       ├── 03-horoscopo.js    # horóscopo do dia
│       ├── 04-classificados.js
│       ├── 05-correio.js      # correio eletrônico (campo de texto)
│       ├── 06-banco.js        # extrato/saque/depósito simulados
│       ├── 07-batepapo.js     # bate-papo simulado
│       ├── 08-jogo.js         # quiz de múltipla escolha
│       ├── 09-arte.js         # demonstração de arte em mosaico G1
│       ├── 10-cores.js        # paleta de cores e atributos
│       ├── 11-esportes.js     # esportes com dados reais + gráficos em mosaico
│       ├── sports-art.js      # gera os desenhos (troféu, bola) em mosaico
│       └── 99-guia.js         # guia de uso
└── web/
    ├── index.html             # shell do emulador
    ├── minitel.css            # visual retrô do terminal
    └── minitel-emulator.js    # decodificador do protocolo + canvas + WebSocket
```

### Criando um novo "quadro" (página)

Cada página em `src/pages/` exporta um objeto com este formato:

```js
module.exports = {
  code: '11',              // código de 2 dígitos digitado pelo usuário
  title: 'MEU SERVICO',
  expectsText: false,      // true se a página tem campo de texto livre
  onEnter(ctx) {},          // opcional: roda 1x ao entrar na página
  onInput(ctx) {},          // opcional: roda ao receber ENVIO com conteúdo
  next(ctx) {},             // opcional: o que fazer com a tecla CONTINUA
  render(screen, ctx) {
    screen.clear().reset();
    screen.goto(2, 1).fg(6).print('OLA, VIDEOTEXTO!');
    // ...
  },
};
```

Registre a nova página em `src/pages/index.js` e pronto — ela já
aparece navegável tanto por telnet quanto pelo emulador web.

---

## 6. Créditos e avisos

- Inspirado no projeto [minitel-server de BwanaFr](https://github.com/BwanaFr/minitel-server),
  que por sua vez se apoia no trabalho de Christian Quest (Pynitel).
- Todo o conteúdo das páginas (notícias, classificados, extrato
  bancário, horóscopo etc.) é **fictício**, criado apenas para fins de
  demonstração didática do protocolo de Videotexto. A única exceção é
  a página **11 - Esportes**, cujos dados (tabela do Brasileirão,
  classificação da Fórmula 1) foram reais no momento em que o conteúdo
  foi escrito — é um retrato estático (não uma API ao vivo) e fica
  desatualizado à medida que as rodadas avançam.
- Este projeto implementa um **subconjunto simplificado** do protocolo
  Videotex/Teletel, com fins educacionais — não é uma implementação
  certificada do padrão STUM1B francês nem do padrão oficial usado
  pela Embratel/Telesp nos anos 80.

73 e um abraço do tempo do fósforo verde. Boas conexões!
