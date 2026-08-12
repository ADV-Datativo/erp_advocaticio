// modules/configuracoes-gerais/index.js
//
// Escopo: só Identidade Visual (cores + logo + nome). getNomeEscritorio,
// setNomeEscritorio e saveData continuam no monólito, injetados como
// dependência — usados por outros domínios já migrados.

import { criarControllerConfiguracoesGerais } from './configuracoes-gerais.controller.js';
import { registrarSubmodulo } from '../../sistema.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar =
    typeof window.store !== 'undefined' &&
    typeof window.showToast === 'function' &&
    typeof window.getNomeEscritorio === 'function' &&
    typeof window.setNomeEscritorio === 'function' &&
    typeof window.saveData === 'function';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  const controller = criarControllerConfiguracoesGerais({
    store: window.store,
    showToast: window.showToast,
    getNomeEscritorio: window.getNomeEscritorio,
    setNomeEscritorio: window.setNomeEscritorio,
    saveData: window.saveData
  });

  window.aplicarAparencia = controller.onAplicarAparencia;
  window.carregarFormAparencia = controller.onCarregarFormAparencia;
  window.sincronizarCorHex = controller.onSincronizarCorHex;
  window.previewAparencia = controller.onPreviewAparencia;
  window.atualizarPreviewLogo = controller.onAtualizarPreviewLogo;
  window.handleUploadLogo = controller.onHandleUploadLogo;
  window.removerLogoCustomizada = controller.onRemoverLogoCustomizada;
  window.salvarAparencia = controller.onSalvarAparencia;
  window.restaurarAparenciaPadrao = controller.onRestaurarAparenciaPadrao;

  registrarSubmodulo('configuracoes-gerais', {});

  console.info('[configuracoes-gerais] submódulo carregado — via src/modules/sistema/modules/configuracoes-gerais/');
}

montarQuandoPronto();
