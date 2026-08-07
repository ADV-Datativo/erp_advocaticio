// modules/mensagens/mensagens.controller.js
// Única camada deste submódulo autorizada a ler o DOM e disparar efeitos
// de UI. Nunca contém regra de negócio, nunca fala com o Supabase.

import * as service from './mensagens.service.js';
import * as state from './mensagens.state.js';
import { RepositoryError } from './mensagens.repository.js';
import { renderizarListaConversas } from './components/lista-conversas.js';
import { renderizarMensagensDaConversa } from './components/mensagens-chat.js';

/**
 * @param {object} deps dependências que ainda vivem no monólito.
 */
export function criarControllerMensagens(deps) {
  const { showToast } = deps;

  function atualizarBadge(mensagens) {
    const naoLidas = service.contarNaoLidas(mensagens);
    const badge = document.getElementById('badge-msgs-portal');
    if (badge) { badge.textContent = naoLidas; badge.style.display = naoLidas ? '' : 'none'; }
  }

  async function onRenderMensagensPortal() {
    const { mensagens, porCliente } = await service.carregarConversasAgrupadas();
    atualizarBadge(mensagens);
    const clienteAtual = state.obterClienteAtual();
    const lista = document.getElementById('mp-lista-conversas');
    if (lista) lista.innerHTML = renderizarListaConversas(porCliente, clienteAtual?.clienteId ?? null);
  }

  function renderizarConversaAtual() {
    const chat = document.getElementById('mp-chat-messages');
    if (chat) {
      chat.innerHTML = renderizarMensagensDaConversa(state.obterMensagensDaConversa());
      chat.scrollTop = chat.scrollHeight;
    }
  }

  async function onAbrirConversaPortal(clienteId, clienteNome) {
    await service.abrirConversa(clienteId, clienteNome);

    document.getElementById('mp-chat-header').textContent = '💬 ' + clienteNome;
    document.getElementById('mp-chat-header').style.display = 'block';
    document.getElementById('mp-chat-empty').style.display = 'none';

    const chatMsgs = document.getElementById('mp-chat-messages');
    chatMsgs.style.display = 'flex';
    document.getElementById('mp-chat-input-area').style.display = 'block';

    renderizarConversaAtual();
    onRenderMensagensPortal(); // recarrega a lista para atualizar badges
  }

  async function onResponderMensagemPortal() {
    const input = document.getElementById('mp-chat-input');
    const conteudo = input.value.trim();
    try {
      const enviada = await service.enviarResposta(conteudo);
      if (!enviada) return; // conteúdo vazio ou nenhuma conversa aberta — silencioso, igual ao original
      input.value = '';
      renderizarConversaAtual();
      showToast('Mensagem enviada!', 'success');
    } catch (err) {
      if (err instanceof RepositoryError) { showToast(err.message + (err.cause ? ': ' + err.cause.message : ''), 'error'); return; }
      throw err;
    }
  }

  return {
    onRenderMensagensPortal,
    onAbrirConversaPortal,
    onResponderMensagemPortal
  };
}
