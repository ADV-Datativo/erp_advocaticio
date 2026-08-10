// core/theme/theme-engine.js
//
// Conecta os tokens (core/theme/tokens/) ao mecanismo de Aparência que
// JÁ EXISTE no monólito (aplicarAparencia, ajustarLuminosidade,
// corEhClara — todos sólidos, não foram reconstruídos). Este arquivo
// não substitui aquele mecanismo — só fornece os valores PADRÃO da
// Datativo Labs para ele consumir, no lugar dos antigos navy/dourado
// (#1A2E45/#C4A96B) hardcoded ali dentro.
//
// Arquitetura de 2 camadas confirmada com o Renan em 07/08/2026:
//   1. Todo escritório novo nasce com o padrão Datativo (este arquivo)
//   2. Cada escritório pode sobrescrever via Opções → Identidade Visual
//      (aplicarAparencia, sem mudança nenhuma nesse fluxo)
//
// Como o monólito é script clássico (não ES Module), ele não pode fazer
// `import` deste arquivo — por isso expomos os defaults em `window`,
// mesmo padrão já usado para expor WPP_MSG_PADRAO na direção oposta.

import { theme } from './tokens/index.js';

const DEFAULT_PRIMARY = theme.colors.primary[600]; // #227056
const DEFAULT_ACCENT = theme.colors.neutral[900];  // preto-azulado, ver decisão de 07/08/2026 (dourado -> neutro)

window.DATATIVO_THEME_DEFAULTS = Object.freeze({
  corPrimaria: DEFAULT_PRIMARY,
  corDestaque: DEFAULT_ACCENT
});

// Também expõe o objeto de tokens inteiro, para qualquer outro uso
// futuro do monólito ou de outros módulos migrados.
window.DATATIVO_THEME = theme;

/**
 * Atualiza a <meta name="theme-color"> (cor da barra do navegador em
 * mobile) para acompanhar a cor primária atual. Chamada uma vez no
 * carregamento, com o padrão Datativo — aplicarAparencia() já
 * existente no monólito continua responsável por atualizar isso de
 * novo caso o escritório tenha uma cor customizada.
 */
function atualizarMetaThemeColor(cor) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', cor);
}

atualizarMetaThemeColor(DEFAULT_PRIMARY);

console.info('[theme-engine] tokens Datativo carregados — padrão:', DEFAULT_PRIMARY);
