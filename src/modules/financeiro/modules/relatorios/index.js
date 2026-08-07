// modules/relatorios/index.js
// Registra as funções migradas como globais `window.*`, e se declara
// migrado no Registry do domínio Financeiro.
//
// IMPORTANTE: precisa carregar DEPOIS de despesas/index.js e
// recebimentos/index.js na tag <script>, porque relatorios.service.js
// busca dado deles via financeiro.registry.js — se Relatórios tentar
// ler antes dos outros dois se registrarem, ele lança erro (ver
// obterParcelas()/obterDespesas() em relatorios.service.js).
//
// Uso no index.html:
//   <script type="module" src=".../despesas/index.js"></script>
//   <script type="module" src=".../recebimentos/index.js"></script>
//   <script type="module" src=".../relatorios/index.js"></script>   ← por último

import { criarControllerRelatorios } from './relatorios.controller.js';
import * as state from './relatorios.state.js';
import { registrarSubmodulo, estaMigrado } from '../../financeiro.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar =
    typeof window.store !== 'undefined' &&
    typeof window.showToast === 'function' &&
    estaMigrado('despesas') &&
    estaMigrado('recebimentos');
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  state.conectarStore(window.store);

  const controller = criarControllerRelatorios({
    showToast: window.showToast,
    fmtMoney: window.fmtMoney,
    fmtDate: window.fmtDate,
    today: window.today,
    isVencido: window.isVencido,
    diffDays: window.diffDays
  });

  // Substitui as globais antigas pelas novas (mesmo nome, nova implementação)
  window.gerarRelatorio = controller.onGerarRelatorio;
  window.renderRelEntradas = controller.onRenderRelEntradas;
  window.renderRelSaidas = controller.onRenderRelSaidas;
  window.exportarCSV = controller.onExportarCSV;
  window.renderInadimplencia = controller.onRenderInadimplencia;
  window.exportarInadimplencia = controller.onExportarInadimplencia;

  registrarSubmodulo('relatorios', {});

  console.info('[relatorios] submódulo carregado — via src/modules/financeiro/modules/relatorios/ (Fluxo de Caixa + Inadimplência; Conversão continua no monólito, fora do escopo)');
}

montarQuandoPronto();
