// modules/recebimentos/recebimentos.repository.js
// Única camada com permissão de falar com o Supabase para parcelas.
//
// Movido de src/modules/financeiro/_pendente_migracao_recebimentos.repository.js
// nesta etapa, sem alteração de comportamento. Extraído originalmente do
// index.html monolítico (linhas 5090-5169).

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { RepositoryError } from '../../../../core/errors/index.js';

// Re-exportado com o mesmo nome para que nenhum import em
// recebimentos.controller.js precise mudar.
export { RepositoryError };

function parcelaDoBanco(row) {
  return {
    id: row.id,
    processoId: row.processo_id,
    clienteId: row.cliente_id,
    num: row.numero,
    total: row.total_parcelas,
    vencimento: row.vencimento,
    valor: Number(row.valor) || 0,
    status: row.status === 'atrasado' ? 'pendente' : row.status,
    dtPagamento: row.data_pagamento || null,
    obs: row.observacoes || ''
  };
}

function parcelaParaBanco(p, escritorioId) {
  return {
    escritorio_id: escritorioId,
    processo_id: p.processoId,
    cliente_id: p.clienteId,
    numero: p.num,
    total_parcelas: p.total,
    vencimento: p.vencimento,
    valor: p.valor,
    status: p.status || 'pendente',
    data_pagamento: p.dtPagamento || null,
    observacoes: p.obs || null
  };
}

/** @returns {Promise<Array>} todas as parcelas do escritório logado. */
export async function carregarParcelas() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return [];
  const { data, error } = await sb
    .from('parcelas')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('vencimento');
  if (error) { console.warn('Erro ao carregar parcelas:', error.message); return []; }
  return (data || []).map(parcelaDoBanco);
}

/**
 * Insere várias parcelas de uma vez.
 * @returns {Promise<Array>} registros salvos, já no formato do front-end.
 */
export async function criarParcelas(parcelas) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId || !parcelas.length) throw new RepositoryError('Sem conexão com o banco.');
  const payload = parcelas.map((p) => parcelaParaBanco(p, escritorioId));
  const { data, error } = await sb.from('parcelas').insert(payload).select();
  if (error) throw new RepositoryError('Erro ao gerar parcelas', error);
  return (data || []).map(parcelaDoBanco);
}

/** @returns {Promise<object>} a parcela atualizada. */
export async function atualizarParcela(id, campos) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) throw new RepositoryError('Sem conexão com o banco.');
  const { data, error } = await sb
    .from('parcelas')
    .update(campos)
    .eq('id', id)
    .eq('escritorio_id', escritorioId)
    .select()
    .single();
  if (error) throw new RepositoryError('Erro ao atualizar parcela', error);
  return parcelaDoBanco(data);
}

/**
 * Remove todas as parcelas de um processo (usado antes de regenerar).
 * @returns {Promise<boolean>}
 */
export async function excluirParcelasDoProcesso(processoId) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb
    .from('parcelas')
    .delete()
    .eq('processo_id', processoId)
    .eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao excluir parcelas do processo:', error.message); return false; }
  return true;
}
