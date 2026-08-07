// modules/despesas/despesas.repository.js
// Única camada com permissão de falar com o Supabase para despesas. Nunca
// decide regra de negócio — isso é do service.js deste submódulo.
//
// Extraído do index.html monolítico (linhas 5172-5253), sem alteração de
// comportamento. Reorganizado a partir de src/modules/financeiro/repository.js
// (piloto anterior) em 06/08/2026, para isolar Despesas de Recebimentos.

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';

export class RepositoryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RepositoryError';
    this.cause = cause;
  }
}

function despesaDoBanco(row) {
  return {
    id: row.id,
    descricao: row.descricao,
    categoria: row.categoria,
    valor: Number(row.valor) || 0,
    vencimento: row.vencimento,
    conta: row.conta || '',
    dataPagamento: row.data_pagamento || '',
    forma: row.forma_pagamento || '',
    recorrencia: row.recorrencia || 'unica',
    grupoRecorrencia: row.grupo_recorrencia || null,
    status: row.status || 'pendente',
    obs: row.observacoes || ''
  };
}

function despesaParaBanco(d, escritorioId) {
  return {
    escritorio_id: escritorioId,
    descricao: d.descricao,
    categoria: d.categoria,
    valor: d.valor,
    vencimento: d.vencimento,
    conta: d.conta || null,
    data_pagamento: d.dataPagamento || null,
    forma_pagamento: d.forma || null,
    recorrencia: d.recorrencia || 'unica',
    grupo_recorrencia: d.grupoRecorrencia || null,
    status: d.status || 'pendente',
    observacoes: d.obs || null
  };
}

/** @returns {Promise<Array>} todas as despesas do escritório logado. */
export async function carregarDespesas() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return [];
  const { data, error } = await sb
    .from('despesas')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('vencimento');
  if (error) { console.warn('Erro ao carregar despesas:', error.message); return []; }
  return (data || []).map(despesaDoBanco);
}

/**
 * Cria uma ou várias despesas de uma vez (recorrência gera N linhas com o
 * mesmo grupoRecorrencia).
 * @returns {Promise<Array>} registros salvos no formato do front-end.
 */
export async function criarDespesas(despesas) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId || !despesas.length) throw new RepositoryError('Sem conexão com o banco.');
  const payload = despesas.map((d) => despesaParaBanco(d, escritorioId));
  const { data, error } = await sb.from('despesas').insert(payload).select();
  if (error) throw new RepositoryError('Erro ao cadastrar despesa', error);
  return (data || []).map(despesaDoBanco);
}

export async function atualizarDespesa(id, campos) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) throw new RepositoryError('Sem conexão com o banco.');
  const { data, error } = await sb
    .from('despesas')
    .update(campos)
    .eq('id', id)
    .eq('escritorio_id', escritorioId)
    .select()
    .single();
  if (error) throw new RepositoryError('Erro ao atualizar despesa', error);
  return despesaDoBanco(data);
}

export async function excluirDespesa(id) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb.from('despesas').delete().eq('id', id).eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao excluir despesa:', error.message); return false; }
  return true;
}
