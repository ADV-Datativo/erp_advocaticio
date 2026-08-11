// core/permissions/permissions-bridge.js
//
// Expõe pode()/exigirPermissao() em window, pro monólito (script
// clássico, não pode dar `import`) conseguir chamar — mesmo padrão já
// usado em theme-engine.js. Mantém core/permissions/index.js livre de
// efeito colateral (só lógica pura), a ponte fica isolada aqui.

import { pode, exigirPermissao } from './index.js';

window.DATATIVO_PERMISSIONS = Object.freeze({ pode, exigirPermissao });

console.info('[permissions-bridge] RBAC carregado — pode()/exigirPermissao() disponíveis via window.DATATIVO_PERMISSIONS');
