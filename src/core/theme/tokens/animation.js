// core/theme/tokens/animation.js
// Ver docs/design/04-motion.md — nenhuma duração "lenta" como categoria
// própria, de propósito (ver princípio no doc de Motion).

export const duration = Object.freeze({
  instant: '100ms', // feedback de clique/toque
  fast: '150ms',    // dropdown, troca de aba
  moderate: '250ms' // modal, navegação de contexto amplo
});

/** Desacelera ao chegar no destino, como movimento no mundo real (ver 04-motion.md). */
export const easing = Object.freeze({
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)'
});

/**
 * Respeita prefers-reduced-motion do sistema operacional — requisito
 * não-negociável (05-accessibility.md). Componentes devem checar isto
 * antes de aplicar qualquer duration/easing acima.
 */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

export const animation = Object.freeze({ duration, easing, prefersReducedMotion });
