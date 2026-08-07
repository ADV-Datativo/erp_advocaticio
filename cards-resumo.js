// modules/despesas/components/cards-resumo.js
// Só escreve nos elementos do DOM os valores já calculados pelo service.
// Não calcula nada.

/**
 * @param {ReturnType<import('../despesas.service.js').calcularResumoCards>} resumo
 * @param {(valor: number) => string} fmtMoney
 */
export function renderizarCardsResumo(resumo, fmtMoney) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('desp-total-mes', fmtMoney(resumo.totalMes));
  set('desp-qtd-mes', resumo.qtdMes + ' despesa(s)');
  set('desp-total-vencidas', fmtMoney(resumo.totalVencidas));
  set('desp-qtd-vencidas', resumo.qtdVencidas + ' em atraso');
  set('desp-total-avencer', fmtMoney(resumo.totalAVencer));
  set('desp-qtd-avencer', resumo.qtdAVencer + ' despesa(s)');
  set('desp-total-pagas', fmtMoney(resumo.totalPagas));
  set('desp-qtd-pagas', resumo.qtdPagas + ' despesa(s)');
}
