// modules/financeiro/index.js
// Ponto de entrada do módulo. Registra as funções migradas como globais
// `window.*` com o MESMO NOME que o index.html monolítico já usa em
// `onclick="..."`, para que nada precise mudar no HTML durante a migração
// (strangler pattern: o módulo novo substitui a implementação por trás do
// mesmo nome, sem quebrar quem chama).
//
// Uso no index.html, dentro do <body>, depois de `initWithSupabase()`:
//   <script type="module" src="/src/modules/financeiro/index.js"></script>

import { criarControllerDespesas } from './controller.js';
import { getStatusParcela, calcularResumoFinanceiro } from './service.js';

// Dependências que ainda vivem no monólito. Aguarda o DOM/script global
// terminar de carregar antes de montar o controller, porque `store`,
// `showToast` etc. só existem depois de `initWithSupabase()` rodar.
function montarQuandoPronto() {
  if (typeof window.store === 'undefined' || typeof window.showToast !== 'function') {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  const controller = criarControllerDespesas({
    store: window.store,
    showToast: window.showToast,
    registrarAuditoria: window.registrarAuditoria,
    fmtMoney: window.fmtMoney,
    closeModal: window.closeModal,
    openModal: window.openModal,
    renderDespesas: window.renderDespesas,
    today: window.today
  });

  // Substitui as globais antigas pelas novas (mesmo nome, nova implementação)
  window.salvarDespesa = controller.onSalvarDespesa;
  window.excluirDespesa = controller.onExcluirDespesa;
  window.abrirPagarDespesa = controller.onAbrirPagarDespesa;
  window.confirmarPagamentoDespesa = controller.onConfirmarPagamentoDespesa;

  // Exposto para o restante do monólito (ex: renderFinVisao, renderParcelas)
  // ir migrando aos poucos a usar a versão em módulo em vez da cópia local.
  window.financeiroService = { getStatusParcela, calcularResumoFinanceiro };

  console.info('[financeiro] módulo carregado — salvarDespesa/excluirDespesa/abrirPagarDespesa/confirmarPagamentoDespesa agora rodam via src/modules/financeiro/');
}

montarQuandoPronto();
