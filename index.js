// modules/recebimentos/index.js
// Registra as funções migradas como globais `window.*` com o MESMO NOME
// que o index.html já usa em `onclick="..."`, e se declara migrado no
// Registry do domínio Financeiro.
//
// Uso no index.html:
//   <script type="module" src="/src/modules/financeiro/modules/recebimentos/index.js"></script>

import { criarControllerRecebimentos } from './recebimentos.controller.js';
import * as state from './recebimentos.state.js';
import * as service from './recebimentos.service.js';
import { registrarSubmodulo } from '../../financeiro.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar =
    typeof window.store !== 'undefined' &&
    typeof window.showToast === 'function' &&
    typeof window.getConfigWpp === 'function';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  state.conectarStore(window.store);

  const controller = criarControllerRecebimentos({
    showToast: window.showToast,
    registrarAuditoria: window.registrarAuditoria,
    fmtMoney: window.fmtMoney,
    fmtDate: window.fmtDate,
    today: window.today,
    isVencido: window.isVencido,
    diffDays: window.diffDays,
    closeModal: window.closeModal,
    openModal: window.openModal,
    getConfigWpp: window.getConfigWpp,
    wppMsgPadrao: window.WPP_MSG_PADRAO,
    wppMsgReciboPadrao: window.WPP_MSG_RECIBO_PADRAO,
    getDadosEscritorio: window.getDadosEscritorio,
    getNomeEscritorio: window.getNomeEscritorio,
    getLogoInlineHtml: window.getLogoInlineHtml,
    notifPagamentoConfirmado: window.notifPagamentoConfirmado,
    updateDashboard: window.updateDashboard
  });

  // Substitui as globais antigas pelas novas (mesmo nome, nova implementação)
  window.getParcelaStatus = (p) => service.getStatusParcela(p, window.isVencido);
  window.renderParcelas = controller.onRenderParcelas;
  window.renderFinVisao = controller.onRenderFinVisao;
  window.updateParcelasSelect = controller.onUpdateParcelasSelect;
  window.confirmarPagamento = controller.onConfirmarPagamento;
  window.marcarPago = controller.onMarcarPago;
  window.abrirReagendar = controller.onAbrirReagendar;
  window.confirmarReagendar = controller.onConfirmarReagendar;
  window.abrirDescontoAcrescimo = controller.onAbrirDescontoAcrescimo;
  window.calcularDA = controller.onCalcularDA;
  window.confirmarDA = controller.onConfirmarDA;
  window.gerarParcelasManual = controller.onGerarParcelasManual;
  window.gerarReciboPagamento = controller.onGerarReciboPagamento;
  window.montarMensagemRecibo = controller.onMontarMensagemRecibo;
  window.abrirModalWppRecibo = controller.onAbrirModalWppRecibo;
  window.montarMensagemWpp = controller.onMontarMensagemWpp;
  window.abrirModalWpp = controller.onAbrirModalWpp;

  // API pública exposta a outros submódulos/domínios (Relatórios e
  // Processos vão usar isto, via financeiro.registry.js, em vez de ler
  // store.parcelas diretamente).
  registrarSubmodulo('recebimentos', {
    listarTodas: state.listarParcelas,
    calcularResumo: (isVencido) => service.calcularResumoFinanceiro(state.listarParcelas(), isVencido),
    gerarParcelasParaProcesso: service.gerarParcelasParaProcesso
  });

  console.info('[recebimentos] submódulo carregado — via src/modules/financeiro/modules/recebimentos/');
}

montarQuandoPronto();
