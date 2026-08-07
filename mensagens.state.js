// modules/mensagens/mensagens.state.js
//
// Diferente de Despesas/Recebimentos/Relatórios (que são fachadas sobre
// o `store` global), Mensagens tem estado próprio de verdade: as
// variáveis originais (_mpClienteAtual, _mpMensagensCache, linhas
// 6753-6754) nunca fizeram parte de `store` — eram module-level `let`
// isoladas. Esta migração preserva essa independência.

let clienteAtual = null; // { clienteId, clienteNome }
let mensagensDaConversaAtual = [];

/** @returns {{clienteId: string, clienteNome: string}|null} */
export function obterClienteAtual() {
  return clienteAtual;
}

export function definirClienteAtual(clienteId, clienteNome) {
  clienteAtual = { clienteId, clienteNome };
}

/** @returns {Array} mensagens da conversa aberta no momento. */
export function obterMensagensDaConversa() {
  return mensagensDaConversaAtual;
}

export function definirMensagensDaConversa(mensagens) {
  mensagensDaConversaAtual = mensagens;
}

export function adicionarMensagemNaConversa(mensagem) {
  mensagensDaConversaAtual.push(mensagem);
}
