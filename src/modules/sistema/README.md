# Sistema — domínio (Datativo Labs pattern)

## Status por submódulo
| Submódulo | Status | Etapa |
|---|---|---|
| Mensagens | ✅ migrado | concluída em 06/08/2026 |
| Informativos | ⬜ monólito | próximo — mesmo padrão de badge de não-lido que Mensagens |
| Opções | ⬜ monólito | maior e mais heterogênea — ver achados abaixo antes de migrar |

## Achados da auditoria que afetam decisões futuras

**`registrarAuditoria` não é do domínio Sistema.** É chamada 31 vezes
por 7 domínios diferentes (já injetada em Despesas, Recebimentos,
Relatórios). Arquiteturalmente deveria estar em `core/services/` (função
de *gravar* auditoria), não dentro de Sistema/Opções — só a *tela* que
exibe o log pertence a Sistema. Não corrigido ainda; decisão para quando
Opções for migrado.

**`getConfigWpp` não persiste no Supabase**, só `localStorage`. Config
de WhatsApp é por navegador, não por escritório. Achado, não corrigido —
decisão do Renan quando Opções migrar.

**A reorganização de menu "Comunicações/Configurações"** planejada numa
sessão anterior nunca foi implementada no código real — Sistema continua
com as 3 páginas originais (Informativos, Mensagens Portal, Opções) sob
a mesma categoria de sempre.

**"Chat interno" com grupos/DMs/@menções não existe** no código, apesar
de registrado como concluído na documentação do projeto — ver README de
Mensagens.

## Estrutura
```
sistema.module.js       — registra o DOMÍNIO no core/registry.js (metadado, existência)
sistema.controller.js   — orquestra chamadas entre submódulos via sistema.registry.js
sistema.registry.js     — status de migração + API pública de cada submódulo
sistema.navigation.js   — vazio de propósito (navegação de menu é genérica, não de domínio)
sistema.events.js       — barramento entre submódulos (Mensagens ↔ Informativos, futuro)
sistema.constants.js    — vazio, nada cross-submódulo identificado ainda
modules/
├── mensagens/     ✅ migrado
├── informativos/  ⬜
└── opcoes/        ⬜
```

## Diferença para o padrão de Financeiro
Sistema é o primeiro domínio que nasce já registrado no `core/registry.js`
(via `sistema.module.js`) desde o início, em vez de deixar essa religação
como pendência futura (que é o estado atual de Financeiro e Operacional).
