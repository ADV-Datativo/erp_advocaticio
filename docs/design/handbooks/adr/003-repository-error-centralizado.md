# ADR-003: Classes de erro centralizadas no Core

**Data:** 07/08/2026 | **Status:** Aceito

## Contexto
`RepositoryError` foi implementada de forma idêntica, de forma
duplicada, em `despesas.repository.js` e `recebimentos.repository.js`
durante o piloto de migração (antes do Datativo Core existir).

## Decisão
`src/core/errors/` centraliza `AppError`, `RepositoryError`,
`ValidationError`, `BusinessRuleError`, `AuthorizationError`.
Repositories importam e **re-exportam** com o mesmo nome
(`export { RepositoryError };`), pra controllers não precisarem trocar
import quando a origem migra.

## Consequências
- Uma só definição de cada erro no sistema inteiro
- `ValidationError` ainda não foi migrada pros submódulos existentes
  (decisão explícita de escopo — só `RepositoryError` nesta etapa)
- `instanceof` funciona corretamente entre módulos (mesma referência de
  classe, não redefinida em cada arquivo)
