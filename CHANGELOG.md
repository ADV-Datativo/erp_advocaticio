# Changelog — ADV Easy

Formato livre, cronológico. Cobre a Fase 2 (Datativo UI) e a migração
de arquitetura que a precedeu. Datas aproximadas à sessão de trabalho,
não a commits individuais.

## Fase 2 — Datativo UI

### Sprint 11 — Documentação (10/08/2026)
- `docs/handbooks/`: Architecture Handbook, Component Handbook, Coding
  Standards, 6 ADRs, este Changelog

### Sprint 10 — Observabilidade (10/08/2026)
- `feat`: Logger religado — 4 repositories trocaram `console.warn` por `logger.warn`
- `feat`: Error Tracking de frontend (`window.onerror`/`unhandledrejection`), persistido na tabela `auditoria` existente
- Métricas de uso básicas: fora do escopo desta etapa (decisão explícita)

### Sprint 9 — Auditoria (10/08/2026)
- `refactor`: `registrarAuditoria` movida do monólito pro Core (`src/core/audit/`) — era cross-cutting (7 domínios), nunca foi "de Sistema" de fato
- Religação automática via bridge — módulos já migrados passaram a usar a versão nova sem edição individual

### Sprint 8 — RBAC (10/08/2026)
- `feat`: `src/core/permissions/` — matriz granular `dominio.submodulo.acao`, derivada 1:1 dos flags antigos
- `fix`: instrumentação real de permissão em `removerUsuarioEscritorio` (monólito) e `onExcluirDespesa` (Despesas) — fecha achado crítico da auditoria (permissão nunca era aplicada)

### Sprint 7 — CI/CD (10/08/2026)
- `ci`: `.github/workflows/tests.yml` — roda `node --test` + checagem de sintaxe a cada push/PR

### Sprint 6 — Testes (10/08/2026)
- `test`: 20 testes (`node:test`), cobrindo Despesas, Recebimentos, Badge
- `fix`: `calcularResumoCards` usava `new Date()` (relógio real) em vez do `today` injetado — quebra de determinismo corrigida, travada por teste

### Sprint 5 — Layout Engine (10/08/2026)
- `feat`: `src/core/theme/layout/layout-engine.js` — breakpoint mobile (768px) centralizado no token
- `fix`: `theme-engine.js` nunca tinha tag `<script>` no HTML — corrigido junto

### Sprint 4 — Component Library, Onda 1 (10/08/2026)
- `feat`: 8 componentes (Badge, Table, Modal, Button, Toast, Loader, Tabs, Form, Select) em `src/core/ui/`
- `fix`: toast "info" e "sucesso" ficaram visualmente idênticos após a troca de cor de marca — corrigido com token `--info` dedicado

### Sprint 3 — Theme Engine (07/08/2026)
- `feat`: `src/core/theme/theme-engine.js` — conecta tokens ao mecanismo de Aparência já existente
- `fix`: 63 ocorrências de navy/dourado trocadas contextualmente pro verde Datativo
- `fix`: `--white`/`--card-bg`/`--modal-bg` do modo escuro quase viraram verde vibrante (erro corrigido antes de publicar)

### Sprint 2 — Design Tokens (07/08/2026)
- `feat`: `src/core/theme/tokens/` — 10 arquivos (colors, typography, spacing, radius, shadow, animation, breakpoints, zindex, opacity + index)

### Sprint 1 — Datativo Design Language (07/08/2026)
- `docs`: `docs/design/` — 10 documentos de fundamentos visuais + README

### Sprint 0 — Auditoria de Segurança Complementar (07/08/2026)
- **Crítico**: senha em texto puro gravada em `localStorage` (`cadastrarUsuario`) — corrigido, código morto (`getUsers`/`saveUsers`) removido por completo
- Achados registrados, não corrigidos nesta etapa: XSS sistêmico (187 `innerHTML`), RLS não auditado, Edge Function sem validação visível

## Migração de Arquitetura (pré-Fase 2)

### Domínio Sistema (06-07/08/2026)
- Mensagens (Portal) migrado
- Auditoria de Opções: identificadas 5 responsabilidades técnicas distintas (Segurança, Administração de Usuários, Auditoria, Integrações, Configurações Gerais) — nenhuma migrada ainda

### Domínio Operacional (06/08/2026)
- Diário Oficial (só Publicações) migrado — Intimações ficou de fora por acoplamento com Processos/Agenda/Dashboard

### Domínio Financeiro (06/08/2026)
- Despesas, Recebimentos, Relatórios (Fluxo de Caixa + Inadimplência) migrados
- Conversão identificada como pertencente a Orçamentos, não a Financeiro — fora do escopo

### Datativo Core (06/08/2026)
- `src/core/` criado: errors, logger, events, registry, permissions, config, utils, constants, services (scaffold inicial)

## Pré-migração
- Correção de bug de produção: faixa preta mobile (`#mobile-drawer` sem `display:none` fora do breakpoint)
- Reorganização da raiz do repositório (arquivos soltos → `src/`, `docs/`)
