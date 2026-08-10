// core/theme/tokens/typography.js
//
// Datativo Neo reservada para wordmark/logo (imagem, não depende de
// fonte carregada) e materiais de marca — sem arquivo de fonte real
// confirmado para uso em interface. Inter assume toda a tipografia do
// sistema, conforme aprovado (ver tokens-proposta.md, item 6).

export const fontFamily = Object.freeze({
  ui: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  brand: "'Datativo Neo', 'Inter', sans-serif" // só para wordmark/marketing, não para UI do sistema
});

/** Escala de tamanho — razão ~1.25, corpo em 14px (piso de acessibilidade já definido em 05-accessibility.md). */
export const fontSize = Object.freeze({
  xs: '12px',
  sm: '13px',
  base: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '22px',
  '3xl': '28px'
});

export const fontWeight = Object.freeze({
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
});

export const lineHeight = Object.freeze({
  tight: 1.25,   // títulos
  base: 1.5,     // corpo de texto
  relaxed: 1.75  // parágrafos longos
});

export const typography = Object.freeze({ fontFamily, fontSize, fontWeight, lineHeight });
