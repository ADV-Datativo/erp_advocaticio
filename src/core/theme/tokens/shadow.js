// core/theme/tokens/shadow.js
// Sutil, coerente com "Premium sem ostentação" — ver
// docs/design/01-brand-principles.md e tokens-proposta.md item 9.
// Opacidade baixa (8-16%) de propósito, nunca sombra dramática.

export const shadow = Object.freeze({
  sm: '0 1px 2px rgba(15, 23, 42, 0.08)',   // hover leve
  md: '0 2px 8px rgba(15, 23, 42, 0.10)',   // card padrão
  lg: '0 8px 24px rgba(15, 23, 42, 0.16)'   // modal, dropdown
});
