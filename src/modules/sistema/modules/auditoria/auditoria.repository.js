// modules/auditoria/auditoria.repository.js
// Única camada que fala com o Supabase para LER o log de auditoria
// (gravar é responsabilidade de core/audit/audit.js, desde a Sprint 9).
// Extraído do index.html monolítico (linhas 10627-10652).

import { getSB } from '../../../../core/supabase-client.js';
import { getEscritorioId } from '../../../../core/auth.js';
import { AUDIT_MAX } from './auditoria.constants.js';

/** @returns {Promise<Array>} até AUDIT_MAX registros de auditoria do escritório atual, mais recentes primeiro. */
export async function carregarAuditoria() {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return [];
  const { data, error } = await sb
    .from('auditoria')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .order('criado_em', { ascending: false })
    .limit(AUDIT_MAX);
  if (error) { console.warn('Erro ao carregar auditoria:', error.message); return []; }
  return (data || []).map((row) => {
    const dt = new Date(row.criado_em);
    return {
      id: row.id,
      ts: row.criado_em,
      data: dt.toLocaleDateString('pt-BR'),
      hora: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      usuario: row.usuario_nome,
      acao: row.acao,
      modulo: row.modulo,
      descricao: row.descricao,
      detalhes: row.detalhes || ''
    };
  });
}
