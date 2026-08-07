// financeiro.events.js
//
// Barramento simples de eventos entre submódulos do domínio Financeiro —
// para o caso em que uma ação em um submódulo precisa avisar outro sem
// que eles se conheçam diretamente (ex: "despesa paga" → Relatórios
// recalcular, quando ambos estiverem migrados).
//
// Hoje (Etapa Despesas) nenhum submódulo ainda emite nem escuta nada
// daqui — é infraestrutura pronta para quando Relatórios for migrado e
// precisar reagir a mudanças em Recebimentos/Despesas.

const alvo = new EventTarget();

/** @param {string} nome ex: 'despesa:paga', 'parcela:recebida' */
export function emitir(nome, detalhe) {
  alvo.dispatchEvent(new CustomEvent(nome, { detail: detalhe }));
}

/** @param {string} nome @param {(detalhe: any) => void} callback */
export function escutar(nome, callback) {
  alvo.addEventListener(nome, (e) => callback(e.detail));
}
