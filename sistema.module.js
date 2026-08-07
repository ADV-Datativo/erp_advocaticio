// sistema.module.js
//
// Descritor do domínio Sistema — registra o MÓDULO (granularidade grossa)
// no core/registry.js, análogo ao que "Financeiro" e "Operacional"
// deveriam fazer (nenhum dos dois foi religado ainda — ver
// core/README.md, "próximos passos"). Sistema é o primeiro domínio a
// nascer já com essa religação, em vez de deixar como pendência futura.
//
// Diferença para sistema.controller.js: este arquivo (module.js) é sobre
// o domínio EXISTIR como entidade conhecida pela aplicação (metadado);
// o controller.js é sobre COORDENAR chamadas entre os submódulos dele.

import { registrar } from '../../core/registry/index.js';

export function registrarModuloSistema() {
  registrar({
    id: 'sistema',
    nome: 'Sistema',
    versao: '1.0.0',
    status: 'em-migracao',
    dependencias: [],
    featureFlag: null,
    permissoes: [],
    owner: 'Renan'
  });
}

registrarModuloSistema();
