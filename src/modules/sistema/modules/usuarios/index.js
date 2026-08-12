// modules/usuarios/index.js
// Registra as funções migradas como globais, e se declara migrado no
// Registry do domínio Sistema.

import { criarControllerUsuarios } from './usuarios.controller.js';
import { registrarSubmodulo } from '../../sistema.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar =
    typeof window.store !== 'undefined' &&
    typeof window.showToast === 'function' &&
    typeof window.PERFIS !== 'undefined';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  const controller = criarControllerUsuarios({
    showToast: window.showToast,
    registrarAuditoria: window.registrarAuditoria,
    getSessao: window.getSessao,
    getPerfilAtual: window.getPerfilAtual,
    PERFIS: window.PERFIS,
    openModal: window.openModal,
    closeModal: window.closeModal
  });

  window.renderUsuarios = controller.onRenderUsuarios;
  window.renderConvitesPendentes = controller.onRenderConvitesPendentes;
  window.abrirModalConvite = controller.onAbrirModalConvite;
  window.enviarConvite = controller.onEnviarConvite;
  window.cancelarConvite = controller.onCancelarConvite;
  window.removerUsuarioEscritorio = controller.onRemoverUsuario;

  registrarSubmodulo('usuarios', {});

  console.info('[usuarios] submódulo carregado — via src/modules/sistema/modules/usuarios/');
}

montarQuandoPronto();
