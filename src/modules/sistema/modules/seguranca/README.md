# Segurança — submódulo do domínio Sistema

## Status
**Migrado completamente** (11/08/2026). Primeiro dos 5 submódulos que
substituem "Opções" (auditoria de 07/08/2026 identificou 5
responsabilidades técnicas distintas coladas na mesma tela). Cobre
`avaliarForcaSenha` e `alterarSenha`.

## Escopo
Só troca de senha do usuário logado. `cadastrarUsuario`/`recuperarSenha`
(pré-login) e `removerUsuarioEscritorio` (administração de outros
usuários) **não** fazem parte deste submódulo — pertencem a Login
(fora de qualquer domínio) e ao submódulo Usuários (próxima etapa),
respectivamente.

## Bug real corrigido durante a migração
`avaliarForcaSenha` original: quando a senha tem `score = 0` (ex: 2
caracteres, sem letra maiúscula+número, sem símbolo), o código fazia
`colors[score-1]` → `colors[-1]` → `undefined`. O rótulo mostraria
literalmente **"Força: undefined"** para o usuário. Corrigido no
`seguranca.service.js`: `score === 0` agora usa explicitamente a
primeira cor/label ("Fraca"), sem índice negativo.

## Arquitetura
`seguranca.repository.js` fala só com Supabase **Auth** (não com
tabela nenhuma) — `signInWithPassword` pra confirmar a senha atual
(reautenticação, já que a Auth do Supabase não tem endpoint de
"verificar senha sem logar"), e `updateUser` pra trocar de fato.

Erro de "senha atual incorreta" vira `ValidationError` (é um erro
corrigível pelo usuário, não falha de infraestrutura) — só falha real
de conexão vira `RepositoryError`.

## Estrutura
```
seguranca/
├── index.js
├── seguranca.controller.js    # única camada que lê o DOM
├── seguranca.service.js       # cálculo de força + orquestração da troca
├── seguranca.repository.js    # só fala com Supabase Auth
├── seguranca.validation.js    # validação da nova senha
├── seguranca.events.js        # vazio — sem addEventListener próprio
└── seguranca.constants.js     # cores/labels de força
```

## O que não mudou
Critério de força (comprimento, maiúscula+número, símbolo), mensagens de
erro, fluxo de reautenticação — tudo idêntico, exceto o bug do
"undefined" corrigido.
