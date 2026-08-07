// core/registry/index.js
//
// Registry compartilhado de MÓDULOS DA APLICAÇÃO (granularidade grossa:
// "Financeiro", "Operacional", "Diário Oficial" — não confundir com
// financeiro.registry.js / operacional.registry.js, que são registries de
// SUBMÓDULO dentro de um domínio específico).
//
// Relação entre os três níveis, do mais grosso ao mais fino:
//   core/registry          → todos os módulos da aplicação
//   financeiro.registry.js → só os submódulos de Financeiro
//   (futuro) operacional.registry.js → só os submódulos de Operacional
//
// Nenhum módulo existente foi religado para se registrar aqui ainda —
// isso é infraestrutura pronta, não uma migração dos módulos já feitos
// (Despesas, Recebimentos, Diário Oficial). Religar esses três é o
// próximo passo natural, mas fora do escopo desta etapa ("criar apenas
// infraestrutura compartilhada").

/**
 * @typedef {object} ModuloRegistrado
 * @property {string} id — identificador único, ex: 'financeiro.recebimentos'
 * @property {string} nome — nome legível, ex: 'Recebimentos'
 * @property {string} versao — ex: '1.0.0'
 * @property {'monolito'|'migrado'|'em-migracao'} status
 * @property {string[]} dependencias — ids de outros módulos dos quais este depende
 * @property {string|null} featureFlag — nome da feature flag que controla este módulo, se houver
 * @property {string[]} permissoes — permissões necessárias para usar este módulo
 * @property {string} owner — quem é responsável por este módulo (pessoa/time)
 */

const registro = new Map();

/** @param {ModuloRegistrado} modulo */
export function registrar(modulo) {
  if (!modulo.id) throw new Error('[core/registry] módulo precisa de um "id" único.');
  registro.set(modulo.id, {
    versao: '0.0.0',
    status: 'monolito',
    dependencias: [],
    featureFlag: null,
    permissoes: [],
    owner: null,
    ...modulo
  });
}

/** @param {string} id @returns {ModuloRegistrado|undefined} */
export function obter(id) {
  return registro.get(id);
}

/** @returns {ModuloRegistrado[]} todos os módulos registrados. */
export function listarTodos() {
  return Array.from(registro.values());
}

/** @param {string} id @returns {boolean} */
export function estaRegistrado(id) {
  return registro.has(id);
}

/**
 * @param {string} id
 * @returns {string[]} ids de dependência que NÃO estão registrados —
 *   lista vazia significa que todas as dependências existem.
 */
export function dependenciasFaltantes(id) {
  const modulo = registro.get(id);
  if (!modulo) return [];
  return modulo.dependencias.filter((depId) => !registro.has(depId));
}
