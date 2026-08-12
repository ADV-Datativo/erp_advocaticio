// modules/auditoria/auditoria.state.js
// Cache local dos logs (evita refazer a query a cada troca de filtro),
// exatamente como o `_auditoriaCache` original — mesmo comportamento,
// só isolado numa fachada em vez de variável solta no escopo global.

let cache = null;

/** @returns {boolean} true se já carregou pelo menos uma vez. */
export function estaCarregado() {
  return cache !== null;
}

export function obterCache() {
  return cache;
}

export function definirCache(logs) {
  cache = logs;
}
