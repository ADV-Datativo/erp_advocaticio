// modules/processos/components/tabela-processos.js
// Só renderiza. Recebe a lista já filtrada + os dados de referência prontos.

import { STATUS_LABELS } from '../processos.constants.js';

/**
 * @param {Array} processos já filtrados
 * @param {(id: string) => object|undefined} buscarCliente
 * @param {(id: string) => object|undefined} buscarTipo
 * @param {(processoId: string) => {pago: number, total: number, pct: number}} calcularProgresso
 * @param {(processoId: string) => number} qtdDocumentos
 * @param {(tags: any) => string} renderTagsBadgesHTML já existente no monólito, injetado
 * @param {(dataISO: string) => string} fmtDate @param {(valor: number) => string} fmtMoney
 */
export function renderizarTabelaProcessos(processos, { buscarCliente, buscarTipo, calcularProgresso, qtdDocumentos, renderTagsBadgesHTML, tagsDoProcesso, fmtDate, fmtMoney }) {
  if (!processos.length) {
    return '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:28px">Nenhum processo encontrado.</td></tr>';
  }
  return processos.map((p) => renderizarLinha(p, { buscarCliente, buscarTipo, calcularProgresso, qtdDocumentos, renderTagsBadgesHTML, tagsDoProcesso, fmtDate, fmtMoney })).join('');
}

function renderizarLinha(p, { buscarCliente, buscarTipo, calcularProgresso, qtdDocumentos, renderTagsBadgesHTML, tagsDoProcesso, fmtDate, fmtMoney }) {
  const c = buscarCliente(p.clienteId) || { nome: '—' };
  const t = buscarTipo(p.tipoId) || { nome: '—' };
  const st = STATUS_LABELS[p.status] || { label: p.status, cls: 'badge-gray' };
  const { total, pct } = calcularProgresso(p.id);
  const numDocs = qtdDocumentos(p.id);
  const lembreteIcone = p.lembrete && p.lembrete.ativo
    ? ` <span title="${(p.lembrete.msg || 'Lembrete ativo').replace(/"/g, "'")}" style="cursor:default">🔔</span>`
    : '';
  return `<tr>
    <td><strong style="color:var(--blue-600)">${p.numero}</strong>${lembreteIcone}${renderTagsBadgesHTML(tagsDoProcesso(p.id))}</td>
    <td>${c.nome}</td>
    <td><span class="badge badge-navy">${t.nome}</span></td>
    <td>${p.adv || '—'}</td>
    <td>${fmtDate(p.abertura)}</td>
    <td><span class="badge ${st.cls}">${st.label}</span></td>
    <td style="min-width:100px">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${pct}% pago</div>
    </td>
    <td><strong>${fmtMoney(total)}</strong></td>
    <td style="white-space:nowrap">
      <button class="btn btn-outline btn-sm" onclick="verDetalhe('${p.id}')" title="Detalhes">🔍</button>
      <button class="btn btn-outline btn-sm" onclick="atualizarAndamento('${p.id}')" title="Andamento">📝</button>
      <button class="btn btn-outline btn-sm" onclick="abrirDocumentos('${p.id}')" title="Documentos" style="background:var(--blue-50);color:var(--blue-700);border-color:var(--blue-200)">📁 ${numDocs > 0 ? numDocs : ''}</button>
      <button class="btn btn-danger btn-sm" onclick="excluirProcesso('${p.id}')" title="Excluir">🗑</button>
    </td>
  </tr>`;
}
