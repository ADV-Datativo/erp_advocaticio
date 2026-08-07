// sistema.registry.js
// Registro de status de migração dos 3 submódulos de Sistema
// (Mensagens, Informativos, Opções) e ponto de acesso mediado entre
// eles. Mesmo padrão já usado em financeiro.registry.js.

/** @typedef {'monolito' | 'migrado'} StatusModulo */

/** @type {Record<'mensagens'|'informativos'|'opcoes', StatusModulo>} */
const registro = {
  mensagens: 'monolito',
  informativos: 'monolito',
  opcoes: 'monolito'
};

const provedores = {};

export function statusDoSubmodulo(submodulo) {
  return registro[submodulo] || 'monolito';
}

export function estaMigrado(submodulo) {
  return statusDoSubmodulo(submodulo) === 'migrado';
}

/**
 * @param {'mensagens'|'informativos'|'opcoes'} submodulo
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
