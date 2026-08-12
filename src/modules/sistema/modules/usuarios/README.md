# Usuários — submódulo do domínio Sistema

## Status
**Migrado completamente** (11/08/2026). 2 de 5 submódulos de "Opções"
migrados. Cobre `renderUsuarios`, `renderConvitesPendentes`,
`abrirModalConvite`, `enviarConvite`, `cancelarConvite`,
`removerUsuarioEscritorio`.

## RBAC preservado, não recriado
`removerUsuarioEscritorio` já tinha checagem real de permissão
(`sistema.usuarios.delete`) instrumentada na Sprint 8 — era o exemplo
usado na própria auditoria de segurança que motivou o RBAC. Preservada
aqui, agora via `import` direto do Core (`core/permissions/index.js`),
em vez da ponte `window.DATATIVO_PERMISSIONS` que o monólito ainda
precisa usar.

## Achado técnico: `PERFIS` também não virava `window` automaticamente
Mesmo problema já visto antes com `WPP_MSG_PADRAO`/`WPP_MSG_RECIBO_PADRAO`
— `const PERFIS` de topo não vira propriedade global sozinha. Precisou
de uma linha aditiva no monólito (`window.PERFIS = PERFIS;`) pra este
submódulo conseguir ler o mesmo objeto. Não muda conteúdo nem
comportamento.

## Convite não é INSERT direto
`enviarConvite` fala com a **Edge Function** `convidar-usuario` (via
`fetch`, com token de autenticação), não com a tabela direto — a
function do lado do servidor cria o convite e dispara o e-mail. `SB_URL`
precisou ser exportado de `core/supabase-client.js` (só existia
internamente) pra não duplicar essa URL numa segunda fonte de verdade.

## Sem cache — igual ao original
`usuarios`/`convites` nunca fizeram parte de `store` global — sempre
buscados fresco a cada render, sem cache persistente entre chamadas.
`usuarios.state.js` existe só pela estrutura padrão do submódulo, não
porque o comportamento original precisava de cache.

## Estrutura
```
usuarios/
├── index.js
├── usuarios.controller.js    # única camada que lê o DOM
├── usuarios.service.js       # orquestração pura
├── usuarios.repository.js    # tabelas + Edge Function
├── usuarios.state.js         # local, sem cache persistente (mesmo padrão original)
├── usuarios.validation.js    # validação de e-mail
├── usuarios.events.js        # vazio
└── usuarios.constants.js     # vazio — PERFIS fica no monólito, injetado como dependência
```

## Pendência já conhecida, não desta migração
Edge Function `convidar-usuario` em si (código do lado do servidor)
nunca foi revisada — achado da auditoria de segurança complementar,
segue em aberto.
