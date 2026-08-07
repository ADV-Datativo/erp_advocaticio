// modules/diario-oficial/diario-oficial.repository.js
// Única camada com permissão de falar com o Supabase para publicações do
// Diário Oficial. Nunca decide regra de negócio (filtro, validação,
// formatação) — isso é do service.js deste módulo.
//
// Extraído do index.html monolítico em 06/08/2026 (linhas 7778-7830),
// sem alteração de comportamento — só isolamento de camada.

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { ORIGEM_MANUAL } from './diario-oficial.constants.js';

export class RepositoryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RepositoryError';
    this.cause = cause;
  }
}

function publicacaoDoBanco(row) {
  return {
    id: row.id,
    diario: row.diario || '',
    data: row.data_publicacao,
    numeroPublicado: row.numero_processo_publicado || '',
    conteudo: row.conteudo,
    responsavel: row.responsavel || '',
    status: row.status,
    origem: row.origem,
    clienteId: row.cliente_id || null,
    processoId: row.processo_id || null,
    clienteNome: row.clientes ? row.clientes.nome : null,
    processoNumero: row.processos ? row.processos.numero : null,
    criadoEm: row.criado_em
  };
}

function publicacaoParaBanco(dados) {
  return {
    diario: dados.diario || null,
    data_publicacao: dados.data,
    numero_processo_publicado: dados.numeroPublicado || null,
    conteudo: dados.conteudo,
    responsavel: dados.responsavel || null,
    status: dados.status,
    cliente_id: dados.clienteId || null,
    processo_id: dados.processoId || null
  };
}

const SELECT_COM_RELACOES = '*, clientes(nome), processos(numero)';

/** @returns {Promise<Array>} todas as publicações do escritório logado, mais recentes primeiro. */
export async function carregarPublicacoes() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return [];
  const { data, error } = await sb
    .from('publicacoes_diario')
    .select(SELECT_COM_RELACOES)
    .eq('escritorio_id', escritorioId)
    .order('data_publicacao', { ascending: false })
    .order('criado_em', { ascending: false });
  if (error) { console.warn('Erro ao carregar publicações:', error.message); return []; }
  return (data || []).map(publicacaoDoBanco);
}

/**
 * Cria ou atualiza uma publicação.
 * @param {object} dados campos já validados pelo service
 * @param {string|null} editId presente quando é edição
 * @returns {Promise<object>} a publicação salva, no formato do front-end.
 */
export async function salvarPublicacao(dados, editId) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) throw new RepositoryError('Sem conexão com o banco.');
  const payload = publicacaoParaBanco(dados);

  if (editId) {
    const { data, error } = await sb
      .from('publicacoes_diario')
      .update(payload)
      .eq('id', editId)
      .eq('escritorio_id', escritorioId)
      .select(SELECT_COM_RELACOES)
      .single();
    if (error) throw new RepositoryError('Erro ao atualizar publicação', error);
    return publicacaoDoBanco(data);
  }

  const { data, error } = await sb
    .from('publicacoes_diario')
    .insert({ ...payload, escritorio_id: escritorioId, origem: ORIGEM_MANUAL })
    .select(SELECT_COM_RELACOES)
    .single();
  if (error) throw new RepositoryError('Erro ao cadastrar publicação', error);
  return publicacaoDoBanco(data);
}

/** @returns {Promise<boolean>} true se excluiu com sucesso. */
export async function excluirPublicacao(id) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb
    .from('publicacoes_diario')
    .delete()
    .eq('id', id)
    .eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao excluir publicação:', error.message); return false; }
  return true;
}
