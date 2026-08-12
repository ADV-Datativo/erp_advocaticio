# Auditoria — submódulo do domínio Sistema

## Status
**Migrado completamente** (11/08/2026). 3 de 5 submódulos de "Opções"
migrados. Cobre `renderAuditoria`, `exportarAuditoria`,
`atualizarBadgeAuditoria`.

## Só a TELA — a gravação já morava no Core desde a Sprint 9
`registrarAuditoria` (a função de *gravar* um evento) já foi movida pro
Core (`core/audit/audit.js`) na Sprint 9, exatamente porque é
cross-cutting (31 chamadas, 7 domínios) — não é responsabilidade de
Sistema. Este submódulo cobre só a *exibição*: carregar, filtrar,
renderizar tabela, exportar CSV, badge de contagem.

## Cache preservado exatamente como estava
O comportamento original (`_auditoriaCache`, carregado uma vez e
reaproveitado entre trocas de filtro) foi preservado — `auditoria.state.js`
é uma fachada sobre esse mesmo cache, não uma reformulação. Só
`onRenderAuditoria()` dispara o carregamento; os filtros seguintes
reaproveitam o que já está em memória.

## Pequeno erro cometido e corrigido antes de entregar
Durante a construção do `onExportarAuditoria`, cometi um deslize —
deixei um `import()` dinâmico desnecessário e uma linha morta no meio
da função. Corrigido antes de testar: `obterCache` importado
normalmente no topo do arquivo, como qualquer outra dependência real.
Registrado aqui por transparência, não porque afetou o resultado final.

## Estrutura
```
auditoria/
├── index.js
├── auditoria.controller.js    # única camada que lê o DOM
├── auditoria.service.js       # filtro + montagem de CSV, puro
├── auditoria.repository.js    # só LEITURA da tabela auditoria
├── auditoria.state.js         # fachada sobre o cache (_auditoriaCache original)
├── auditoria.validation.js    # vazio — sem formulário de entrada
├── auditoria.events.js        # vazio — sem addEventListener próprio
├── auditoria.constants.js     # AUDIT_MAX, AUDIT_ICONES, AUDIT_CORES, AUDIT_MODULOS
└── components/
    └── tabela-auditoria.js    # renderização pura
```

## O que não mudou
Filtro por tipo/ação/período, formato do CSV (mesmo cabeçalho, mesmo
separador `;`, mesmo BOM UTF-8), seletor frágil do badge
(`[onclick*="auditoria"]`) — preservado como estava, não é
responsabilidade desta migração redesenhar.
