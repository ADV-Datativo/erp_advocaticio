// modules/configuracoes-gerais/configuracoes-gerais.service.js
// Regra de negócio pura. Nunca toca DOM.

import { COR_PRIMARIA_PADRAO, COR_DESTAQUE_PADRAO } from './configuracoes-gerais.constants.js';
import * as repository from './configuracoes-gerais.repository.js';

/**
 * Clareia (fator positivo) ou escurece (fator negativo) uma cor hex.
 * Extraído de ajustarLuminosidade original, linhas 8788-8800.
 * @param {string} hex @param {number} fator entre -1 e 1
 */
export function ajustarLuminosidade(hex, fator) {
  hex = (hex || COR_PRIMARIA_PADRAO).replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  let r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
  const ajustar = (canal) => (fator >= 0 ? Math.round(canal + (255 - canal) * fator) : Math.round(canal * (1 + fator)));
  r = Math.max(0, Math.min(255, ajustar(r)));
  g = Math.max(0, Math.min(255, ajustar(g)));
  b = Math.max(0, Math.min(255, ajustar(b)));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** Converte hex pra rgba(...). Extraído de hexParaRgba original, linhas 8803-8808. */
export function hexParaRgba(hex, alpha) {
  hex = (hex || COR_PRIMARIA_PADRAO).replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * true se a cor é "clara" (precisa de texto escuro sobre ela) — luminância
 * relativa. Extraído de corEhClara original, linhas 8811-8817.
 */
export function corEhClara(hex) {
  hex = (hex || COR_PRIMARIA_PADRAO).replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6;
}

/**
 * Calcula TODAS as variáveis CSS que aplicarAparencia() precisa aplicar
 * — separando o CÁLCULO (aqui, puro, testável) da ESCRITA no DOM
 * (controller). Extraído de aplicarAparencia original, linhas 8831-8852.
 * @param {string} primaria @param {string} destaque
 * @returns {{variaveis: Record<string,string>, topbarClara: boolean}}
 */
export function calcularVariaveisTema(primaria, destaque) {
  const topbarClara = corEhClara(primaria);
  return {
    topbarClara,
    variaveis: {
      '--navy': primaria,
      '--navy-dark': ajustarLuminosidade(primaria, -0.25),
      '--blue-600': primaria,
      '--blue-700': ajustarLuminosidade(primaria, -0.2),
      '--blue-800': ajustarLuminosidade(primaria, -0.35),
      '--blue-900': ajustarLuminosidade(primaria, -0.5),
      '--blue-400': ajustarLuminosidade(primaria, 0.3),
      '--blue-200': ajustarLuminosidade(primaria, 0.55),
      '--blue-100': ajustarLuminosidade(primaria, 0.7),
      '--blue-50': ajustarLuminosidade(primaria, 0.85),
      '--gold': destaque,
      '--gold-light': ajustarLuminosidade(destaque, 0.25),
      '--nav-active-bg': hexParaRgba(destaque, 0.25),
      '--topbar-bg-custom': primaria,
      '--topbar-text-custom': topbarClara ? 'var(--text-primary)' : '#FFFFFF',
      '--topbar-text-muted-custom': topbarClara ? 'var(--text-muted)' : 'rgba(255,255,255,0.65)',
      '--topbar-border-custom': topbarClara ? 'var(--border)' : 'rgba(255,255,255,0.25)',
      '--topbar-surface-custom': topbarClara ? 'var(--surface)' : 'rgba(255,255,255,0.12)'
    }
  };
}

/**
 * Resolve a cor primária/destaque efetivas: config salva > defaults do
 * Theme Engine (window.DATATIVO_THEME_DEFAULTS) > defaults locais.
 * @param {object} aparenciaSalva @param {{corPrimaria: string, corDestaque: string}|null} defaultsThemeEngine
 */
export function resolverCoresEfetivas(aparenciaSalva, defaultsThemeEngine) {
  const ap = aparenciaSalva || {};
  const defaults = defaultsThemeEngine || { corPrimaria: COR_PRIMARIA_PADRAO, corDestaque: COR_DESTAQUE_PADRAO };
  return {
    primaria: ap.corPrimaria || defaults.corPrimaria,
    destaque: ap.corDestaque || defaults.corDestaque
  };
}

/**
 * Persiste a identidade visual de verdade no Supabase — achado crítico
 * corrigido em 12/08/2026 (antes só ia pro localStorage).
 * @param {{corPrimaria: string, corDestaque: string, logoBase64: string|null}} aparencia
 */
export async function salvarAparenciaNoBanco(aparencia) {
  await repository.salvarAparenciaNoBanco(aparencia);
}

/** @returns {Promise<{corPrimaria: string|null, corDestaque: string|null, logoBase64: string|null}>} */
export async function carregarAparenciaDoBanco() {
  return repository.carregarAparenciaDoBanco();
}
