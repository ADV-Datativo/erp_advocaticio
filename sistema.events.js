// sistema.events.js
// Barramento entre submódulos de Sistema. Mesmo padrão de
// financeiro.events.js. Candidato real de uso: Mensagens e Informativos
// compartilham o padrão "badge de não lido" — se um dia isso virar um
// componente de notificação compartilhado (ideia mencionada pelo
// Renan/ChatGPT como motivação para começar por Mensagens), o evento
// disparado aqui seria o ponto de integração.

const alvo = new EventTarget();

export function emitir(nome, detalhe) {
  alvo.dispatchEvent(new CustomEvent(nome, { detail: detalhe }));
}

export function escutar(nome, callback) {
  alvo.addEventListener(nome, (e) => callback(e.detail));
}
