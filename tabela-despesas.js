// modules/despesas/components/tabela-despesas.js
// Só renderiza. Recebe a lista já filtrada/ordenada pelo controller.

import { DESP_CATEGORIAS, DESP_STATUS } from '../despesas.constants.js';

/**
 * @param {Array} despesas já filtradas e ordenadas
 * @param {(dataISO: string) => string} fmtDate
 * @param {(valor: number) => string} fmtMoney
 */
export function renderizarTabelaDespesas(despesas, fmtDate, fmtMoney) {
  if (!despesas.length) {
    return '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px">Nenhuma despesa encontrada.</td></tr>';
  }
  return despesas.map((d) => renderizarLinha(d, fmtDate, fmtMoney)).join('');
}

function renderizarLinha(d, fmtDate, fmtMoney) {
  const cat = DESP_CATEGORIAS[d.categoria] || DESP_CATEGORIAS.outro;
  const st = DESP_STATUS[d.status] || DESP_STATUS.pendente;
  const rec = d.recorrencia && d.recorrencia !== 'unica' ? '🔄 ' + d.recorrencia : '—';
  return `<tr style="${d.status === 'vencido' ? 'background:#FFF5F5' : ''}">
    <td><div style="font-weight:500">${d.descricao}</div>${d.obs ? `<div style="font-size:11px;color:var(--text-muted)">${d.obs}</div>` : ''}</td>
    <td><span style="font-size:12px">${cat.icon} ${cat.label}</span></td>
    <td><strong style="color:var(--danger)">${fmtMoney(d.valor)}</strong></td>
    <td style="font-size:13px">${fmtDate(d.vencimento)}</td>
    <td><span class="badge ${st.cls}">${st.icon} ${st.label}</span></td>
    <td style="font-size:12px;color:var(--text-muted)">${rec}</td>
    <td style="font-size:12px;color:var(--text-muted)">${d.conta || '—'}</td>
    <td style="white-space:nowrap">
      ${d.status !== 'pago' ? `<button class="btn btn-primary btn-sm" onclick="abrirPagarDespesa('${d.id}')" title="Pagar">✅</button>` : ''}
      <button class="btn btn-outline btn-sm" onclick="editarDespesa('${d.id}')" title="Editar">✏️</button>
      <button class="btn btn-danger btn-sm" onclick="excluirDespesa('${d.id}')" title="Excluir">🗑</button>
    </td>
  </tr>`;
}
