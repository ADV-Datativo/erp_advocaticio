// modules/financeiro/_pendente_migracao_recebimentos.repository.js
//
// ATENÇÃO: este arquivo é TRANSITÓRIO. Contém só as funções de parcelas
// (Recebimentos) que sobraram do módulo piloto original, depois que
// Despesas foi extraído para modules/despesas/. Ninguém importa este
// arquivo ainda — não está referenciado em nenhuma tag <script> nem em
// nenhum outro módulo. Existe só para não perder o código já extraído,
// até a etapa de migração de Recebimentos (próxima), quando seu conteúdo
// vira modules/recebimentos/recebimentos.repository.js de verdade.
//
// Extraído do index.html monolítico (linhas 5090-5169), sem alteração de
// comportamento.

import { getSB } from '../../core/supabase-client.js';
import { getEscritorioId } from '../../core/auth.js';

export class RepositoryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RepositoryError';
    this.cause = cause;
  }
}

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

export async function criarParcelasNoBanco(parcelas) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId || !parcelas.length) return [];
  const payload = parcelas.map((p) => parcelaParaBanco(p, escritorioId));
  const { data, error } = await sb.from('parcelas').insert(payload).select();
  if (error) throw new RepositoryError('Erro ao gerar parcelas', error);
  return (data || []).map(parcelaDoBanco);
}

export async function atualizarParcelaNoBanco(id, campos) {
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
