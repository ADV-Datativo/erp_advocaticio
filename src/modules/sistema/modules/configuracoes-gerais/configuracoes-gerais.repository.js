// modules/configuracoes-gerais/configuracoes-gerais.repository.js
//
// ACHADO CRÍTICO corrigido em 12/08/2026: aparencia (cor primária, cor
// de destaque, logo) nunca era persistida no Supabase — só em
// localStorage via saveData()/sbSave(). As colunas cor_primaria,
// cor_destaque e logo_base64 JÁ EXISTEM na tabela escritorios (nunca
// foram usadas pelo front-end). Este arquivo é a primeira vez que
// Configurações Gerais fala direto com o Supabase — antes disso, bastava
// DOM + dependências injetadas do monólito (getNomeEscritorio/setNomeEscritorio).

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { RepositoryError } from '../../../../core/errors/index.js';

export { RepositoryError };

/**
 * @param {{corPrimaria: string, corDestaque: string, logoBase64: string|null}} aparencia
 */
export async function salvarAparenciaNoBanco(aparencia) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) throw new RepositoryError('Sem conexão com o banco.');

  const { error } = await sb.from('escritorios').update({
    cor_primaria: aparencia.corPrimaria,
    cor_destaque: aparencia.corDestaque,
    logo_base64: aparencia.logoBase64
  }).eq('id', escritorioId);

  if (error) throw new RepositoryError('Erro ao salvar identidade visual: ' + error.message, error);
}

/**
 * @returns {Promise<{corPrimaria: string|null, corDestaque: string|null, logoBase64: string|null}>}
 */
export async function carregarAparenciaDoBanco() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return { corPrimaria: null, corDestaque: null, logoBase64: null };

  const { data, error } = await sb.from('escritorios').select('cor_primaria, cor_destaque, logo_base64').eq('id', escritorioId).single();
  if (error) { console.warn('Erro ao carregar identidade visual:', error.message); return { corPrimaria: null, corDestaque: null, logoBase64: null }; }

  return {
    corPrimaria: data.cor_primaria || null,
    corDestaque: data.cor_destaque || null,
    logoBase64: data.logo_base64 || null
  };
}
