// modules/operacional/operacional.registry.js
//
// Registro de status de migração das 7 áreas de negócio que hoje vivem sob
// a categoria "Operacional". Serve para o orquestrador (a ser construído
// nas próximas etapas) saber, área por área, se já existe uma implementação
// migrada (Controller/Service/Repository em src/modules/<area>/) ou se a
// área ainda depende inteiramente das funções globais do monólito.
//
// Neste momento (Etapa 1), NENHUMA das 7 áreas foi migrada — só o módulo
// Financeiro (fora da categoria Operacional) está migrado até agora. Este
// arquivo documenta esse estado real; não migra nada sozinho.

import { PAGINAS_OPERACIONAIS } from './operacional.constants.js';

/**
 * @typedef {'monolito' | 'migrado'} StatusModulo
 */

/** @type {Record<string, StatusModulo>} */
const REGISTRO_INICIAL = Object.fromEntries(
  PAGINAS_OPERACIONAIS.map((pagina) => [pagina, 'monolito'])
);

const registro = { ...REGISTRO_INICIAL };

/**
 * @param {string} pagina uma das PAGINAS_OPERACIONAIS
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
 * Marca uma área como migrada. Chamado pelo index.js de cada módulo,
 * quando ele terminar de ser extraído (ex: diario-oficial na Etapa 2).
 * @param {string} pagina
 */
export function marcarComoMigrado(pagina) {
  if (!PAGINAS_OPERACIONAIS.includes(pagina)) {
    console.warn(`[operacional.registry] "${pagina}" não é uma página operacional conhecida.`);
    return;
  }
  registro[pagina] = 'migrado';
}

/** @returns {Record<string, StatusModulo>} cópia do registro completo, para inspeção/debug. */
export function snapshotRegistro() {
  return { ...registro };
}
