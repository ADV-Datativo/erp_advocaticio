// sistema.registry.js
// Registro de status de migração dos submódulos de Sistema. "Opções"
// nunca foi 1 submódulo de verdade — auditoria (07/08/2026) identificou
// 5 responsabilidades técnicas distintas coladas na mesma tela por
// conveniência histórica. Aqui elas entram como submódulos irmãos,
// substituindo "opcoes" por completo — não existe mais uma entrada
// única "opcoes" no registry.

/** @typedef {'monolito' | 'migrado'} StatusModulo */

/**
 * @type {Record<
 *   'mensagens'|'informativos'|'seguranca'|'usuarios'|'auditoria'|'integracoes'|'configuracoes-gerais',
 *   StatusModulo
 * >}
 */
const registro = {
  mensagens: 'monolito',
  informativos: 'monolito',
  seguranca: 'monolito',
  usuarios: 'monolito',
  auditoria: 'monolito',
  integracoes: 'monolito',
  'configuracoes-gerais': 'monolito'
};

const provedores = {};

export function statusDoSubmodulo(submodulo) {
  return registro[submodulo] || 'monolito';
}

export function estaMigrado(submodulo) {
  return statusDoSubmodulo(submodulo) === 'migrado';
}

/**
 * @param {string} submodulo
 * @param {object} apiPublica
 */
export function registrarSubmodulo(submodulo, apiPublica = {}) {
  if (!(submodulo in registro)) {
    console.warn(`[sistema.registry] "${submodulo}" não é um submódulo de Sistema conhecido.`);
    return;
  }
  registro[submodulo] = 'migrado';
  provedores[submodulo] = apiPublica;
}

export function apiDoSubmodulo(submodulo) {
  return provedores[submodulo] || null;
}
