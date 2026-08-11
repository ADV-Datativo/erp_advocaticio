# ADR-004: RBAC granular por ação, derivado 1:1 do sistema antigo

**Data:** 10/08/2026 | **Status:** Aceito

## Contexto
Achado crítico de segurança: `pode(acao)` existia no monólito mas nunca
era chamada em nenhuma ação real — só a visibilidade de menu (`PERFIS`)
era controlada. Qualquer usuário autenticado podia, em teoria, disparar
ações destrutivas via console do navegador.

## Decisão
Formato granular `dominio.submodulo.acao` (ex:
`financeiro.despesas.delete`), derivado **1:1** dos 6 flags grosseiros
que já existiam (`editarClientes`, `excluirClientes`, `verFinanceiro`,
`gerenciarUsuarios`, `verOpcoes`, `exportarRelatorio`) — nenhuma regra
de negócio nova nesta etapa, só reorganização + aplicação real.

## Consequências
- `pode()`/`exigirPermissao()` com lógica real, testada contra os 5 perfis
- Instrumentado em só 2 ações como prova de conceito
  (`removerUsuarioEscritorio` no monólito, `onExcluirDespesa` em
  Despesas) — as ~176 chamadas de ação restantes ainda não checam
  permissão
- Checagem de permissão falha **fechado** por padrão (nega se o módulo
  não carregou), não aberto — decisão consciente de segurança
- Distinções mais finas de política (ex: separar editar de excluir
  dentro de Financeiro) ficam para decisão explícita futura, não
  inventadas nesta etapa
