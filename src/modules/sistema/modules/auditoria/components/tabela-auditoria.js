// modules/auditoria/components/tabela-auditoria.js
// Só renderiza. Recebe a lista já filtrada.

import { AUDIT_ICONES, AUDIT_CORES, AUDIT_MODULOS, ICONE_ACAO_PADRAO, COR_ACAO_PADRAO, ICONE_MODULO_PADRAO } from '../auditoria.constants.js';

/** @param {Array} lista já filtrada pelo service */
export function renderizarTabelaAuditoria(lista) {
  if (!lista.length) {
    return '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">Nenhum registro encontrado.</td></tr>';
  }
  return lista.map(renderizarLinha).join('');
}

function renderizarLinha(l) {
  const icone = AUDIT_ICONES[l.acao] || ICONE_ACAO_PADRAO;
  const cor = AUDIT_CORES[l.acao] || COR_ACAO_PADRAO;
  const modIcon = AUDIT_MODULOS[l.modulo] || ICONE_MODULO_PADRAO;
  return `<tr>
    <td style="font-size:12px;color:var(--text-muted);white-space:nowrap">
      <div style="font-weight:500;color:var(--text-primary)">${l.data}</div>
      <div>${l.hora}</div>
    </td>
    <td>
      <div style="font-size:13px;font-weight:500">${l.usuario}</div>
    </td>
    <td>
      <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:20px;font-size:11.5px;font-weight:600;background:${cor.bg};color:${cor.cor}">
        ${icone} ${l.acao}
      </span>
    </td>
    <td style="font-size:12.5px">${modIcon} ${l.modulo}</td>
    <td>
      <div style="font-size:13px">${l.descricao}</div>
      ${l.detalhes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">${l.detalhes}</div>` : ''}
    </td>
  </tr>`;
}
