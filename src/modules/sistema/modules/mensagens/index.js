// modules/mensagens/index.js
// Registra as funções migradas como globais `window.*`, e se declara
// migrado no Registry do domínio Sistema.
//
// Uso no index.html:
//   <script type="module" src="/src/modules/sistema/modules/mensagens/index.js"></script>

import { criarControllerMensagens } from './mensagens.controller.js';
import { registrarSubmodulo } from '../../sistema.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar = typeof window.store !== 'undefined' && typeof window.showToast === 'function';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  const controller = criarControllerMensagens({
    showToast: window.showToast
  });

  // Substitui as globais antigas pelas novas (mesmo nome, nova implementação)
  window.renderMensagensPortal = controller.onRenderMensagensPortal;
  window.abrirConversaPortal = controller.onAbrirConversaPortal;
  window.responderMensagemPortal = controller.onResponderMensagemPortal;

  registrarSubmodulo('mensagens', {});

  console.info('[mensagens] submódulo carregado — via src/modules/sistema/modules/mensagens/');
}

montarQuandoPronto();
