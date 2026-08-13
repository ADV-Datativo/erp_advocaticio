# Processos — submódulo do domínio Operacional (Etapa 2.1a — CRUD + Formulário)

## Status
**Migrado** (11/08/2026). Cobre CRUD do processo, todo o ciclo do
formulário (lembrete, selects, preview financeiro) e listagem. **Não
cobre** Andamentos/Pipeline (2.1b), Tags (2.2), Partes/Contatos/Tarefas
(2.3), Documentos (2.4) — divisão feita porque "Núcleo" sozinho já tinha
28 funções reais, maior que qualquer submódulo migrado até agora.

## Achado crítico corrigido: escrita direta em store de outro domínio
`salvarProcesso()` original criava parcelas automaticamente (baseado nas
condições financeiras do cliente) e escrevia **direto em
`store.parcelas`** — pulando por cima do domínio Recebimentos, já
migrado. Corrigido: `Recebimentos` ganhou uma função pública nova,
**aditiva** (`salvarParcelasPreCalculadas`), exposta via Registry.
Processos agora sempre passa por ela — nunca toca `store.parcelas`
direto. Testado que a extensão não quebrou nada do Recebimentos (20/20
testes continuam passando).

## Preservação de comportamento fino: datas customizadas por parcela
A função de geração de parcela que já existia em Recebimentos
(`gerarParcelasParaProcesso`) gera datas uniformes mês a mês — **não**
respeita datas customizadas por parcela que um cliente pode ter
(`cliente.datasParcelas`). Por isso não foi reaproveitada aqui: usar
ela teria mudado o comportamento pra clientes com parcelas
customizadas. `montarParcelasParaGerar()` (neste submódulo) preserva a
lógica exata original — testado com os dois cenários (com e sem datas
customizadas).

## Achado técnico: `procTabFilter` também não virava `window` sozinha
Mesma pegadinha já vista com `PERFIS`/`WPP_MSG_PADRAO` — é `let` de
topo, mutada diretamente por `switchTab()` (que não foi tocado). Solução
usada: um getter (`function getProcTabFilter()`), que por ser function
declaration vira `window` automaticamente e sempre reflete o valor mais
recente via closure — sem precisar alterar `switchTab`.

## Achado: `carregarProcessos` também é usada no carregamento inicial
Além da própria tela, `sbLoad()` (que carrega ~26 domínios em paralelo
no login) chama `carregarProcessos()` direto — exposta também, mesmo
padrão já visto com Informativos.

## Correção de camada
`salvarProcesso`/`excluirProcesso` do repository chamavam `showToast()`
direto em erro — corrigido pra `RepositoryError`.

## Fora de escopo, ficam no monólito por enquanto
`atualizarAndamento`/`editarAndamento`/`excluirAndamento`/`salvarAndamento`
(Andamentos — 2.1b), `renderPipelineHTML`/`avancarEtapa` (Pipeline —
2.1b), tudo de Tags/Partes/Contatos/Tarefas/Documentos. Os `onclick` que
já apontam pra essas funções continuam funcionando normalmente via
monólito, sem quebra.

## Estrutura
```
processos/
├── index.js
├── processos.controller.js    # única camada que lê/escreve o DOM
├── processos.service.js       # orquestração + cálculo de parcela, testado
├── processos.repository.js    # CRUD do processo
├── processos.state.js         # fachada sobre store.processos + leitura de referência de outros domínios
├── processos.validation.js    # campos obrigatórios
├── processos.events.js        # vazio
├── processos.constants.js     # STATUS_LABELS
└── components/
    └── tabela-processos.js    # renderização pura
```
