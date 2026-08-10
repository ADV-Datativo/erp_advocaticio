// core/theme/tokens/zindex.js
//
// ACHADO (07/08/2026): o app hoje usa z-index sem escala consistente —
// valores encontrados no monólito: 0, 1, 20, 50, 100, 300, 301, 500,
// 999, 1000, 9000, 9999, 99999. Esta é uma escala NOVA e limpa para
// componentes futuros (Sprint 4) — reconciliar com os valores antigos
// do monólito é trabalho de Theme Engine/Component Library, não desta
// etapa de definição de tokens.

export const zIndex = Object.freeze({
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600
});
