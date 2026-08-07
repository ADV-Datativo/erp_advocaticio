// modules/recebimentos/recebimentos.state.js
// Fachada sobre store.parcelas — mesmo raciocínio já documentado em
// despesas.state.js e diario-oficial.state.js.

let _store = null;

export function conectarStore(storeGlobal) {
  _store = storeGlobal;
  if (!_store.parcelas) _store.parcelas = [];
}

export function listarParcelas() {
  return _store.parcelas;
}

export function definirParcelas(lista) {
  _store.parcelas = lista;
}

export function substituirParcelasDoProcesso(processoId, novasParcelas) {
  _store.parcelas = _store.parcelas.filter((p) => p.processoId !== processoId);
  _store.parcelas.push(...novasParcelas);
}

export function atualizarParcelaNaLista(parcela) {
  const idx = _store.parcelas.findIndex((p) => p.id === parcela.id);
  if (idx >= 0) Object.assign(_store.parcelas[idx], parcela);
  return idx >= 0 ? _store.parcelas[idx] : parcela;
}

/** @returns {object} referência de leitura a store.clientes, para exibição. */
export function listarClientes() {
  return _store.clientes || [];
}

/** @returns {object} referência de leitura a store.processos, para exibição. */
export function listarProcessos() {
  return _store.processos || [];
}

/** @returns {object} referência de leitura a store.tipos, usado no recibo. */
export function listarTipos() {
  return _store.tipos || [];
}
