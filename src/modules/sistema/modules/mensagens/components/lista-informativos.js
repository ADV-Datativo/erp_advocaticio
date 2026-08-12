// modules/informativos/components/lista-informativos.js
// Só renderiza. Recebe a lista já pronta.

import { INFORMATIVO_TIPOS } from '../informativos.constants.js';

/** @param {Array} informativos */
export function renderizarListaInformativos(informativos) {
  if (!informativos.length) {
    return '<div style="text-align:center;color:var(--text-muted);padding:40px">Nenhum informativo no momento.</div>';
  }
  return informativos.map(renderizarItem).join('');
}

function renderizarItem(info) {
  const tipo = INFORMATIVO_TIPOS[info.tipo] || INFORMATIVO_TIPOS.normal;
  const data = new Date(info.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  return `<div style="border:1px solid ${info.lido ? 'var(--border)' : tipo.cor};border-left:4px solid ${tipo.cor};border-radius:var(--radius);padding:16px 18px;margin-bottom:14px;background:${info.lido ? 'var(--surface)' : tipo.bg}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">${tipo.icon}</span>
        <strong style="font-size:15px">${info.titulo}</strong>
        <span class="badge" style="background:${tipo.bg};color:${tipo.cor};font-size:10.5px">${tipo.label}</span>
        ${!info.lido ? '<span class="badge badge-blue" style="font-size:10px">Novo</span>' : ''}
      </div>
      <span style="font-size:11.5px;color:var(--text-muted);white-space:nowrap">${data}</span>
    </div>
    ${info.corpo ? `<div style="font-size:13.5px;color:var(--text-secondary);white-space:pre-wrap;margin-bottom:10px">${info.corpo}</div>` : ''}
    ${info.anexoPath ? `<button class="btn btn-outline btn-sm" onclick="abrirAnexoInformativo('${info.anexoPath}')">📎 ${info.anexoNome || 'Ver anexo'}</button>` : ''}
    ${!info.lido ? `<div style="margin-top:10px"><button class="btn btn-primary btn-sm" onclick="marcarComoLidoUI('${info.id}')">✓ Marcar como lido</button></div>` : ''}
  </div>`;
}
