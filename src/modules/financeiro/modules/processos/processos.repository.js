// modules/processos/processos.repository.js
// Única camada que fala com o Supabase para o CRUD do processo em si.
// Extraído do index.html monolítico (linhas 4986-5132), sem alteração
// de comportamento — exceto a correção de camada abaixo.
//
// CORREÇÃO DE CAMADA: as 3 funções de escrita chamavam showToast()
// direto em caso de erro — corrigido pra RepositoryError, mesma
// correção já aplicada em várias migrações anteriores.

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { RepositoryError } from '../../../../core/errors/index.js';

export { RepositoryError };

function processoDoBanco(row) {
  return {
    id: row.id,
    numero: row.numero,
    clienteId: row.cliente_id || null,
    tipoId: row.tipo_id || null,
    adv: row.advogado_id || '',
    status: mapStatusProcessoDoBanco(row.status || 'em_andamento'),
    vara: '', // campo livre de texto no front, não modelado em coluna própria ainda
    descricao: row.observacoes || '',
    abertura: (row.criado_em || '').slice(0, 10),
    etapa: row.etapa || 0
  };
}

function processoParaBanco(p, escritorioId) {
  return {
    escritorio_id: escritorioId,
    numero: p.numero,
    cliente_id: p.clienteId || null,
    tipo_id: p.tipoId || null,
    status: mapStatusProcessoParaBanco(p.status),
    observacoes: p.descricao || null
  };
}

// O banco usa status: em_andamento/aguardando/encerrado/suspenso.
// O front usa: andamento/aguardando/encerrado/suspenso. Só "andamento" difere.
export function mapStatusProcessoParaBanco(status) {
  return status === 'andamento' ? 'em_andamento' : status;
}
export function mapStatusProcessoDoBanco(status) {
  return status === 'em_andamento' ? 'andamento' : status;
}

/** @returns {Promise<Array>} todos os processos do escritório, mais recentes primeiro. */
export async function carregarProcessos() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return [];
  const { data, error } = await sb
    .from('processos')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('criado_em', { ascending: false });
  if (error) { console.warn('Erro ao carregar processos:', error.message); return []; }
  return (data || []).map(processoDoBanco);
}

/** @returns {Promise<object>} o processo salvo, já no formato do front. */
export async function salvarProcesso(p, editId) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) throw new RepositoryError('Sem conexão com o banco.');

  const payload = processoParaBanco(p, escritorioId);

  if (editId) {
    const { data, error } = await sb.from('processos').update(payload).eq('id', editId).eq('escritorio_id', escritorioId).select().single();
    if (error) throw new RepositoryError('Erro ao atualizar processo: ' + error.message, error);
    return processoDoBanco(data);
  }
  const { data, error } = await sb.from('processos').insert(payload).select().single();
  if (error) throw new RepositoryError('Erro ao cadastrar processo: ' + error.message, error);
  return processoDoBanco(data);
}

/** @returns {Promise<boolean>} true se excluiu com sucesso. */
export async function excluirProcesso(id) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb.from('processos').delete().eq('id', id).eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao excluir processo:', error.message); return false; }
  return true;
}
