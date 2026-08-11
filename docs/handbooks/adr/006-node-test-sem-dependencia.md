# ADR-006: node:test em vez de Vitest/Jest

**Data:** 10/08/2026 | **Status:** Aceito

## Contexto
Sprint 6 (Testes) precisava de um test runner. Vitest/Jest são opções
comuns, mas exigem `npm install` como dependência de desenvolvimento.

## Decisão
Usar `node:test` (nativo do Node 22+, zero dependência de pacote
externo) — mesma filosofia "sem build step" já aplicada em ADR-001.

## Consequências
- `node --test` roda a suíte inteira, descoberta automática de
  `*.test.js` em qualquer lugar do `src/`
- Convenção: teste ao lado do arquivo testado, não em pasta `tests/`
- Sem watch mode nativo tão maduro quanto Vitest, sem UI de teste — 
  aceitável dado o tamanho atual da suíte (20 testes)
- CI/CD (Sprint 7) roda esse mesmo comando via GitHub Actions, sem
  precisar de `npm install` no pipeline
