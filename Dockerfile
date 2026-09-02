# Servidor de Videotexto Brasil — imagem enxuta baseada em Node.js Alpine.
FROM node:20-alpine

WORKDIR /app

# Instala dependencias primeiro (aproveita cache de camadas do Docker)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copia o restante do codigo-fonte
COPY src ./src
COPY web ./web

ENV NODE_ENV=production \
    PORT=8080 \
    TELNET_PORT=3615 \
    HOST=0.0.0.0

# Porta HTTP (emulador web + WebSocket) e porta telnet/TCP (Videotexto real)
EXPOSE 8080
EXPOSE 3615

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

USER node

CMD ["node", "src/server.js"]
