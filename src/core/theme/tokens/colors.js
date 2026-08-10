// core/theme/tokens/colors.js
//
// Escala de cor completa, derivada da cor oficial da Datativo Labs
// (#227056) e dos neutros já usados no brand kit. Aprovado por Renan em
// 07/08/2026 (ver docs/design/tokens-proposta.md para o raciocínio
// completo por trás de cada escolha).

/** Verde de marca — #227056 é sempre primary[600], constante entre os modos claro/escuro (igual ao mark da logo). */
export const primary = Object.freeze({
  50: '#EAF5F0',
  100: '#CCE8DC',
  200: '#9AD1B9',
  300: '#68B996',
  400: '#3F9C77',
  500: '#2B8560',
  600: '#227056', // cor de marca — botão primário, links, foco
  700: '#1B5B45', // estado pressionado/ativo
  800: '#154635',
  900: '#0F3226'
});

/** Neutros — os 5 valores já definidos no brand kit, nomeados como escala. */
export const neutral = Object.freeze({
  0: '#FFFFFF',
  50: '#FAFAFA', // novo — fundo elevado no modo claro
  200: '#E5E7EB',
  700: '#1E293B',
  800: '#111827',
  900: '#0F172A'
});

/** Sucesso — distinto do primary de propósito (ver tokens-proposta.md, item 3). */
export const success = Object.freeze({
  50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#86EFAC',
  400: '#4ADE80', 500: '#22C55E', 600: '#16A34A', 700: '#15803D',
  800: '#166534', 900: '#14532D'
});

export const warning = Object.freeze({
  50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
  400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309',
  800: '#92400E', 900: '#78350F'
});

export const danger = Object.freeze({
  50: '#FEF2F2', 100: '#FEE2E2', 200: '#FECACA', 300: '#FCA5A5',
  400: '#F87171', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C',
  800: '#991B1B', 900: '#7F1D1D'
});

export const info = Object.freeze({
  50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD',
  400: '#60A5FA', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8',
  800: '#1E40AF', 900: '#1E3A8A'
});

/**
 * Tokens semânticos que trocam de valor entre os modos claro/escuro —
 * ver docs/design/tokens-proposta.md, seção 4. O primary[600] é a
 * ÚNICA cor que permanece idêntica nos dois modos, de propósito (mesmo
 * raciocínio do mark da logo, que não muda de cor, só o texto ao redor).
 */
export const semantic = Object.freeze({
  light: {
    backgroundBase: neutral[0],
    backgroundElevated: neutral[50],
    textPrimary: neutral[900],
    textSecondary: neutral[700],
    borderDefault: neutral[200]
  },
  dark: {
    backgroundBase: neutral[900],
    backgroundElevated: neutral[800],
    textPrimary: neutral[0],
    textSecondary: neutral[200],
    borderDefault: neutral[700]
  }
});

export const colors = Object.freeze({ primary, neutral, success, warning, danger, info, semantic });
