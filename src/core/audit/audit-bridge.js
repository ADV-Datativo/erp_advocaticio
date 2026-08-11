// core/audit/audit-bridge.js
//
// Substitui window.registrarAuditoria pela versão do Core — mesmo nome,
// mesma assinatura, então:
//   1. O monólito (script clássico) continua chamando registrarAuditoria(...)
//      exatamente como sempre chamou, sem precisar mudar nenhuma das 31
//      chamadas espalhadas pelos 7 domínios.
//   2. Os módulos já migrados (Despesas, Recebimentos, Relatórios,
//      Mensagens, Diário Oficial) recebem `registrarAuditoria: window.registrarAuditoria`
//      como dependência injetada no próprio index.js de cada um — como
//      esta ponte carrega ANTES desses módulos (ver ordem das tags no
//      index.html), eles automaticamente passam a usar a versão do
//      Core, sem precisar editar nenhum desses arquivos.

import { registrarAuditoria } from './audit.js';

window.registrarAuditoria = registrarAuditoria;

console.info('[audit-bridge] registrarAuditoria agora roda via src/core/audit/audit.js');
