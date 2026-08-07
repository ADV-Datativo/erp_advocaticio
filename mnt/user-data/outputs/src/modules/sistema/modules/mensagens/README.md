# Mensagens (Portal) — submódulo do domínio Sistema

## Status
**Migrado completamente** (06/08/2026). Cobre `renderMensagensPortal`,
`abrirConversaPortal`, `responderMensagemPortal`, e as funções internas
`carregarMensagensPortal`, `atualizarBadgeMsgsPortal`,
`renderMensagensConversaPortal` (essas três não eram globais chamadas via
`onclick`, viraram funções internas do controller/service).

## Achado da auditoria: "chat interno" não existe
A documentação do projeto registra um "chat interno (grupos/DMs/@menções)"
como concluído. Não encontrei nenhuma função correspondente no código
real — só existe esta conversa 1:1 Escritório↔Cliente do Portal
(`portal_mensagens`). Migrei o que existe de fato; a discrepância fica
registrada aqui para o Renan esclarecer se isso é um recurso que não foi
implementado, foi implementado em outro lugar não encontrado, ou é
confusão de documentação.

## Estado local de verdade (diferente de Financeiro)
`mensagens.state.js` **não é uma fachada** sobre `store` global — as
variáveis originais (`_mpClienteAtual`, `_mpMensagensCache`) nunca
fizeram parte do `store`, eram `let` isoladas. Este submódulo é dono de
verdade do seu próprio estado (qual conversa está aberta, mensagens
carregadas dela).

## Correção de comportamento evitada de propósito
A validação de conteúdo vazio (`responderMensagemPortal`, linha 6872 do
original) é um guard silencioso — sem toast, sem mensagem. Fiquei
tentado a usar `ValidationError` (padrão do Datativo Core) aqui, mas isso
faria o controller exibir um toast vazio, mudando comportamento visível.
`mensagens.validation.js` usa uma função booleana simples
(`conteudoEhValido`) em vez de exception, preservando o silêncio
original.

## Estrutura
```
mensagens/
├── index.js                   # registra globais + declara "migrado" no sistema.registry.js
├── mensagens.controller.js    # única camada que lê o DOM
├── mensagens.service.js       # regra de negócio pura
├── mensagens.repository.js    # única camada que fala com o Supabase
├── mensagens.state.js         # estado local de verdade (não fachada)
├── mensagens.validation.js    # validação booleana, sem exception (ver nota acima)
├── mensagens.events.js        # vazio, com nota sobre oportunidade futura de badge compartilhado
├── mensagens.constants.js     # REMETENTE
└── components/
    ├── lista-conversas.js
    └── mensagens-chat.js
```

## Comunicação com outros submódulos
Mensagens não importa nada de Informativos nem de Opções. Registra API
vazia por ora em `registrarSubmodulo('mensagens', {})` — nada ainda
consome dado de Mensagens de fora do submódulo. Candidato futuro: expor
`contarNaoLidas` para um componente de badge de notificação compartilhado
com Informativos (mesma sugestão do Renan sobre "revelar padrões
reutilizáveis").

## O que não mudou
Layout do chat, agrupamento por cliente, marcação de lida via RPC
(`marcar_mensagem_lida`), ordem de mensagens, comportamento de envio —
tudo idêntico ao original.
