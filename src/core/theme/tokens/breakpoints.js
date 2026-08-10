// core/theme/tokens/breakpoints.js
//
// mobile reaproveita o breakpoint já real do app (@media max-width:768px,
// usado no #mobile-bottom-nav/#mobile-drawer — bug corrigido em sessão
// anterior). Não inventamos um novo valor — o Theme Engine (Sprint 3)
// vai se conectar a esse breakpoint já existente, não substituí-lo.

export const breakpoints = Object.freeze({
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px'
});
