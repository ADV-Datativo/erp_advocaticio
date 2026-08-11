# ADR-002: Strangler Pattern para a migração

**Data:** 06/08/2026 | **Status:** Aceito

## Contexto
Migrar um monólito de 15.650 linhas para arquitetura modular sem
interromper o sistema (já vendido a clientes reais).

## Decisão
Cada submódulo migrado sobrescreve as funções globais do monólito
(`window.nomeFuncao = novaImplementacao`), mantendo o HTML existente
sem nenhuma alteração de `onclick="..."`. Código antigo equivalente
vira código morto (nunca executa), removido só na limpeza final.

## Consequências
- Zero interrupção do sistema durante toda a migração
- Ordem de carregamento de `<script>` importa (bridges do Core antes
  dos módulos de domínio)
- Código morto se acumula no monólito — decisão consciente de não
  remover durante a migração, só ao final
- Risco real já materializado: se a tag `<script>` de um módulo não
  carrega (404, caminho errado), o sistema silenciosamente volta a usar
  o código antigo, sem erro visível — problema recorrente nesta migração
