// modules/auditoria/index.js

import { criarControllerAuditoria } from './auditoria.controller.js';
import { registrarSubmodulo } from '../../sistema.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar = typeof window.store !== 'undefined' && typeof window.showToast === 'function';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  const controller = criarControllerAuditoria({
    showToast: window.showToast,
    today: window.today
  });

  window.renderAuditoria = controller.onRenderAuditoria;
  window.exportarAuditoria = controller.onExportarAuditoria;
  window.atualizarBadgeAuditoria = controller.onAtualizarBadgeAuditoria;

  registrarSubmodulo('auditoria', {});

  console.info('[auditoria] submódulo carregado — via src/modules/sistema/modules/auditoria/');
}

montarQuandoPronto();
