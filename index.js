// core/permissions/index.js
//
// Sprint 8 (RBAC). Substitui o stub que sempre retornava `true` por
// verificação real, usando a matriz granular (permissions-matrix.js),
// derivada 1:1 do PERFIS.pode que já existia no monólito.
//
// ACHADO CRÍTICO da auditoria de segurança (07/08/2026): o `pode(acao)`
// do monólito existia mas nunca era chamado em nenhuma ação — o sistema
// de permissão só controlava visibilidade de menu, nunca bloqueava a
// execução. Esta etapa corrige isso de fato: `pode()` agora tem lógica
// real, e passou a ser chamada em ações destrutivas reais (ver
// instrumentação em despesas.controller.js e no monólito, função
// removerUsuarioEscritorio — o exemplo exato usado na auditoria).

import { PERMISSOES_POR_PERFIL } from './permissions-matrix.js';
import { AuthorizationError } from '../errors/index.js';

/**
 * @param {string} permissao formato "dominio.submodulo.acao", ex: "financeiro.despesas.delete"
 * @param {string} [perfilExplicito] se omitido, lê do monólito via window.getPerfilAtual()
 * @returns {boolean}
 */
export function pode(permissao, perfilExplicito) {
  const perfil = perfilExplicito || (typeof window !== 'undefined' && window.getPerfilAtual ? window.getPerfilAtual() : 'admin');
  const permissoes = PERMISSOES_POR_PERFIL[perfil];
  if (!permissoes) {
    console.warn(`[permissions] perfil "${perfil}" não encontrado na matriz — negando por padrão.`);
    return false;
  }
  return permissoes.includes(permissao);
}

/**
 * Lança AuthorizationError se a permissão não existir. Uso típico:
 *   exigirPermissao('financeiro.despesas.delete');
 *   // código só chega aqui se tiver permissão
 * @param {string} permissao
 * @param {string} [perfilExplicito]
 */
export function exigirPermissao(permissao, perfilExplicito) {
  if (!pode(permissao, perfilExplicito)) {
    throw new AuthorizationError(`Sem permissão para "${permissao}".`);
  }
}

export { PERMISSOES_POR_PERFIL } from './permissions-matrix.js';
