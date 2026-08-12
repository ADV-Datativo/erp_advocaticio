// modules/operacional/operacional.registry.js
//
// Registro de status de migração das áreas de Operacional. Nasceu na
// Etapa 1 só reconhecendo as 7 páginas de menu (PAGINAS_OPERACIONAIS).
// Estendido em 11/08/2026 pra aceitar também submódulos que NÃO são
// página própria — caso da Intimações, que vive dentro do detalhe de
// Processos, sem entrada de menu independente. As duas APIs convivem
// sobre o mesmo registro interno; `marcarComoMigrado` (mais antiga,
// já usada pelo Diário Oficial) continua funcionando sem mudança.

import { PAGINAS_OPERACIONAIS } from './operacional.constants.js';

/** @typedef {'monolito' | 'migrado'} StatusModulo */

/** Submódulos que existem mas não são página de menu própria. */
const SUBMODULOS_SEM_PAGINA = Object.freeze(['intimacoes']);

/** @type {Record<string, StatusModulo>} */
const registro = {
  ...Object.fromEntries(PAGINAS_OPERACIONAIS.map((pagina) => [pagina, 'monolito'])),
  ...Object.fromEntries(SUBMODULOS_SEM_PAGINA.map((nome) => [nome, 'monolito']))
};

const provedores = {};

function ehConhecido(nome) {
  return PAGINAS_OPERACIONAIS.includes(nome) || SUBMODULOS_SEM_PAGINA.includes(nome);
}

/**
 * @param {string} pagina
 * @returns {StatusModulo}
 */
export function statusDoModulo(pagina) {
  return registro[pagina] || 'monolito';
}

/** @returns {boolean} true se a área já tem implementação migrada. */
export function estaMigrado(pagina) {
  return statusDoModulo(pagina) === 'migrado';
}

/**
 * API original (Etapa 1) — mantida sem alteração, usada pelo Diário Oficial.
 * @param {string} pagina
 */
export function marcarComoMigrado(pagina) {
  if (!ehConhecido(pagina)) {
    console.warn(`[operacional.registry] "${pagina}" não é uma área operacional conhecida.`);
    return;
  }
  registro[pagina] = 'migrado';
}

/**
 * API mais recente (mesmo padrão de financeiro.registry.js/sistema.registry.js)
 * — usada por submódulos que também expõem API pública pra outros
 * consumirem via Registry.
 * @param {string} nome @param {object} [apiPublica]
 */
export function registrarSubmodulo(nome, apiPublica = {}) {
  marcarComoMigrado(nome);
  if (registro[nome] === 'migrado') provedores[nome] = apiPublica;
}

/** @param {string} nome @returns {object|null} */
export function apiDoSubmodulo(nome) {
  return provedores[nome] || null;
}

/** @returns {Record<string, StatusModulo>} cópia do registro completo, para inspeção/debug. */
export function snapshotRegistro() {
  return { ...registro };
}
