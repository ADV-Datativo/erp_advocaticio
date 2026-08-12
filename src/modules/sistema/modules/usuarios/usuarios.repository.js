// modules/usuarios/usuarios.repository.js
// Única camada que fala com o Supabase (tabelas + Edge Function) para
// gestão de usuários do escritório. Extraído do index.html monolítico
// (linhas 12006-12143), sem alteração de comportamento.

import { getSB, SB_URL } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { RepositoryError } from '../../../../core/errors/index.js';

export { RepositoryError };

/** @returns {Promise<Array>} usuários vinculados ao escritório atual. */
export async function carregarUsuariosEscritorio() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return [];
  const { data, error } = await sb
    .from('usuarios_escritorios')
    .select('id, usuario_id, papel, ativo, criado_em')
    .eq('escritorio_id', escritorioId)
    .order('criado_em');
  if (error) { console.warn('Erro ao carregar usuários:', error.message); return []; }
  return data || [];
}

/** @returns {Promise<Array>} convites com status 'pendente' do escritório atual. */
export async function carregarConvitesPendentes() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return [];
  const { data, error } = await sb
    .from('convites_pendentes')
    .select('id, email, papel, status, criado_em, expira_em')
    .eq('escritorio_id', escritorioId)
    .eq('status', 'pendente')
    .order('criado_em', { ascending: false });
  if (error) { console.warn('Erro ao carregar convites:', error.message); return []; }
  return data || [];
}

/**
 * Envia convite via Edge Function `convidar-usuario` (não é INSERT
 * direto — a function do lado do servidor cria o convite e dispara o
 * e-mail). Lança RepositoryError com a mensagem específica do servidor
 * quando disponível.
 * @param {{email: string, papel: string}} dados
 */
export async function enviarConvite({ email, papel }) {
  const sb = await getSB();
  if (!sb) throw new RepositoryError('Sem conexão com o banco.');

  const sessao = await sb.auth.getSession();
  const token = sessao.data.session?.access_token;
  if (!token) throw new RepositoryError('Sessão expirada. Faça login novamente.');

  let resp;
  try {
    resp = await fetch(`${SB_URL}/functions/v1/convidar-usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ email, papel, escritorioId: getEscritorioId() })
    });
  } catch (e) {
    throw new RepositoryError('Erro de conexão: ' + e.message, e);
  }

  const resultado = await resp.json();
  if (!resp.ok) throw new RepositoryError(resultado.erro || 'Erro ao enviar convite.');
  return resultado;
}

/** @returns {Promise<boolean>} true se cancelou com sucesso. */
export async function cancelarConvite(id) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb.from('convites_pendentes').update({ status: 'cancelado' }).eq('id', id).eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao cancelar convite:', error.message); return false; }
  return true;
}

/** @returns {Promise<boolean>} true se removeu com sucesso. */
export async function removerUsuarioEscritorio(id) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return false;
  const { error } = await sb.from('usuarios_escritorios').update({ ativo: false }).eq('id', id).eq('escritorio_id', escritorioId);
  if (error) { console.warn('Erro ao remover acesso:', error.message); return false; }
  return true;
}
