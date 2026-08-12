// modules/integracoes/index.js
//
// Achado: window.getConfigWpp() já era usada como dependência injetada
// por Recebimentos (já migrado) — precisa continuar existindo com esse
// nome exato, apontando pra versão nova.

import { criarControllerIntegracoes } from './integracoes.controller.js';
import * as service from './integracoes.service.js';
import { registrarSubmodulo } from '../../sistema.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar =
    typeof window.store !== 'undefined' &&
    typeof window.getNomeEscritorio === 'function' &&
    typeof window.WPP_MSG_PADRAO === 'string';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  const controller = criarControllerIntegracoes({
    getNomeEscritorio: window.getNomeEscritorio,
    wppMsgPadrao: window.WPP_MSG_PADRAO,
    wppMsgReciboPadrao: window.WPP_MSG_RECIBO_PADRAO
  });

  window.getConfigWpp = service.carregarConfig;
  window.salvarConfigWpp = controller.onSalvarConfigWpp;
  window.resetarMsgWpp = controller.onResetarMsgWpp;
  window.resetarMsgRecibo = controller.onResetarMsgRecibo;
  window.mostrarPreviewWpp = controller.onMostrarPreviewWpp;
  window.inserirVariavel = controller.onInserirVariavel;
  window.renderPreviewWpp = controller.onRenderPreviewWpp;
  window.carregarConfigWpp = controller.onCarregarConfigWpp;

  registrarSubmodulo('integracoes', {});

  console.info('[integracoes] submódulo carregado — via src/modules/sistema/modules/integracoes/');
}

montarQuandoPronto();
