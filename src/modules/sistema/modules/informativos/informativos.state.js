// modules/informativos/informativos.state.js
// Fachada sobre store.informativos — mesmo padrão de despesas.state.js.

let _store = null;

export function conectarStore(storeGlobal) {
  _store = storeGlobal;
  if (!_store.informativos) _store.informativos = [];
}

export function listarInformativos() {
  return _store.informativos;
}

export function definirInformativos(lista) {
  _store.informativos = lista;
}

export function marcarComoLidoNaLista(id) {
  const info = _store.informativos.find((i) => i.id === id);
  if (info) info.lido = true;
  return info;
}
