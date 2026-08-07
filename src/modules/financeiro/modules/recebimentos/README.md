# Recebimentos — submódulo do domínio Financeiro

## Status
**Migrado completamente** (06/08/2026). Cobre: `getParcelaStatus`,
`renderParcelas`, `renderFinVisao`, `updateParcelasSelect`,
`confirmarPagamento`, `marcarPago`, `abrirReagendar`/`confirmarReagendar`,
`abrirDescontoAcrescimo`/`calcularDA`/`confirmarDA`, `gerarParcelasManual`,
`gerarReciboPagamento`, `montarMensagemRecibo`/`abrirModalWppRecibo`,
`montarMensagemWpp`/`abrirModalWpp`.

## Bug corrigido durante a migração (decisão registrada)
`gerarParcelasManual` original escrevia direto em `store.parcelas` e
chamava `saveData()` (localStorage) — **nunca persistia no Supabase**.
Parcelas geradas manualmente por essa tela existiam só no navegador de
quem gerou; sumiam ao recarregar puxando dado do servidor, e nunca
apareciam para outros usuários do mesmo escritório.

Corrigido nesta migração (decisão explícita do Renan: "corrigir agora,
junto com a migração") para usar `repository.criarParcelas`, igual ao
resto do sistema. Comportamento visível ao usuário — quantidade de
parcelas, valores, datas geradas — é idêntico; a diferença é que agora
fica salvo de verdade.

## Dependência externa exposta via `window`
`WPP_MSG_PADRAO` e `WPP_MSG_RECIBO_PADRAO` são `const` no monólito —
diferente de `function`, `const` de topo não vira propriedade de
`window` automaticamente. Precisou de duas linhas aditivas no
`index.html` (`window.WPP_MSG_PADRAO = WPP_MSG_PADRAO;` e o equivalente
pro outro) para o módulo ES conseguir ler o mesmo valor. Não muda
conteúdo nem comportamento da mensagem — só expõe o que já existia.

## Estrutura
```
recebimentos/
├── index.js                     # registra globais + declara "migrado" no financeiro.registry.js
├── recebimentos.controller.js   # única camada que lê o DOM
├── recebimentos.service.js      # regra de negócio pura
├── recebimentos.repository.js   # única camada que fala com o Supabase
├── recebimentos.state.js        # fachada sobre store.parcelas
├── recebimentos.validation.js   # validações de formulário
├── recebimentos.constants.js    # labels/classes de status e tipo de ajuste
└── components/
    ├── tabela-parcelas.js       # renderização pura da tabela
    ├── select-parcela-pagar.js  # renderização pura do select de "lançar pagamento"
    └── recibo-html.js           # template puro do recibo (string, não abre janela)
```

## Comunicação com outros submódulos/domínios
Recebimentos não importa nada de Despesas ou Relatórios. Expõe, via
`registrarSubmodulo('recebimentos', api)` em `index.js`:
- `listarTodas()` — todas as parcelas
- `calcularResumo(isVencido)` — totais agregados
- `gerarParcelasParaProcesso(dados)` — usado por Processos ao criar/editar
  um processo com condições financeiras (decisão registrada: o preview
  fica em Processos, mas a geração de fato passa por aqui)

## Duas formas de marcar uma parcela como paga (preservadas, ambas existiam)
1. **Botão "✅ Pagar" na tabela** (`marcarPago`) — usa a data de hoje automaticamente
2. **Aba "Lançar Pagamento"** (`confirmarPagamento`) — select de parcela pendente + data escolhida + observação

## O que não mudou
Interface, layout, cálculo de desconto/acréscimo/juros, geração de
recibo (visual idêntico), mensagens de WhatsApp (mesmos templates) e
integração com Supabase são idênticos ao comportamento anterior — com a
única exceção documentada acima (bug de `gerarParcelasManual`, corrigido
por decisão explícita).
