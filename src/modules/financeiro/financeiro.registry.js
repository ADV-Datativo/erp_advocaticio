// financeiro.registry.js
//
// Registro de status de migração dos 3 submódulos do domínio Financeiro
// (Recebimentos, Despesas, Relatórios), e ponto único pelo qual um
// submódulo pode pedir dados agregados de outro — nenhum submódulo importa
// arquivos de dentro de outro submódulo diretamente. Toda comunicação
// passa por aqui + pelo financeiro.controller.js.
//
// Também é o ponto que domínios EXTERNOS (ex: Processos, quando migrado)
// usam para pedir dados de Recebimentos sem conhecer sua estrutura interna
// — decisão registrada em 06/08/2026: o preview de parcelas na tela de
// Processos continua fisicamente em Processos, mas busca dado aqui.

/** @typedef {'monolito' | 'migrado'} StatusModulo */

/** @type {Record<'recebimentos'|'despesas'|'relatorios', StatusModulo>} */
const registro = {
  recebimentos: 'monolito',
  despesas: 'monolito',
  relatorios: 'monolito'
};

/** @type {Record<string, object>} cada submódulo migrado registra aqui as funções que expõe para os demais. */
const provedores = {};

/**
 * @param {'recebimentos'|'despesas'|'relatorios'} submodulo
 * @returns {StatusModulo}
 */
export function statusDoSubmodulo(submodulo) {
  return registro[submodulo] || 'monolito';
}

export function estaMigrado(submodulo) {
  return statusDoSubmodulo(submodulo) === 'migrado';
}

/**
 * Chamado pelo index.js de cada submódulo quando termina de migrar.
 * @param {'recebimentos'|'despesas'|'relatorios'} submodulo
 * @param {object} apiPublica funções que este submódulo expõe para os demais
 *   (ex: despesas expõe `{ listarDoPeriodo }` para Relatórios usar)
 */
export function registrarSubmodulo(submodulo, apiPublica = {}) {
  if (!(submodulo in registro)) {
    console.warn(`[financeiro.registry] "${submodulo}" não é um submódulo financeiro conhecido.`);
    return;
  }
  registro[submodulo] = 'migrado';
  provedores[submodulo] = apiPublica;
}

/**
 * Ponto de acesso mediado: pega a API pública de um submódulo já migrado.
 * Retorna null se o submódulo ainda não migrou — quem chama decide o
 * fallback (ex: ler do `store` global enquanto isso, como hoje).
 * @param {'recebimentos'|'despesas'|'relatorios'} submodulo
 */
export function apiDoSubmodulo(submodulo) {
  return provedores[submodulo] || null;
}
