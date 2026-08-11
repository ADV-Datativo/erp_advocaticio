# Architecture Handbook — ADV Easy / Datativo Labs

> Visão consolidada da arquitetura real do sistema, em 10/08/2026.
> Este documento resume o que já está detalhado nos READMEs de cada
> domínio — comece aqui, aprofunde nos READMEs específicos quando
> precisar de detalhe de implementação.

## Stack
- **Frontend**: SPA single-file (`index.html`, ~15.660 linhas), HTML+CSS+JS puro, migrando incrementalmente para ES Modules
- **Backend**: Supabase (Auth, PostgreSQL com RLS, Storage, Edge Functions)
- **Hospedagem**: GitHub Pages (site de projeto — `usuario.github.io/repo/`, não domínio raiz; caminhos de import **precisam ser relativos**, nunca absolutos com `/` — bug real já corrigido)
- **Sem bundler, sem build step** — decisão deliberada, registrada em [ADR-001](adr/001-es-modules-sem-bundler.md)

## Padrão de migração: Strangler Pattern
O sistema inteiro está migrando de um monólito único pra arquitetura modular **sem nunca parar de funcionar**. Mecanismo:
1. Um domínio/submódulo é extraído pra `src/modules/{dominio}/modules/{submodulo}/`
2. O `index.js` desse submódulo sobrescreve as funções globais (`window.nomeDaFuncao = ...`) com o mesmo nome que o HTML já chama via `onclick="..."`
3. O código antigo equivalente **permanece no monólito como código morto** (nunca executa, porque a global foi sobrescrita) — removido só na limpeza final do legado, não durante a migração

Ver [ADR-002](adr/002-strangler-pattern.md) para o raciocínio completo.

## Camadas (Clean Architecture)
Todo submódulo migrado segue:
```
UI (onclick no HTML) → Controller → Service → Repository → Supabase
```
- **Controller**: única camada que lê o DOM, dispara toast/modal/render. Nunca fala com Supabase, nunca contém regra de negócio
- **Service**: regra de negócio pura. Nunca toca DOM, nunca chama Supabase direto
- **Repository**: única camada que fala com Supabase. Nunca decide regra de negócio
- **State**: fachada de acesso a dado — pode ser fachada sobre o `store` global (Financeiro) ou dono de estado real próprio (Mensagens)

## Datativo Core (`src/core/`)
Infraestrutura compartilhada por todos os domínios:

| Pasta | O que tem |
|---|---|
| `errors/` | `AppError`, `RepositoryError`, `ValidationError`, `BusinessRuleError`, `AuthorizationError` |
| `logger/` | `logger.info/warn/error/audit()` — encapsula console, ponto único de log |
| `audit/` | `registrarAuditoria()` — movido do domínio Sistema (era cross-cutting, usado por 7 domínios) |
| `events/` | `eventBus` — comunicação cross-domain (emit/on/off/once) |
| `registry/` | Registro de módulos (granularidade grossa) |
| `permissions/` | RBAC granular (`dominio.submodulo.acao`) |
| `theme/` | Design Tokens + Theme Engine + Layout Engine |
| `ui/` | Component Library (Badge, Table, Modal, Button, Tabs, Form, Select, Loader) |
| `observability/` | Captura de erro de frontend |
| `supabase-client.js`, `auth.js` | Conexão e sessão |

Cada domínio (Financeiro, Operacional, Sistema) também tem seu **próprio** registry/events, escopados só aos submódulos daquele domínio — não confundir com o registry/events do Core, que é cross-domain. Ver `src/core/README.md` pra tabela completa de qual nível resolve o quê.

## Domínios e status de migração

| Domínio | Submódulos migrados | Pendentes |
|---|---|---|
| **Financeiro** | Despesas, Recebimentos, Relatórios (Fluxo de Caixa + Inadimplência) | Conversão (pertence a Orçamentos, não a Financeiro) |
| **Operacional** | Diário Oficial (só Publicações) | Intimações, Processos, Orçamentos, Agenda, Kanban, Leads, Modelos de Documentos |
| **Sistema** | Mensagens (Portal) | Informativos, Opções (vira 5 submódulos — ver auditoria) |

## Regra de isolamento entre submódulos
Nenhum submódulo importa arquivos de dentro de outro submódulo diretamente. Toda comunicação passa pelo Registry do domínio (`financeiro.registry.js`, `sistema.registry.js`, `operacional.registry.js`). Exemplo real: Relatórios busca dado de Recebimentos/Despesas via `apiDoSubmodulo()`, nunca lendo `store.parcelas` direto — essa era exatamente a violação identificada na primeira auditoria do domínio Financeiro.

## Achados de segurança conhecidos, endereçados parcialmente
- **XSS sistêmico**: 187 `innerHTML` sem escape no monólito. Corrigido só nos componentes novos (Sprint 4); resto pendente
- **RBAC instrumentado em só 2 ações** (prova de conceito): `removerUsuarioEscritorio` (monólito) e `onExcluirDespesa` (Despesas). As demais ~176 chamadas de ação ainda não checam permissão
- **RLS do Supabase**: nunca auditado sistematicamente via SQL — só verificável no painel, não pelo código cliente

## Onde ler mais
- `src/core/README.md` — Datativo Core em detalhe
- `src/modules/{dominio}/README.md` — cada domínio
- `src/modules/{dominio}/modules/{submodulo}/README.md` — cada submódulo, com achados específicos
- `docs/design/` — Datativo Design Language (fundamentos visuais)
