# Relatórios — submódulo do domínio Financeiro

## Status
**Parcialmente migrado** (06/08/2026). Cobre as 2 abas que são
genuinamente dado de Financeiro: **Fluxo de Caixa** (`gerarRelatorio`,
`renderRelEntradas`, `renderRelSaidas`, `exportarCSV`) e
**Inadimplência** (`renderInadimplencia`, `exportarInadimplencia`).

## Decisão de escopo: Conversão ficou de fora
A página "Relatórios" no monólito tem uma 3ª aba, **Conversão**
(`renderConversao`), que lê `getOrcamentos()` — dado do domínio
Orçamentos, não Financeiro. Colocar ela aqui dentro violaria a mesma
regra de isolamento que motivou separar Despesas de Recebimentos
("nenhum submódulo acessa outro diretamente"), só que na direção
domínio↔domínio. Decisão do Renan: deixar Conversão no monólito por
ora — migra quando Orçamentos for migrado, possivelmente como parte
daquele domínio ou como um relatório cross-domain de nível de aplicação
(fora de qualquer domínio único).

## Por que Relatórios não tem repository nem state "de verdade"
Relatórios não tem tabela própria no Supabase — é 100% derivado de dado
de Recebimentos e Despesas. `relatorios.repository.js` está vazio de
propósito. `relatorios.state.js` só guarda referência de leitura a
`clientes`/`processos` (exibição); os dados de negócio (parcelas,
despesas) vêm exclusivamente de `financeiro.registry.js` — nunca de
`store.parcelas`/`store.despesas` diretamente. **Essa era exatamente a
violação de acoplamento identificada na auditoria original** (a versão
antiga de `gerarRelatorio` lia `store.parcelas` e `getDespesas()` cru) —
esta migração corrige isso de verdade, é o primeiro uso real do Registry
do domínio.

## Ordem de carregamento importa
`index.js` só monta depois que **Despesas e Recebimentos já estão
migrados** (`estaMigrado('despesas') && estaMigrado('recebimentos')`,
checado via polling). Isso não é uma race condition tolerada — é
proposital: Relatórios genuinamente depende dos outros dois existirem no
Registry antes de conseguir calcular qualquer coisa.

## Estrutura
```
relatorios/
├── index.js                    # registra globais + espera despesas/recebimentos migrarem primeiro
├── relatorios.controller.js    # única camada que lê o DOM
├── relatorios.service.js       # busca dado via financeiro.registry.js, nunca via store direto
├── relatorios.repository.js    # vazio de propósito — sem tabela própria
├── relatorios.state.js         # só clientes/processos (exibição); nunca parcelas/despesas
├── relatorios.validation.js    # vazio de propósito — sem campo obrigatório
├── relatorios.constants.js     # duplica pequenos mapas de label/ícone (ver nota no arquivo)
└── components/
    ├── cards-fluxo-caixa.js
    ├── grafico-fluxo.js
    ├── tabelas-fluxo-caixa.js
    └── tabela-inadimplencia.js
```

## Duplicação intencional aceita
`STATUS_PARCELA_LABEL`, `STATUS_PARCELA_CLASSE`, `DESP_CATEGORIAS`,
`DESP_STATUS` já existem em `recebimentos.constants.js` e
`despesas.constants.js`. Relatórios não pode importar esses arquivos
diretamente (regra de isolamento), então duplica os mapas pequenos —
mesmo trade-off já aceito para `RepositoryError` entre Despesas e
Recebimentos antes do Datativo Core existir.

## O que não mudou
Cálculos, filtros, gráfico de 6 meses, exportação CSV (mesmo formato de
colunas) idênticos ao comportamento anterior. `renderRelEntradas` e
`renderRelSaidas` continuam sendo só aliases que chamam
`gerarRelatorio()` de novo — não foi feita nenhuma otimização de
recalcular só a parte necessária, para não arriscar mudança de
comportamento sutil.
