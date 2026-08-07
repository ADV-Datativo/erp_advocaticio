// modules/relatorios/components/cards-fluxo-caixa.js
// Só escreve nos elementos do DOM os valores já calculados pelo service.

/**
 * @param {ReturnType<import('../relatorios.service.js').calcularFluxoCaixa>['cards']} cards
 * @param {(valor: number) => string} fmtMoney
 */
export function renderizarCardsFluxoCaixa(cards, fmtMoney) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('rel-total-entradas', fmtMoney(cards.totalEntradas));
  set('rel-qtd-entradas', cards.qtdEntradas + ' recebimento(s)');
  set('rel-total-saidas', fmtMoney(cards.totalSaidas));
  set('rel-qtd-saidas', cards.qtdSaidas + ' despesa(s)');
  const saldoEl = document.getElementById('rel-saldo-periodo');
  if (saldoEl) { saldoEl.textContent = fmtMoney(cards.saldo); saldoEl.style.color = cards.saldo >= 0 ? 'var(--success)' : 'var(--danger)'; }
  set('rel-areceber', fmtMoney(cards.totalAReceber));
  set('rel-vencido-label', fmtMoney(cards.totalVencido) + ' vencido');
}
