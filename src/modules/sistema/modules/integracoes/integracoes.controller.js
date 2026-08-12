// modules/integracoes/integracoes.controller.js
// Única camada que lê o DOM e dispara efeito de UI.

import * as service from './integracoes.service.js';

export function criarControllerIntegracoes(deps) {
  const { getNomeEscritorio, wppMsgPadrao, wppMsgReciboPadrao } = deps;

  function onSalvarConfigWpp() {
    const cfg = {
      numero: document.getElementById('wpp-numero')?.value || '',
      pix: document.getElementById('wpp-pix')?.value || '',
      pixTipo: document.getElementById('wpp-pix-tipo')?.value || 'cpf',
      pixTitular: document.getElementById('wpp-pix-titular')?.value || '',
      msg: document.getElementById('wpp-msg-cobranca')?.value || '',
      msgRecibo: document.getElementById('wpp-msg-recibo')?.value || ''
    };
    service.salvarConfig(cfg);
    onRenderPreviewWpp();
  }

  function onResetarMsgWpp() {
    const el = document.getElementById('wpp-msg-cobranca');
    if (el) { el.value = wppMsgPadrao; onSalvarConfigWpp(); }
  }

  function onResetarMsgRecibo() {
    const el = document.getElementById('wpp-msg-recibo');
    if (el) { el.value = wppMsgReciboPadrao; onSalvarConfigWpp(); }
  }

  function onMostrarPreviewWpp(tipo) {
    const el = document.getElementById('wpp-preview');
    if (!el) return;
    if (tipo === 'recibo') {
      const cfg = service.carregarConfig();
      el.textContent = service.montarPreviewRecibo(cfg, wppMsgReciboPadrao, getNomeEscritorio());
    } else {
      onRenderPreviewWpp();
    }
  }

  function onInserirVariavel(inputId, variavel) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const pos = el.selectionStart || el.value.length;
    el.value = el.value.substring(0, pos) + variavel + el.value.substring(pos);
    el.focus();
    el.selectionStart = el.selectionEnd = pos + variavel.length;
    onSalvarConfigWpp();
  }

  function onRenderPreviewWpp() {
    const cfg = service.carregarConfig();
    const preview = service.montarPreviewCobranca(cfg, wppMsgPadrao, getNomeEscritorio());
    const el = document.getElementById('wpp-preview');
    if (el) el.textContent = preview;
  }

  function onCarregarConfigWpp() {
    const cfg = service.carregarConfig();
    const set = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
    set('wpp-numero', cfg.numero);
    set('wpp-pix', cfg.pix);
    set('wpp-pix-tipo', cfg.pixTipo);
    set('wpp-pix-titular', cfg.pixTitular);
    const msgEl = document.getElementById('wpp-msg-cobranca');
    if (msgEl) msgEl.value = cfg.msg || wppMsgPadrao;
    const reciboEl = document.getElementById('wpp-msg-recibo');
    if (reciboEl) reciboEl.value = cfg.msgRecibo || wppMsgReciboPadrao;
    onRenderPreviewWpp();
  }

  return {
    onSalvarConfigWpp,
    onResetarMsgWpp,
    onResetarMsgRecibo,
    onMostrarPreviewWpp,
    onInserirVariavel,
    onRenderPreviewWpp,
    onCarregarConfigWpp
  };
}
