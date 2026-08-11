// core/permissions/permissions-matrix.js
//
// Matriz de permissões granulares, no formato dominio.submodulo.acao
// (formato aprovado pelo ChatGPT na proposta de RBAC). Derivada 1:1 dos
// 6 flags grosseiros que já existiam em PERFIS[perfil].pode no
// monólito — nenhuma regra de negócio nova foi inventada aqui, só
// reorganização. Decisões de política mais granulares (ex: separar
// "editar despesa" de "excluir despesa" dentro de Financeiro) ficam
// para uma etapa futura, com decisão explícita do Renan — este
// primeiro corte preserva exatamente a permissividade que já existia.
//
// Mapeamento de origem (flag antigo -> permissões novas):
//   editarClientes    -> cadastros.clientes.edit
//   excluirClientes   -> cadastros.clientes.delete
//   verFinanceiro     -> financeiro.*.read / .create / .edit / .delete
//                        (o sistema antigo não distinguia — preservado)
//   gerenciarUsuarios -> sistema.usuarios.*
//   verOpcoes         -> sistema.opcoes.read
//   exportarRelatorio -> financeiro.relatorios.export

const FINANCEIRO_COMPLETO = [
  'financeiro.despesas.read', 'financeiro.despesas.create', 'financeiro.despesas.edit', 'financeiro.despesas.delete',
  'financeiro.recebimentos.read', 'financeiro.recebimentos.create', 'financeiro.recebimentos.edit', 'financeiro.recebimentos.delete',
  'financeiro.relatorios.read'
];

export const PERMISSOES_POR_PERFIL = Object.freeze({
  admin: [
    'cadastros.clientes.edit', 'cadastros.clientes.delete',
    ...FINANCEIRO_COMPLETO, 'financeiro.relatorios.export',
    'sistema.usuarios.read', 'sistema.usuarios.create', 'sistema.usuarios.edit', 'sistema.usuarios.delete',
    'sistema.opcoes.read'
  ],
  advogado: [
    'cadastros.clientes.edit',
    ...FINANCEIRO_COMPLETO, 'financeiro.relatorios.export'
  ],
  financeiro: [
    ...FINANCEIRO_COMPLETO, 'financeiro.relatorios.export'
  ],
  assistente: [
    'cadastros.clientes.edit'
  ],
  // Mantido por compatibilidade — mesmo comentário já registrado no
  // monólito sobre cadastros antigos ainda não migrados pro banco real.
  secretaria: [
    'cadastros.clientes.edit'
  ]
});
