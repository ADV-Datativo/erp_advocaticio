// modules/intimacoes/index.js
//
// Achado: 3 acoplamentos reais com domínios não migrados (Processos,
// Agenda, Dashboard) — todos preservados via dependência injetada, sem
// tentar migrá-los de carona.

import { criarControllerIntimacoes } from './intimacoes.controller.js';
import * as state from './intimacoes.state.js';
import { registrarSubmodulo } from '../../operacional.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar =
    typeof window.store !== 'undefined' &&
    typeof window.showToast === 'function' &&
    typeof window.verDetalhe === 'function' &&
    typeof window.eventoDoBanco === 'function';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  state.conectarStore(window.store);

  const controller = criarControllerIntimacoes({
    showToast: window.showToast,
    registrarAuditoria: window.registrarAuditoria,
    today: window.today,
    fmtDate: window.fmtDate,
    openModal: window.openModal,
    closeModal: window.closeModal,
    verDetalhe: window.verDetalhe,
    eventoDoBanco: window.eventoDoBanco,
    updateDashboard: window.updateDashboard
  });

  window.getIntimacoes = controller.onGetIntimacoes;
  window.renderIntimacoesHTML = controller.onRenderIntimacoesHTML;
  window.abrirNovaIntimacao = controller.onAbrirNovaIntimacao;
  window.intimacaoCalcPrazo = controller.onIntimacaoCalcPrazo;
  window.salvarIntimacao = controller.onSalvarIntimacao;
  window.getPrazosFatais = controller.onGetPrazosFatais;
  window.renderAlertaFatais = controller.onRenderAlertaFatais;
  window.editarIntimacao = controller.onEditarIntimacao;
  window.excluirIntimacao = controller.onExcluirIntimacao;
  window.marcarIntimacaoCumprida = controller.onMarcarIntimacaoCumprida;

  registrarSubmodulo('intimacoes', {});

  console.info('[intimacoes] submódulo carregado — via src/modules/operacional/modules/intimacoes/');
}

montarQuandoPronto();
