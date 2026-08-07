# Despesas — submódulo do domínio Financeiro

## Status
**Migrado completamente** (06/08/2026). Cobre tudo que antes vivia
solto no monólito sob "Despesas": `getDespesas`, `atualizarStatusDespesas`,
`renderDespesasCards`, `renderDespesas`, `toggleRecorrencia`, `salvarDespesa`,
`editarDespesa`, `excluirDespesa`, `abrirPagarDespesa`,
`confirmarPagamentoDespesa`.

Este submódulo é uma **reorganização** do módulo piloto `src/modules/financeiro/`
criado numa etapa anterior — lá, Despesas e Recebimentos estavam juntos no
mesmo repository/service/controller, o que violava a regra de isolamento
entre submódulos definida para o domínio. Aqui eles foram separados.

## Estrutura
```
despesas/
├── index.js                  # registra globais + declara "migrado" no financeiro.registry.js
├── despesas.controller.js    # única camada que lê o DOM
├── despesas.service.js       # regra de negócio pura
├── despesas.repository.js    # única camada que fala com o Supabase
├── despesas.state.js         # fachada sobre store.despesas
├── despesas.validation.js    # validação de formulário
├── despesas.events.js        # emite eventos de domínio (ex: despesa:paga)
├── despesas.constants.js     # DESP_CATEGORIAS, DESP_STATUS
└── components/
    ├── tabela-despesas.js    # renderização pura da tabela
    └── cards-resumo.js       # renderização pura dos cards
```

## Comunicação com outros submódulos
Despesas **não importa nada** de Recebimentos nem de Relatórios. A única
via de comunicação de saída é:
1. `registrarSubmodulo('despesas', api)` em `index.js` — expõe
   `listarTodas()` e `calcularResumo(today)` para quem perguntar ao
   `financeiro.registry.js`
2. `notificarDespesaPaga(despesa)` em `despesas.events.js` — emite o
   evento `despesa:paga` no barramento do domínio (`financeiro.events.js`).
   Hoje ninguém escuta esse evento ainda (Relatórios não migrou) — é
   infraestrutura pronta, sem efeito colateral no comportamento atual.

## O que não mudou
Interface, layout, regras de negócio (categorias, status, cálculo de
recorrência, validação) e integração com Supabase são idênticas ao
comportamento anterior. Erros de rede viram exceptions tipadas
(`RepositoryError`/`ValidationError`) em vez de `showToast` disparado
dentro do repository — mudança de organização interna, não de
comportamento visível.

## Pendência conhecida
`gerarReciboPagamento`, `montarMensagemRecibo`, `abrirModalWppRecibo`,
`montarMensagemWpp`, `abrirModalWpp` ainda estão no monólito — pertencem
a **Recebimentos** (geram recibo de parcela paga, não de despesa), não a
este submódulo. Migram na etapa de Recebimentos.
