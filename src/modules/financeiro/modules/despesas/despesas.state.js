// modules/despesas/despesas.state.js
//
// Fachada sobre store.despesas — mesmo raciocínio já documentado em
// diario-oficial.state.js: o `store` global continua sendo a única fonte
// de verdade do sistema; este arquivo só centraliza o ACESSO, não duplica
// o dado.

let _store = null;

export function conectarStore(storeGlobal) {
  _store = storeGlobal;
  if (!_store.despesas) _store.despesas = [];
}

export function listarDespesas() {
  return _store.despesas;
}

export function definirDespesas(lista) {
  _store.despesas = lista;
}

export function adicionarDespesas(novas) {
  _store.despesas.push(...novas);
}

export function atualizarDespesaNaLista(despesa) {
  const idx = _store.despesas.findIndex((d) => d.id === despesa.id);
  if (idx >= 0) _store.despesas[idx] = despesa;
}

export function removerDespesaDaLista(id) {
  _store.despesas = _store.despesas.filter((d) => d.id !== id);
}
