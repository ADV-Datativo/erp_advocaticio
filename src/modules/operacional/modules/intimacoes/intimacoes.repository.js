// modules/intimacoes/intimacoes.repository.js
// Única camada que fala com o Supabase para Intimações. Extraído do
// index.html monolítico (linhas 5412-5487), sem alteração de
// comportamento — exceto a correção de camada abaixo.
//
// CORREÇÃO DE CAMADA: as 3 funções de escrita chamavam showToast()
// direto em caso de erro (violação — repository não deve ter efeito de
// UI). Corrigido: agora lançam RepositoryError; quem decide como avisar
// o usuário é o controller.

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { getSessao } from '../../../../core/auth.js';
import { RepositoryError } from '../../../../core/errors/index.js';

export { RepositoryError };

function intimacaoDoBanco(row) {
  return {
    id: row.id,
    procId: row.processo_id,
    tipo: row.tipo,
    data: row.data_intimacao,
    prazoFinal: row.prazo_final || '',
    descricao: row.descricao || '',
    fatal: !!row.fatal,
    cumprido: !!row.cumprido,
    cumpridoEm: row.cumprido ? (row.atualizado_em || '').slice(0, 10) : null,
    eventoId: row.evento_id || null,
    criada: (row.criado_em || '').slice(0, 10)
  };
}

/**
 * @returns {Promise<Record<string, Array>>} intimações agrupadas por
 *   processo_id — mesmo formato que o front-end já espera
 *   (store.intimacoes[procId] = [...]).
 */
export async function carregarIntimacoes() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return {};
  const { data, error } = await sb
    .from('intimacoes')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('data_intimacao');
  if (error) { console.warn('Erro ao carregar intimações:', error.message); return {}; }
  const agrupado = {};
  (data || []).forEach((row) => {
    const intim = intimacaoDoBanco(row);
    if (!agrupado[intim.procId]) agrupado[intim.procId] = [];
    agrupado[intim.procId].push(intim);
  });
  return agrupado;
}

/**
 * Usa a RPC `registrar_intimacao`, que cria a intimação e, se
 * solicitado, o evento de agenda vinculado, numa única chamada atômica.
 * @returns {Promise<{intimacao_id: string, evento_id: string|null}>}
 */
export async function registrarIntimacao({ procId, tipo, data, prazoFinal, descricao, fatal, criarEvento }) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) throw new RepositoryError('Sem conexão com o banco.');
  const autorNome = getSessao().nome || getSessao().email || null;
  const { data: rpcData, error } = await sb.rpc('registrar_intimacao', {
    p_processo_id: procId,
    p_tipo: tipo,
    p_data_intimacao: data,
    p_prazo_final: prazoFinal || null,
    p_descricao: descricao || null,
    p_fatal: !!fatal,
    p_criar_evento: criarEvento === 'sim',
    p_autor_nome: autorNome
  });
  if (error) throw new RepositoryError('Erro ao registrar intimação: ' + error.message, error);
  return Array.isArray(rpcData) ? rpcData[0] : rpcData;
}

/** @returns {Promise<object>} a intimação recém-criada, no formato do front-end (a RPC só retorna os IDs). */
export async function buscarIntimacaoPorId(id) {
  const sb = await getSB();
  const { data } = await sb.from('intimacoes').select('*').eq('id', id).single();
  return data ? intimacaoDoBanco(data) : null;
}

/** @returns {Promise<object|null>} a linha crua do evento criado (formato do banco, não convertido). */
export async function buscarEventoPorId(id) {
  const sb = await getSB();
  const { data } = await sb.from('eventos').select('*').eq('id', id).single();
  return data || null;
}

/** @returns {Promise<object>} a intimação atualizada. */
export async function atualizarIntimacao(id, campos) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) throw new RepositoryError('Sem conexão com o banco.');
  const { data, error } = await sb.from('intimacoes').update(campos).eq('id', id).eq('escritorio_id', escritorioId).select().single();
  if (error) throw new RepositoryError('Erro ao atualizar intimação: ' + error.message, error);
  return intimacaoDoBanco(data);
}

/** @returns {Promise<boolean>} true se excluiu com sucesso. */
export async function excluirIntimacao(id) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb.from('intimacoes').delete().eq('id', id).eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao excluir intimação:', error.message); return false; }
  return true;
}
