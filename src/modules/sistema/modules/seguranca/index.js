// modules/seguranca/index.js
// Registra as funções migradas como globais, e se declara migrado no
// Registry do domínio Sistema.

import { criarControllerSeguranca } from './seguranca.controller.js';
import { registrarSubmodulo } from '../../sistema.registry.js';

function montarQuandoPronto() {
  const prontoParaMontar = typeof window.store !== 'undefined' && typeof window.showToast === 'function' && typeof window.getSessao === 'function';
  if (!prontoParaMontar) {
    setTimeout(montarQuandoPronto, 50);
    return;
  }

  const controller = criarControllerSeguranca({
    showToast: window.showToast,
    getSessao: window.getSessao
  });

  window.avaliarForcaSenha = controller.onAvaliarForcaSenha;
  window.alterarSenha = controller.onAlterarSenha;

  registrarSubmodulo('seguranca', {});

  console.info('[seguranca] submódulo carregado — via src/modules/sistema/modules/seguranca/');
}

montarQuandoPronto();
