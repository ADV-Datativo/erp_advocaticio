// core/ui/badge/badge.js
//
// Componente Badge — primeiro da Component Library (Sprint 4, Onda 1).
// Consolida o padrão já reimplementado manualmente 6+ vezes nos módulos
// migrados (tabela-despesas, tabela-parcelas, tabelas-fluxo-caixa,
// lista-publicacoes). Usa tokens do Theme Engine — nunca cor hardcoded.
//
// Uso:
//   import { renderBadge } from '.../core/ui/badge/badge.js';
//   renderBadge({ label: 'Pago', variant: 'success', icon: '✅' })

import { theme } from '../../theme/tokens/index.js';

/** @typedef {'success'|'warning'|'danger'|'info'|'neutral'} BadgeVariant */

/**
 * @param {{label: string, variant?: BadgeVariant, icon?: string}} props
 * @returns {string} HTML do badge, pronto pra inserir num template.
 */
export function renderBadge({ label, variant = 'neutral', icon = '' }) {
  const { bg, text } = coresPorVariante(variant);
  return `<span style="${estiloBase(bg, text)}">${icon ? icon + ' ' : ''}${label}</span>`;
}

function coresPorVariante(variant) {
  if (variant === 'neutral') {
    return { bg: theme.colors.neutral[200], text: theme.colors.neutral[700] };
  }
  const escala = theme.colors[variant];
  if (!escala) {
    console.warn(`[badge] variante "${variant}" desconhecida, usando neutral.`);
    return coresPorVariante('neutral');
  }
  // 100 pro fundo (suave), 700 pro texto (contraste garantido sobre o 100) —
  // mesma lógica de escala já usada em colors.js.
  return { bg: escala[100], text: escala[700] };
}

function estiloBase(bg, text) {
  return [
    `display:inline-flex`,
    `align-items:center`,
    `gap:4px`,
    `background:${bg}`,
    `color:${text}`,
    `font-family:${theme.typography.fontFamily.ui}`,
    `font-size:${theme.typography.fontSize.xs}`,
    `font-weight:${theme.typography.fontWeight.medium}`,
    `padding:2px ${theme.spacing[2]}`,
    `border-radius:${theme.radius.full}`,
    `line-height:1.4`,
    `white-space:nowrap`
  ].join(';');
}
