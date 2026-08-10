// core/theme/tokens/index.js
//
// Ponto único de acesso a todos os tokens de design. Uso:
//   import { theme } from '.../core/theme/tokens/index.js';
//   theme.colors.primary[600]   // '#227056'
//   theme.spacing[4]            // '16px'
//
// Nunca importar valores de cor/espaçamento hardcoded direto num
// componente novo — sempre via este objeto. Regra definida pelo
// ChatGPT na proposta original da Fase 2, mantida integralmente.

import { colors } from './colors.js';
import { typography } from './typography.js';
import { spacing } from './spacing.js';
import { radius } from './radius.js';
import { shadow } from './shadow.js';
import { animation } from './animation.js';
import { breakpoints } from './breakpoints.js';
import { zIndex } from './zindex.js';
import { opacity } from './opacity.js';

export const theme = Object.freeze({
  colors,
  typography,
  spacing,
  radius,
  shadow,
  animation,
  breakpoints,
  zIndex,
  opacity
});

// Re-exports individuais, para quem só precisa de uma parte
export { colors, typography, spacing, radius, shadow, animation, breakpoints, zIndex, opacity };
