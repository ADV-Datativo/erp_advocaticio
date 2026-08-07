# 10 — Roadmap

> Como a Datativo Design Language se conecta ao resto da Fase 2. Este
> documento não define nada novo — registra dependências entre sprints
> já aprovadas, para que a ordem de execução fique rastreável num só
> lugar.

## Onde este documento se encaixa

```
Sprint 0 — Auditoria de Segurança Complementar         ✅ concluída
Sprint 1 — Datativo Design Language (docs 01-10)        ← este documento
Sprint 2 — Design Tokens
Sprint 3 — Theme Engine
Sprint 4 — Component Library (+ escape de HTML embutido)
Sprint 5 — Layout Engine
Sprint 6 — Testes
Sprint 7 — CI/CD
Sprint 8 — RBAC (+ checagem instrumentada por ação)
Sprint 9 — Auditoria (funcionalidade — mover registrarAuditoria pro Core)
Sprint 10 — Observabilidade
Sprint 11 — Documentação (incremental)
```

## Relação com o Theme Engine (Sprint 2-3)
Cada documento desta pasta alimenta diretamente uma parte dos tokens:

| Documento | Alimenta |
|---|---|
| `01-brand-principles.md` | Direção geral de paleta (ainda sem cor escolhida) |
| `02-design-principles.md` | Critério de decisão para qualquer token ambíguo |
| `03-visual-language.md` | `spacing.js`, `shadow.js` (elevação de superfície) |
| `04-motion.md` | `animation.js` |
| `05-accessibility.md` | Validação obrigatória de `colors.js` (razão de contraste) |
| `06-layout-philosophy.md` | `breakpoints.js` |

## Relação com a Component Library (Sprint 4)
Todo componente novo precisa ser rastreável a um princípio deste
conjunto de documentos — se um componente não se encaixa em nenhuma
regra aqui definida, é sinal de que falta atualizar a documentação antes
de construir o componente, não o contrário.

A Sprint 4 também carrega o escopo de segurança herdado da Sprint 0
(escape de HTML embutido em cada componente desde o início) — ver
achado crítico 2 da Auditoria de Segurança Complementar.

## Dependências futuras (fora do escopo desta sprint)
- Nenhuma cor final foi escolhida neste conjunto de documentos —
  pendente para a Sprint 2
- Nenhum componente foi desenhado — pendente para a Sprint 4
- Nenhuma animação foi implementada — pendente para a Sprint 3/4
- Estrutura de grid/breakpoint exata — pendente para a Sprint 5

## Processo de atualização
Estes documentos não são estáticos — se, durante a Sprint 2 em diante,
uma decisão técnica revelar que um princípio aqui definido não é viável
ou precisa de ajuste, o documento correspondente é atualizado antes de
prosseguir, não contornado silenciosamente no código.
