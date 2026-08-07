// modules/diario-oficial/index.js
// Ponto de entrada do módulo. Registra as funções migradas como globais
// `window.*` com o MESMO NOME que o index.html monolítico já usa em
// `onclick="..."`, para que nada precise mudar no HTML (strangler pattern).
//
// Uso no index.html, dentro do <body>, depois de `initWithSupabase()`:
//   <script type="module" src="/src/modules/operacional/modules/diario-oficial/index.js"></script>

import { criarControllerDiarioOficial } from './diario-oficial.controller.js';
import * as state from './diario-oficial.state.js';
import { registrarEventosGlobais } from './diario-oficial.events.js';
import { marcarComoMigrado } from '../../operacional.registry.js';

function montarQuandoPronto() {
  if (typeof window.store === 'undefined' || typeof window.showToast !== 'function') {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  state.conectarStore(window.store);

  const controller = criarControllerDiarioOficial({
    showToast: window.showToast,
    openModal: window.openModal,
    closeModal: window.closeModal,
    today: window.today
  });

  // Substitui as globais antigas pelas novas (mesmo nome, nova implementação)
  window.renderDiarioOficial = controller.onRenderDiarioOficial;
  window.renderListaPublicacoes = controller.onFiltrarListaPublicacoes;
  window.filtrarSugestoesClienteDO = controller.onFiltrarSugestoesCliente;
  window.selecionarClienteDO = controller.onSelecionarCliente;
  window.abrirModalNovaPublicacao = controller.onAbrirModalNovaPublicacao;
  window.abrirModalEditarPublicacao = controller.onAbrirModalEditarPublicacao;
  window.salvarPublicacao = controller.onSalvarPublicacao;
  window.excluirPublicacaoAtual = controller.onExcluirPublicacaoAtual;

  registrarEventosGlobais({
    onCliqueForaDoAutocomplete: (caixa) => { caixa.style.display = 'none'; }
  });

  marcarComoMigrado('diario-oficial');
  console.info('[diario-oficial] módulo carregado — funções da tela de Diário Oficial agora rodam via src/modules/operacional/modules/diario-oficial/');
}

montarQuandoPronto();
