'use strict';

/**
 * Cache simples com atualizacao em segundo plano. As paginas leem sempre
 * o ultimo valor bom conhecido (`get()`), nunca esperam a rede - assim o
 * terminal responde na hora, mesmo que a fonte de dados esteja lenta ou
 * fora do ar. Se uma atualizacao falhar, o valor anterior e mantido.
 */
function createCache({ label, fetcher, ttlMs }) {
  const state = { value: null, updatedAt: 0, lastError: null, refreshing: null };

  async function refresh() {
    if (state.refreshing) return state.refreshing;
    state.refreshing = (async () => {
      try {
        const fresh = await fetcher();
        state.value = fresh;
        state.updatedAt = Date.now();
        state.lastError = null;
        console.log(`[dados] ${label}: atualizado.`);
      } catch (err) {
        state.lastError = err.message || String(err);
        console.log(`[dados] ${label}: falha ao atualizar (${state.lastError}).`);
      } finally {
        state.refreshing = null;
      }
    })();
    return state.refreshing;
  }

  function get() {
    return state.value;
  }

  function isStale() {
    return Date.now() - state.updatedAt > ttlMs;
  }

  function startBackgroundRefresh() {
    refresh();
    setInterval(() => { if (isStale()) refresh(); }, Math.min(ttlMs, 5 * 60 * 1000));
  }

  return { get, refresh, isStale, startBackgroundRefresh, state };
}

module.exports = { createCache };
