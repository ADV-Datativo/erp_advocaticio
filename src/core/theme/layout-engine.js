// core/theme/layout/layout-engine.js
//
// Sprint 5. Achado na auditoria: diferente do Component Library
// (Sprint 4), a estrutura de página (sidebar + área de trabalho) JÁ é
// centralizada — todo "page" injeta conteúdo dentro da mesma casca
// única (#app-wrapper > aside.sidebar + main), não duplicada por tela.
// Não há god-refactor necessário aqui.
//
// A única duplicação real encontrada: o breakpoint mobile (768px) está
// hardcoded em JS em pelo menos 1 lugar (cálculo de altura de célula do
// calendário da Agenda), fora do CSS que já usa a mesma media query.
// Este arquivo expõe o valor do token pro monólito consumir, evitando
// número mágico duplicado em futuros usos.

import { theme } from '../tokens/index.js';

const MOBILE_BREAKPOINT_PX = parseInt(theme.breakpoints.mobile, 10); // 768

window.DATATIVO_LAYOUT = Object.freeze({
  mobileBreakpointPx: MOBILE_BREAKPOINT_PX,
  isMobile: () => window.innerWidth <= MOBILE_BREAKPOINT_PX
});

console.info('[layout-engine] breakpoint mobile carregado do token:', MOBILE_BREAKPOINT_PX + 'px');
