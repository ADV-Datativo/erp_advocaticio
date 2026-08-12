# Informativos — submódulo do domínio Sistema

## Status
**Migrado completamente** (11/08/2026). Cobre `renderInformativos`,
`marcarComoLidoUI`, `abrirAnexoInformativo` (usadas na própria tela) e
`carregarInformativos`/`atualizarBadgeInformativos` (usadas também no
fluxo de LOGIN, fora da tela de Informativos — achado que quase passou
despercebido, ver abaixo).

## Achado: uso fora da própria tela
O monólito chama `carregarInformativos()`/`atualizarBadgeInformativos()`
direto no fluxo de login (linhas 15393-15394 originais), pra já mostrar
o badge de não-lidos assim que a sessão inicia, sem esperar o usuário
abrir a página de Informativos. Migrado, mas exigiu conferir todos os
pontos de chamada no arquivo inteiro, não só dentro da própria tela —
lição já registrada em migrações anteriores, reforçada aqui.

## Acoplamento preservado, não absorvido
`renderInformativos()` também aciona `atualizarBadgeNotif()` e
`renderNotifList()` — o "sino de notificações" geral (terceiro sistema
de notificação do app, separado de Informativos e Mensagens, usa
`localStorage` só local, achado da auditoria de segurança). Esse
acoplamento foi **preservado via dependência injetada**, não absorvido
pelo submódulo nem removido — não é responsabilidade de Informativos
consolidar isso agora.

## Correção de camada (pequena, documentada)
`obterUrlAnexoInformativo()` original chamava `showToast()` direto de
dentro do repository em caso de erro — violação da regra de camada
(repository não deve ter efeito de UI). Corrigido: repository agora só
retorna `null` e loga via `console.warn`; o toast é responsabilidade do
controller (`onAbrirAnexoInformativo`). Comportamento visível idêntico
ao usuário, só a organização interna mudou.

## RLS-only, sem filtro client-side
Diferente do padrão dos outros repositories já migrados,
`carregarInformativos()` não filtra por `escritorio_id` no cliente —
depende inteiramente da política de RLS pra decidir o que é "para
todos" vs específico de um escritório (`escritorio_id: null` = global).
Preservado como estava — decisão original de design, não bug.

## Estrutura
```
informativos/
├── index.js                      # registra globais (incl. os usados no login) + declara "migrado"
├── informativos.controller.js    # única camada que lê o DOM
├── informativos.service.js       # regra de negócio pura
├── informativos.repository.js    # única camada que fala com Supabase + Storage
├── informativos.state.js         # fachada sobre store.informativos
├── informativos.validation.js    # vazio — tela é só leitura
├── informativos.events.js        # vazio — sem addEventListener próprio
├── informativos.constants.js     # INFORMATIVO_TIPOS
└── components/
    └── lista-informativos.js     # renderização pura
```

## O que não mudou
Layout dos cards, cores por tipo (normal/urgente/atualização), lógica de
"lido"/"não lido", anexo via Storage assinado (300s de validade) — tudo
idêntico ao comportamento original.
