// modules/recebimentos/components/select-parcela-pagar.js

/**
 * @param {Array} pendentes já filtradas/ordenadas pelo service
 * @param {Array} clientes @param {Array} processos
 * @param {(dataISO: string) => string} fmtDate
 * @param {(valor: number) => string} fmtMoney
 */
export function renderizarOpcoesParcelaPendente(pendentes, clientes, processos, fmtDate, fmtMoney) {
  let html = '<option value="">— Selecione uma parcela pendente —</option>';
  pendentes.forEach((p) => {
    const c = clientes.find((c) => c.id === p.clienteId) || { nome: '?' };
    const pr = processos.find((pr) => pr.id === p.processoId) || { numero: '?' };
    html += `<option value="${p.id}">${c.nome} — ${pr.numero} — Parc. ${p.num}/${p.total} — ${fmtDate(p.vencimento)} — ${fmtMoney(p.valor)}</option>`;
  });
  return html;
}
