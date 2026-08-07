// core/permissions/index.js
//
// Infraestrutura de permissões, SEM regras implementadas ainda — como
// pedido explicitamente. Hoje o sistema de permissão real do ADV Easy é
// o objeto PERFIS no monólito (aplicarPermissoes()), que controla
// visibilidade de menu por perfil (admin/advogado/financeiro/assistente).
// Isso continua sendo a fonte de verdade; nada aqui o substitui ainda.
//
// Este arquivo só define o formato que uma verificação de permissão vai
// ter quando a infraestrutura for de fato usada por algum módulo.

/**
 * @typedef {object} ContextoPermissao
 * @property {string} perfil — perfil do usuário logado (ex: 'advogado')
 * @property {string} acao — ação sendo verificada (ex: 'excluir', 'editar')
 * @property {string} recurso — recurso sendo acessado (ex: 'despesa', 'cliente')
 */

/**
 * Verifica se um contexto tem permissão. HOJE SEMPRE RETORNA true — não
 * implementa nenhuma regra, é só o formato da função que módulos futuros
 * vão chamar. Nenhum módulo chama isto ainda.
 * @param {ContextoPermissao} contexto
 * @returns {boolean}
 */
export function pode(contexto) {
  return true;
}

/**
 * Lança AuthorizationError se `pode(contexto)` for false. Também não
 * utilizada por nenhum módulo ainda.
 * @param {ContextoPermissao} contexto
 */
export async function exigirPermissao(contexto) {
  if (!pode(contexto)) {
    const { AuthorizationError } = await import('../errors/index.js');
    throw new AuthorizationError(`Sem permissão para "${contexto.acao}" em "${contexto.recurso}".`);
  }
}
