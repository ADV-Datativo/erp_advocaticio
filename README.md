# Financeiro — domínio (Datativo Labs pattern)

## Status por submódulo
| Submódulo | Status | Etapa |
|---|---|---|
| Despesas | ✅ migrado | concluída em 06/08/2026 |
| Recebimentos | ⬜ monólito | próxima etapa |
| Relatórios | ⬜ monólito | depende de Recebimentos + Despesas migrados |

## Regra de isolamento
Nenhum submódulo importa arquivos de dentro de outro submódulo. Toda
comunicação passa por `financeiro.registry.js` (registro de quem já
migrou + API pública de cada um) e `financeiro.controller.js` (ponto de
entrada externo do domínio). `financeiro.events.js` existe para
comunicação assíncrona por evento entre submódulos (ex: Despesas avisa
"despesa:paga", Relatórios escuta quando migrar).

## Decisão registrada: preview de parcelas em Processos
O preview de valor/parcelas que aparece na tela de cadastro de Processos
(`mostrarPreviewFinanceiroCliente`, `atualizarPreviewParcelasProcesso`)
**fica no domínio Processos**, não em Recebimentos — mesmo calculando
parcelas. Quando Processos for migrado, ele busca dado de Recebimentos
através do `financeiro.registry.js`, nunca importando `modules/recebimentos/`
diretamente. Decisão tomada em 06/08/2026.

## Histórico
Este domínio nasceu de um módulo piloto único (`src/modules/financeiro/`,
com `repository.js`/`service.js`/`controller.js` misturando Despesas e
Recebimentos) — o primeiro teste da migração incremental do ADV Easy para
Clean Architecture / ES Modules. A partir desta etapa, esse piloto foi
reorganizado nos 3 submódulos oficiais.
