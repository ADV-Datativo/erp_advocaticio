# Configurações Gerais (Identidade Visual) — submódulo do domínio Sistema

## Status
**Migrado completamente** (11/08/2026). **5 de 5 submódulos de "Opções"
migrados** — Opções, como conceito único, deixou de existir no sistema.
Cobre `aplicarAparencia`, `carregarFormAparencia`, `sincronizarCorHex`,
`previewAparencia`, `atualizarPreviewLogo`, `handleUploadLogo`,
`removerLogoCustomizada`, `salvarAparencia`, `restaurarAparenciaPadrao`,
mais os 3 helpers puros de cor (`ajustarLuminosidade`, `hexParaRgba`,
`corEhClara`).

## Escopo deliberadamente reduzido
`getNomeEscritorio`, `setNomeEscritorio`, `getDadosEscritorio` e
`getLogoInlineHtml` **ficaram no monólito de propósito** — são usadas
por vários outros domínios já migrados (Recebimentos, por exemplo, via
dependência injetada). Migrar essas 4 agora seria escopo maior que o
necessário, com risco real de quebrar quem já depende delas, sem ganho
proporcional. Mesmo raciocínio já aplicado antes (não duplicar
`fmtMoney`/`fmtDate` no Core).

## Dois sistemas de cor que parecem redundantes, mas não são
Os tokens de marca (`core/theme/tokens/colors.js`, Sprint 2) são a
paleta **curada à mão** da Datativo Labs. `ajustarLuminosidade()` é um
**algoritmo em tempo real** que gera uma rampa de cor a partir de
**qualquer** cor que um escritório cliente escolher na tela de
Identidade Visual — precisa funcionar pra hex arbitrário, não só pro
verde Datativo. Testei e confirmei: `ajustarLuminosidade('#227056', -0.2)`
dá `#1b5a45`, muito próximo mas não idêntico ao `primary.700` do token
(`#1B5B45`, escolhido à mão). **Isso é esperado, não é bug** — são dois
sistemas com propósitos diferentes, documentado aqui pra ninguém tentar
"corrigir" a diferença depois.

## `window._apLogoTemp` virou estado local do módulo
Confirmei que essa variável global só era usada dentro deste cluster de
funções — migrada pra `configuracoes-gerais.state.js` sem risco.

## Separação de cálculo e escrita no DOM
`aplicarAparencia()` original misturava cálculo de cor com escrita
direta no DOM. Separado: `service.calcularVariaveisTema()` calcula
**todas** as variáveis CSS de uma vez (puro, testável, retorna um
objeto), e o controller só aplica esse resultado via
`root.style.setProperty()` num loop — sem repetir a lógica de cálculo
17 vezes como antes.

## Estrutura
```
configuracoes-gerais/
├── index.js
├── configuracoes-gerais.controller.js    # única camada que lê/escreve o DOM
├── configuracoes-gerais.service.js       # cálculo de cor puro (testado em runtime)
├── configuracoes-gerais.state.js         # substitui window._apLogoTemp
├── configuracoes-gerais.validation.js    # cor hex, nome obrigatório, arquivo de logo
├── configuracoes-gerais.events.js        # vazio
└── configuracoes-gerais.constants.js     # padrões vindos dos tokens (Sprint 2), não re-hardcoded
```

## O que não mudou
Toda a lógica de derivação de cor (mesmos fatores de luminosidade:
-0.25, -0.2, -0.35, -0.5, 0.3, 0.55, 0.7, 0.85), contraste automático da
topbar, upload/preview/remoção de logo (limite de 2MB), texto de
confirmação ao restaurar padrão — tudo idêntico ao original.
