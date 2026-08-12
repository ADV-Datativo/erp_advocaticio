// modules/intimacoes/intimacoes.state.js
// Fachada sobre store.intimacoes — estrutura AGRUPADA por processo_id
// (não é uma lista flat, como na maioria dos outros submódulos), mesmo
// formato do original: store.intimacoes[procId] = [...].

let _store = null;

export function conectarStore(storeGlobal) {
  _store = storeGlobal;
  if (!_store.intimacoes) _store.intimacoes = {};
}

/** @returns {Array} intimações do processo (nunca undefined — cria a chave vazia se não existir). */
export function listarPorProcesso(procId) {
  if (!_store.intimacoes[procId]) _store.intimacoes[procId] = [];
  return _store.intimacoes[procId];
}

export function definirTodas(agrupado) {
  _store.intimacoes = agrupado;
}

export function adicionarNaLista(procId, intimacao) {
  listarPorProcesso(procId).push(intimacao);
}

export function atualizarNaLista(procId, intimacao) {
  const lista = listarPorProcesso(procId);
  const idx = lista.findIndex((i) => i.id === intimacao.id);
  if (idx > -1) lista[idx] = intimacao;
  return lista[idx];
}

export function removerDaLista(procId, id) {
  _store.intimacoes[procId] = listarPorProcesso(procId).filter((i) => i.id !== id);
}

/** @returns {object} todo o objeto agrupado — usado por getPrazosFatais, que varre todos os processos. */
export function obterTudoAgrupado() {
  return _store.intimacoes;
}

/** @returns {Array} referência de leitura a store.processos. */
export function listarProcessos() {
  return _store.processos || [];
}

/** @returns {Array} referência de leitura a store.clientes. */
export function listarClientes() {
  return _store.clientes || [];
}

/** @returns {Array} referência de leitura a store.eventos (pra adicionar o evento criado pela RPC). */
export function listarEventos() {
  if (!_store.eventos) _store.eventos = [];
  return _store.eventos;
}
