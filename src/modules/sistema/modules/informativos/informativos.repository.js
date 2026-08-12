// modules/informativos/informativos.repository.js
// Única camada que fala com o Supabase para Informativos. Extraído do
// index.html monolítico (linhas 5646-5698), sem alteração de
// comportamento.
//
// Achado: `informativos` não filtra por escritorio_id no cliente —
// depende inteiramente do RLS pra decidir o que é "para todos" vs
// específico de um escritório. Diferente do padrão dos outros
// repositories já migrados (que filtram explicitamente). Preservado
// como estava — não é bug, é decisão original de RLS-only.

import { getSB } from '../../../../core/supabase-client.js';
import { getSessao } from '../../../../core/auth.js';

function informativoDoBanco(row, lidoPorMim) {
  return {
    id: row.id,
    titulo: row.titulo,
    corpo: row.corpo || '',
    tipo: row.tipo || 'normal',
    escritorioId: row.escritorio_id || null, // null = para todos
    anexoPath: row.anexo_path || null,
    anexoNome: row.anexo_nome || '',
    validoAte: row.valido_até || null,
    criadoEm: row.criado_em,
    lido: lidoPorMim
  };
}

/**
 * Carrega os informativos visíveis pro usuário atual (já filtrados pelo
 * RLS), cruzados com as próprias marcas de leitura.
 * @param {() => string} today
 */
export async function carregarInformativos(today) {
  const sb = await getSB();
  if (!sb) return [];
  const hoje = today();
  const { data, error } = await sb
    .from('informativos')
    .select('*')
    .or('valido_até.is.null,valido_até.gte.' + hoje)
    .order('criado_em', { ascending: false });
  if (error) { console.warn('Erro ao carregar informativos:', error.message); return []; }

  const { data: lidos } = await sb.from('informativos_lidos').select('informativo_id');
  const idsLidos = new Set((lidos || []).map((l) => l.informativo_id));

  return (data || []).map((row) => informativoDoBanco(row, idsLidos.has(row.id)));
}

/** @returns {Promise<boolean>} true se marcou com sucesso. */
export async function marcarInformativoLido(id) {
  const sb = await getSB();
  if (!sb) return false;
  const { error } = await sb.from('informativos_lidos').upsert(
    { informativo_id: id, usuario_id: getSessao().userId },
    { onConflict: 'informativo_id,usuario_id', ignoreDuplicates: true }
  );
  if (error) { console.warn('Erro ao marcar como lido:', error.message); return false; }
  return true;
}

/** @returns {Promise<string|null>} URL assinada (300s) pro anexo, ou null em erro. */
export async function obterUrlAnexoInformativo(path) {
  const sb = await getSB();
  if (!sb) return null;
  const { data, error } = await sb.storage.from('informativos').createSignedUrl(path, 300);
  if (error) { console.warn('Erro ao obter URL do anexo:', error.message); return null; }
  return data.signedUrl;
}
