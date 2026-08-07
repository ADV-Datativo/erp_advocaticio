// modules/mensagens/mensagens.validation.js
//
// A validação original (responderMensagemPortal, linha 6872) é um guard
// silencioso: `if(!conteudo) return;` — sem toast, sem mensagem de erro.
// NÃO uso ValidationError aqui de propósito: lançar uma exception e o
// controller exibir err.message criaria um toast vazio, que é uma
// mudança de comportamento visível. A função abaixo só informa
// verdadeiro/falso, preservando o silêncio original.

/** @returns {boolean} true se o conteúdo é válido para envio. */
export function conteudoEhValido(conteudo) {
  return Boolean(conteudo);
}
