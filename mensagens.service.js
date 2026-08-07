// modules/mensagens/mensagens.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama o Supabase direto.

import * as repository from './mensagens.repository.js';
import * as state from './mensagens.state.js';
import { conteudoEhValido } from './mensagens.validation.js';
import { REMETENTE } from './mensagens.constants.js';

/** Carrega todas as mensagens e agrupa por cliente (extraído de renderMensagensPortal, linhas 6778-6783). */
export async function carregarConversasAgrupadas() {
  const msgs = await repository.carregarTodasAsMensagens();
  const porCliente = {};
  msgs.forEach((m) => {
    const cid = m.cliente_id;
    if (!porCliente[cid]) porCliente[cid] = { nome: m.clientes?.nome || 'Cliente', msgs: [] };
    porCliente[cid].msgs.push(m);
  });
  return { mensagens: msgs, porCliente };
}

/** @returns {number} quantidade de mensagens de cliente ainda não lidas. */
export function contarNaoLidas(mensagens) {
  return (mensagens || []).filter((m) => m.remetente === REMETENTE.CLIENTE && !m.lida).length;
}

/**
 * Abre uma conversa: carrega as mensagens do cliente, marca as não lidas
 * como lidas, e atualiza o estado do submódulo (extraído de
 * abrirConversaPortal, linhas 6808-6825).
 */
export async function abrirConversa(clienteId, clienteNome) {
  state.definirClienteAtual(clienteId, clienteNome);
  const mensagens = await repository.carregarMensagensDoCliente(clienteId);
  state.definirMensagensDaConversa(mensagens);

  const naoLidasIds = mensagens.filter((m) => m.remetente === REMETENTE.CLIENTE && !m.lida).map((m) => m.id);
  for (const id of naoLidasIds) {
    await repository.marcarComoLida(id);
  }
  return mensagens;
}

/**
 * Envia uma resposta na conversa aberta. Silencioso (retorna null) se o
 * conteúdo estiver vazio — mesmo comportamento original, sem exception.
 * @returns {Promise<object|null>} a mensagem enviada, ou null se não enviou.
 */
export async function enviarResposta(conteudo) {
  if (!conteudoEhValido(conteudo)) return null;
  const clienteAtual = state.obterClienteAtual();
  if (!clienteAtual) return null;
  const mensagem = await repository.enviarMensagem(clienteAtual.clienteId, conteudo);
  state.adicionarMensagemNaConversa(mensagem);
  return mensagem;
}
