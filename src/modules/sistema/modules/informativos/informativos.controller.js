// modules/informativos/informativos.controller.js
// Única camada que lê o DOM e dispara efeito de UI.
//
// Preserva o acoplamento real com o "sino de notificações" (achado da
// auditoria de segurança — terceiro sistema de notificação, separado de
// Informativos e Mensagens, ainda não migrado) via dependência injetada
// — não foi absorvido nem removido, só preservado como estava.

import * as service from './informativos.service.js';
import * as state from './informativos.state.js';
import { renderizarListaInformativos } from './components/lista-informativos.js';

export function criarControllerInformativos(deps) {
  const { showToast, today, atualizarBadgeNotif, renderNotifList } = deps;

  function atualizarBadge() {
    const naoLidos = service.contarNaoLidos(state.listarInformativos());
    const badge = document.getElementById('informativos-badge');
    if (badge) { badge.textContent = naoLidos; badge.style.display = naoLidos ? '' : 'none'; }
  }

  async function onRenderInformativos() {
    const lista = document.getElementById('informativos-lista');
    if (!lista) return;
    lista.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px">Carregando...</div>';

    await service.carregarEArmazenarInformativos(today);
    atualizarBadge();
    // Preserva o acoplamento original com o sino de notificações geral —
    // não é responsabilidade deste submódulo, só repassa como antes.
    atualizarBadgeNotif();
    renderNotifList();

    lista.innerHTML = renderizarListaInformativos(state.listarInformativos());
  }

  async function onMarcarComoLidoUI(id) {
    const info = await service.marcarComoLido(id);
    if (!info) return;
    onRenderInformativos();
    atualizarBadgeNotif();
    renderNotifList();
  }

  async function onAbrirAnexoInformativo(path) {
    const url = await service.obterUrlAnexo(path);
    if (!url) { showToast('Erro ao abrir anexo.', 'error'); return; }
    window.open(url, '_blank');
  }

  return {
    onRenderInformativos,
    onMarcarComoLidoUI,
    onAbrirAnexoInformativo,
    atualizarBadge // exposto pra index.js poder chamar isoladamente se precisar
  };
}
