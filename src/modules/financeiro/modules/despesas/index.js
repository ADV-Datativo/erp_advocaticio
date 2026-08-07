// modules/despesas/index.js
// Registra as funções migradas como globais `window.*` com o MESMO NOME
// que o index.html já usa em `onclick="..."`, e se declara migrado no
// Registry do domínio Financeiro.
//
// Uso no index.html:
//   <script type="module" src="/src/modules/financeiro/modules/despesas/index.js"></script>

import { criarControllerDespesas } from './despesas.controller.js';
import * as state from './despesas.state.js';
import * as service from './despesas.service.js';
import { registrarSubmodulo } from '../../financeiro.registry.js';

function montarQuandoPronto() {
  if (typeof window.store === 'undefined' || typeof window.showToast !== 'function') {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  state.conectarStore(window.store);

  const controller = criarControllerDespesas({
    showToast: window.showToast,
    registrarAuditoria: window.registrarAuditoria,
    fmtMoney: window.fmtMoney,
    fmtDate: window.fmtDate,
    closeModal: window.closeModal,
    openModal: window.openModal,
    today: window.today
  });

  // Substitui as globais antigas pelas novas (mesmo nome, nova implementação)
  window.getDespesas = state.listarDespesas;
  window.atualizarStatusDespesas = () => service.atualizarStatusVencidas(state.listarDespesas(), window.today);
  window.renderDespesas = controller.onRenderDespesas;
  window.renderDespesasCards = controller.onRenderDespesas; // cards fazem parte do mesmo render agora
  window.toggleRecorrencia = controller.onToggleRecorrencia;
  window.salvarDespesa = controller.onSalvarDespesa;
  window.editarDespesa = controller.onEditarDespesa;
  window.excluirDespesa = controller.onExcluirDespesa;
  window.abrirPagarDespesa = controller.onAbrirPagarDespesa;
  window.confirmarPagamentoDespesa = controller.onConfirmarPagamentoDespesa;

  // API pública exposta a outros submódulos do domínio (Relatórios vai
  // usar isto quando migrar, em vez de ler store.despesas direto).
  registrarSubmodulo('despesas', {
    listarTodas: state.listarDespesas,
    calcularResumo: (today) => service.calcularResumoCards(state.listarDespesas(), today)
  });

  console.info('[despesas] submódulo carregado — via src/modules/financeiro/modules/despesas/');
}

montarQuandoPronto();
