# Integrações — submódulo do domínio Sistema

## Status
**Migrado completamente** (11/08/2026). 4 de 5 submódulos de "Opções"
migrados. Cobre `getConfigWpp`, `salvarConfigWpp`, `resetarMsgWpp`,
`resetarMsgRecibo`, `mostrarPreviewWpp`, `inserirVariavel`,
`renderPreviewWpp`, `carregarConfigWpp`.

## Achado: 3 funções da mesma área já eram código morto
`abrirModalWppRecibo`, `montarMensagemWpp`, `abrirModalWpp` e
`montarMensagemRecibo` também apareciam na busca inicial por "wpp", mas
já são código morto — pertencem a **Recebimentos** (mensagem de cobrança
por parcela específica), já migradas há várias etapas. Não fazem parte
deste submódulo.

## Achado de dependência cruzada: Recebimentos já usa `window.getConfigWpp`
O submódulo Recebimentos (já migrado) recebe `getConfigWpp` como
dependência injetada via `window.getConfigWpp`. Este submódulo agora é
quem define essa global — `window.getConfigWpp = service.carregarConfig`.
Verificado que a lógica interna das duas versões (antiga do monólito e
nova daqui) é **idêntica byte a byte** — não há risco de comportamento
diferente independente de qual das duas tags carrega primeiro.

## Achado já registrado, não corrigido aqui
Config de WhatsApp (número, PIX, templates de mensagem) só existe em
`localStorage` — não sincroniza entre dispositivos do mesmo escritório.
Mesma categoria do achado sobre cores/logo de Aparência. Preservado
exatamente como estava; decisão de corrigir fica pro Renan.

## Estrutura
```
integracoes/
├── index.js
├── integracoes.controller.js    # única camada que lê o DOM
├── integracoes.service.js       # montagem de preview (template + variáveis)
├── integracoes.repository.js    # só fala com localStorage
├── integracoes.validation.js    # vazio — sem validação no original
├── integracoes.events.js        # vazio
└── integracoes.constants.js     # WPP_KEY, dados de amostra do preview
```

## O que não mudou
Templates padrão (`WPP_MSG_PADRAO`/`WPP_MSG_RECIBO_PADRAO`, já expostos
em `window` desde a migração de Recebimentos), variáveis substituíveis
(`{{NOME}}`, `{{PIX}}` etc.), dados de amostra usados no preview
("João Silva", processo de exemplo) — tudo idêntico ao original.
