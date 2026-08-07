// modules/mensagens/mensagens.repository.js
// Única camada com permissão de falar com o Supabase para mensagens do
// Portal do Cliente. Extraído do index.html monolítico (linhas 6756-6885),
// sem alteração de comportamento.

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { RepositoryError } from '../../../../core/errors/index.js';

export { RepositoryError };

/** @returns {Promise<Array>} todas as mensagens do escritório, mais recentes primeiro, com nome do cliente. */
export async function carregarTodasAsMensagens() {
  const sb = await getSB();
  const eid = getEscritorioId();
  if (!sb || !eid) return [];
  const { data, error } = await sb
    .from('portal_mensagens')
    .select('*, clientes(nome)')
    .eq('escritorio_id', eid)
    .order('criado_em', { ascending: false });
  if (error) { console.warn(error.message); return []; }
  return data || [];
}

/** @returns {Promise<Array>} mensagens de um cliente específico, mais antiga primeiro (ordem de leitura do chat). */
export async function carregarMensagensDoCliente(clienteId) {
  const sb = await getSB();
  const eid = getEscritorioId();
  if (!sb || !eid) return [];
  const { data, error } = await sb
    .from('portal_mensagens')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('escritorio_id', eid)
    .order('criado_em', { ascending: true });
  if (error) { console.warn(error.message); return []; }
  return data || [];
}

/** Marca uma mensagem como lida via RPC (transação atômica no banco). */
export async function marcarComoLida(mensagemId) {
  const sb = await getSB();
  if (!sb) return;
  await sb.rpc('marcar_mensagem_lida', { p_mensagem_id: mensagemId });
}

/**
 * Envia uma mensagem do escritório para um cliente.
 * @returns {Promise<object>} a mensagem criada.
 */
export async function enviarMensagem(clienteId, conteudo) {
  const sb = await getSB();
  const eid = getEscritorioId();
  if (!sb || !eid) throw new RepositoryError('Sem conexão com o banco.');
  const { data, error } = await sb
    .from('portal_mensagens')
    .insert({ escritorio_id: eid, cliente_id: clienteId, remetente: 'escritorio', conteudo })
    .select()
    .single();
  if (error) throw new RepositoryError('Erro ao enviar', error);
  return data;
}
