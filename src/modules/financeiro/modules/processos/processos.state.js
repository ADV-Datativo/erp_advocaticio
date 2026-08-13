// modules/processos/processos.state.js
// Fachada sobre store.processos — mesmo padrão de despesas.state.js.
// Também lê (nunca escreve) store.clientes/store.tipos/store.parcelas/
// store.documentos/store.processosTags, que pertencem a outros
// domínios — leitura de referência é aceitável, escrita nunca é.

let _store = null;

export function conectarStore(storeGlobal) {
  _store = storeGlobal;
  if (!_store.processos) _store.processos = [];
  if (!_store.andamentos) _store.andamentos = {};
}

export function listarProcessos() {
  return _store.processos;
}

export function definirProcessos(lista) {
  _store.processos = lista;
}

export function adicionarNaLista(processo) {
  _store.processos.unshift(processo);
}

export function atualizarNaLista(processo) {
  const idx = _store.processos.findIndex((p) => p.id === processo.id);
  if (idx >= 0) _store.processos[idx] = { ..._store.processos[idx], ...processo };
}

export function removerDaLista(id) {
  _store.processos = _store.processos.filter((p) => p.id !== id);
  delete _store.andamentos[id];
}

export function garantirAndamentosVazio(processoId) {
  if (!_store.andamentos[processoId]) _store.andamentos[processoId] = [];
}

export function adicionarAndamento(processoId, andamento) {
  garantirAndamentosVazio(processoId);
  _store.andamentos[processoId].push(andamento);
}

// ---- Leitura de referência a outros domínios (nunca escrita) ----

export function listarClientesAtivos() {
  return (_store.clientes || []).filter((c) => c.status === 'ativo');
}

export function buscarCliente(id) {
  return (_store.clientes || []).find((c) => c.id === id);
}

export function listarTipos() {
  return _store.tipos || [];
}

export function buscarTipo(id) {
  return (_store.tipos || []).find((t) => t.id === id);
}

export function parcelasDoProcesso(processoId) {
  return (_store.parcelas || []).filter((p) => p.processoId === processoId);
}

export function tagsDoProcesso(processoId) {
  return (_store.processosTags || {})[processoId];
}

export function qtdDocumentosDoProcesso(processoId) {
  return ((_store.documentos || {})[processoId] || []).length;
}
