// modules/informativos/index.js
// Registra as funções migradas como globais `window.*`, e se declara
// migrado no Registry do domínio Sistema.
//
// Achado: além de renderInformativos/marcarComoLidoUI/abrirAnexoInformativo,
// o fluxo de LOGIN chama carregarInformativos() e atualizarBadgeInformativos()
// diretamente (linhas 15393-15394 do monólito, pra já mostrar o badge de
// não-lidos assim que a sessão inicia, sem esperar o usuário abrir a
// página). Os dois precisam ser expostos também, não só os 3 usados
// dentro da própria tela de Informativos.

import { criarControllerInformativos } from './informativos.controller.js';
import * as state from './informativos.state.js';
import * as service from './informativos.service.js';
import { registrarSubmodulo } from '../../sistema.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar = typeof window.store !== 'undefined' && typeof window.showToast === 'function';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  state.conectarStore(window.store);

  const controller = criarControllerInformativos({
    showToast: window.showToast,
    today: window.today,
    atualizarBadgeNotif: window.atualizarBadgeNotif,
    renderNotifList: window.renderNotifList
  });

  // Usados dentro da própria tela de Informativos
  window.renderInformativos = controller.onRenderInformativos;
  window.marcarComoLidoUI = controller.onMarcarComoLidoUI;
  window.abrirAnexoInformativo = controller.onAbrirAnexoInformativo;

  // Usados também no fluxo de login (fora da tela de Informativos)
  window.carregarInformativos = () => service.carregarEArmazenarInformativos(window.today);
  window.atualizarBadgeInformativos = controller.atualizarBadge;

  registrarSubmodulo('informativos', {});

  console.info('[informativos] submódulo carregado — via src/modules/sistema/modules/informativos/');
}

montarQuandoPronto();
