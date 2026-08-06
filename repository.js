// modules/financeiro/repository.js
// Única camada com permissão de falar com o Supabase para parcelas e
// despesas. Nunca decide regra de negócio (o que é "vencido", cálculo de
// status, etc.) — isso é responsabilidade do service.js deste módulo.
//
// Extraído do index.html monolítico em 06/08/2026 (linhas 5090-5253),
// sem alteração de comportamento — só isolamento de camada.

import { getSB } from '../../core/supabase-client.js';
import { getEscritorioId } from '../../core/auth.js';

// ==================== MAPEAMENTO BANCO <-> FRONT-END (PARCELAS) ====================

function parcelaDoBanco(row) {
  return {
    id: row.id,
    processoId: row.processo_id,
    clienteId: row.cliente_id,
    num: row.numero,
    total: row.total_parcelas,
    vencimento: row.vencimento,
    valor: Number(row.valor) || 0,
    // "atrasado" é calculado na tela (service), não persistido como status final
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
 * Insere várias parcelas de uma vez (geradas ao criar um processo com
 * condições financeiras).
 * @param {Array} parcelas
 * @returns {Promise<Array>} registros salvos, já no formato do front-end.
 */
export async function criarParcelasNoBanco(parcelas) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId || !parcelas.length) return [];
  const payload = parcelas.map((p) => parcelaParaBanco(p, escritorioId));
  const { data, error } = await sb.from('parcelas').insert(payload).select();
  if (error) { throw new RepositoryError('Erro ao gerar parcelas', error); }
  return (data || []).map(parcelaDoBanco);
}

/** @returns {Promise<object|null>} a parcela atualizada, ou null em erro. */
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
  if (error) { throw new RepositoryError('Erro ao atualizar parcela', error); }
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

// ==================== MAPEAMENTO BANCO <-> FRONT-END (DESPESAS) ====================

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
 * @param {Array} despesas
 * @returns {Promise<Array>} registros salvos no formato do front-end.
 */
export async function criarDespesasNoBanco(despesas) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId || !despesas.length) throw new RepositoryError('Sem conexão com o banco.');
  const payload = despesas.map((d) => despesaParaBanco(d, escritorioId));
  const { data, error } = await sb.from('despesas').insert(payload).select();
  if (error) { throw new RepositoryError('Erro ao cadastrar despesa', error); }
  return (data || []).map(despesaDoBanco);
}

export async function atualizarDespesaNoBanco(id, campos) {
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
  if (error) { throw new RepositoryError('Erro ao atualizar despesa', error); }
  return despesaDoBanco(data);
}

export async function excluirDespesaDoBanco(id) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb
    .from('despesas')
    .delete()
    .eq('id', id)
    .eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao excluir despesa:', error.message); return false; }
  return true;
}

// ==================== ERRO PADRONIZADO ====================
// Antes, erros de rede eram misturados com showToast() (efeito de UI) direto
// no meio da chamada ao banco. O repository agora só lança o erro; quem
// decide COMO mostrar isso ao usuário é o controller/service, não aqui.

export class RepositoryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RepositoryError';
    this.cause = cause;
  }
}
