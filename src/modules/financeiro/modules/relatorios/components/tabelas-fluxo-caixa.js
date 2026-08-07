// modules/relatorios/components/tabelas-fluxo-caixa.js
import { STATUS_PARCELA_CLASSE, DESP_CATEGORIAS, DESP_STATUS } from '../relatorios.constants.js';

/**
 * @param {Array} listaEntradas já filtrada, com computedStatus
 * @param {Array} clientes @param {Array} processos
 */
export function renderizarTabelaEntradas(listaEntradas, clientes, processos, fmtDate, fmtMoney) {
  const tb = document.getElementById('tbody-rel-entradas');
  if (!tb) return;
  tb.innerHTML = listaEntradas.length
    ? listaEntradas.map((p) => {
        const c = clientes.find((c) => c.id === p.clienteId) || { nome: '—' };
        const pr = processos.find((pr) => pr.id === p.processoId) || { numero: '—' };
        const st = p.computedStatus;
        const label = { pago: '✅ Pago', pendente: '⏳ Pendente', vencido: '⚠️ Vencido' }[st] || st;
        return `<tr>
          <td>${c.nome}</td><td style="color:var(--blue-600)">${pr.numero}</td>
          <td style="text-align:center">${p.num}/${p.total}</td>
          <td>${fmtDate(p.vencimento)}</td>
          <td><strong>${fmtMoney(p.valor)}</strong></td>
          <td><span class="badge ${STATUS_PARCELA_CLASSE[st] || ''}">${label}</span></td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">Nenhuma entrada no período.</td></tr>';
}

/** @param {Array} listaSaidas já filtrada (despesas) */
export function renderizarTabelaSaidas(listaSaidas, fmtDate, fmtMoney) {
  const tb = document.getElementById('tbody-rel-saidas');
  if (!tb) return;
  tb.innerHTML = listaSaidas.length
    ? listaSaidas.map((d) => {
        const cat = DESP_CATEGORIAS[d.categoria] || DESP_CATEGORIAS.outro;
        const st = DESP_STATUS[d.status] || {};
        return `<tr>
          <td><strong>${d.descricao}</strong></td>
          <td>${cat.icon} ${cat.label}</td>
          <td>${fmtDate(d.vencimento)}</td>
          <td><strong style="color:var(--danger)">${fmtMoney(d.valor)}</strong></td>
          <td><span class="badge ${st.cls || ''}">${st.icon || ''} ${st.label || d.status}</span></td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">Nenhuma saída no período.</td></tr>';
}
