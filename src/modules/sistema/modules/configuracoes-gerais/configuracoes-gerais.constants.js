// modules/configuracoes-gerais/configuracoes-gerais.constants.js
// Valores padrão vindos dos tokens já existentes (Sprint 2) — fonte
// única, em vez de re-hardcodar '#227056'/'#0F172A' pela terceira vez
// no sistema (já apareciam soltos em aplicarAparencia, salvarAparencia,
// restaurarAparenciaPadrao, getLogoInlineHtml original).

import { theme } from '../../../../core/theme/tokens/index.js';

export const COR_PRIMARIA_PADRAO = theme.colors.primary[600]; // #227056
export const COR_DESTAQUE_PADRAO = theme.colors.neutral[900]; // #0F172A — confirmado idêntico ao valor original

export const REGEX_HEX = /^#[0-9A-Fa-f]{6}$/;
export const TAMANHO_MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
