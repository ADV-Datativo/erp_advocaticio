// modules/diario-oficial/diario-oficial.state.js
//
// IMPORTANTE: o sistema inteiro (não só este módulo) usa um único objeto
// global `store` como fonte de verdade (store.publicacoesDiario,
// store.clientes, store.processos, etc.), referenciado centenas de vezes
// no monólito. Criar um estado paralelo aqui duplicaria a fonte de verdade
// e reintroduziria exatamente o tipo de bug de dessincronização que a
// arquitetura pretende evitar.
//
// Por isso, este state.js é uma FACHADA sobre a fatia relevante do store
// global — não um estado novo. Centraliza o ACESSO (nenhum outro arquivo
// deste módulo toca em `store.publicacoesDiario` diretamente), mas não
// duplica o DADO. Quando (e se) o store global for fatiado por módulo numa
// etapa futura, só este arquivo precisa mudar — o resto do módulo já
// depende só desta interface.

let _store = null;

/** Injeta a referência ao store global. Chamado uma vez pelo index.js do módulo. */
export function conectarStore(storeGlobal) {
  _store = storeGlobal;
  if (!_store.publicacoesDiario) _store.publicacoesDiario = [];
}

/** @returns {Array} todas as publicações atualmente em memória. */
export function listarPublicacoes() {
  return _store.publicacoesDiario;
}

/** Substitui a lista inteira (usado após carregar do banco). */
export function definirPublicacoes(lista) {
  _store.publicacoesDiario = lista;
}

/** Adiciona uma publicação nova ao início da lista (mais recente primeiro). */
export function adicionarPublicacao(publicacao) {
  _store.publicacoesDiario.unshift(publicacao);
}

/** Substitui uma publicação existente pelo registro atualizado. */
export function atualizarPublicacaoNaLista(publicacao) {
  const idx = _store.publicacoesDiario.findIndex((p) => p.id === publicacao.id);
  if (idx >= 0) _store.publicacoesDiario[idx] = publicacao;
}

/** Remove uma publicação da lista em memória. */
export function removerPublicacaoDaLista(id) {
  _store.publicacoesDiario = _store.publicacoesDiario.filter((p) => p.id !== id);
}

/** @returns {object} referência de leitura a store.clientes, para autocomplete. */
export function listarClientes() {
  return _store.clientes || [];
}

/** @returns {object} referência de leitura a store.processos, para o select de vínculo. */
export function listarProcessos() {
  return _store.processos || [];
}
