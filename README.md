# ADV Easy

SaaS multi-tenant de gestão para escritórios de advocacia (ERP jurídico)
— do lead à quitação do processo, com portal próprio para o cliente
final. Desenvolvido pela **Datativo Labs**.

## Stack
- **Arquitetura**: SPA single-file por superfície (HTML + CSS + JS puro),
  migrando incrementalmente para ES Modules nativos — sem bundler, sem
  build step
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Hospedagem**: GitHub Pages

## Estrutura do repositório
```
index.html                    — ERP principal (superfície monolítica em migração)
admin-onboarding.html         — painel super admin
adveasy-landing.html          — landing page
src/
├── core/                     — Datativo Core (infraestrutura compartilhada:
│                                errors, logger, events, registry, permissions)
└── modules/                  — domínios migrados para Clean Architecture
    ├── financeiro/            (Despesas, Recebimentos, Relatórios)
    ├── operacional/           (Diário Oficial)
    └── sistema/               (Mensagens)
docs/
└── design/                   — Datativo Design Language (fundamentos visuais)
```

## Migração em andamento
O sistema está em transição de um `index.html` monolítico para uma
arquitetura modular por domínio (Controller/Service/Repository), usando
o padrão strangler: módulos migrados registram funções sob os mesmos
nomes globais que o HTML já usa, sem exigir mudança no HTML.

Consulte `src/core/README.md` e o README de cada domínio em
`src/modules/*/README.md` para detalhes de cada etapa da migração.

## Design
Fundamentos de identidade visual e princípios de interface em
`docs/design/` — leia antes de qualquer decisão de UI.
