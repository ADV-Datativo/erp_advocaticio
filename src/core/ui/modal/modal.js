// core/ui/modal/modal.js
//
// Terceiro componente da Component Library (Sprint 4, Onda 1). Gera a
// CASCA de modais NOVOS — não substitui nem toca em openModal()/
// closeModal() do monólito (178 chamadas, função grande demais e
// arriscada demais pra mexer agora, ver auditoria). Usa as MESMAS
// classes CSS já existentes (.modal-overlay, .modal, .open) — então um
// modal gerado por este componente já funciona com o mecanismo de
// abrir/fechar que já existe, sem nada novo pra aprender.
//
// Uso: injeta o HTML retornado uma vez no DOM (ex: no fim do <body>),
// depois chama openModal('meu-id')/closeModal('meu-id') normalmente.

import { theme } from '../../theme/tokens/index.js';

/**
 * @param {{
 *   id: string,
 *   titulo: string,
 *   bodyHtml: string,
 *   footerHtml?: string,
 *   largura?: string
 * }} props
 * @returns {string} HTML completo do modal, pronto pra inserir no DOM.
 */
export function renderModal({ id, titulo, bodyHtml, footerHtml = '', largura = '580px' }) {
  return `<div class="modal-overlay" id="${id}">
  <div class="modal" style="width:${largura}">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:${theme.spacing[4]} ${theme.spacing[6]};border-bottom:1px solid var(--border)">
      <h3 style="font-family:${theme.typography.fontFamily.ui};font-size:${theme.typography.fontSize.lg};font-weight:${theme.typography.fontWeight.semibold};color:var(--text-primary);margin:0">${titulo}</h3>
      <button class="btn-ghost btn-icon" onclick="closeModal('${id}')" aria-label="Fechar" style="border:none;background:none;cursor:pointer;font-size:18px;color:var(--text-muted)">✕</button>
    </div>
    <div style="padding:${theme.spacing[6]}">
      ${bodyHtml}
    </div>
    ${footerHtml ? `<div style="display:flex;justify-content:flex-end;gap:${theme.spacing[2]};padding:${theme.spacing[4]} ${theme.spacing[6]};border-top:1px solid var(--border)">${footerHtml}</div>` : ''}
  </div>
</div>`;
}
