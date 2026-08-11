// core/audit/audit.js
//
// Sprint 9. Move registrarAuditoria() pro Core — achado da auditoria de
// Sistema (07/08/2026): a função é chamada 31 vezes por 7 domínios
// diferentes (financeiro, processo, cliente, despesa, agenda, usuario,
// sistema), então nunca foi "do domínio Sistema" de verdade, mesmo
// vivendo perto da tela de Opções. Aqui ela vira infraestrutura
// cross-cutting de fato, ao lado do logger.
//
// A TELA que exibe o log de auditoria (renderAuditoria, carregarAuditoria,
// exportarAuditoria) CONTINUA em Sistema/Opções — só a função de
// GRAVAR foi movida. Comportamento idêntico ao original, extraído sem
// alteração de lógica.

import { getSB } from '../supabase-client.js';
import { getEscritorioId, getSessao } from '../auth.js';

/**
 * Grava um evento de auditoria (visível na tela de Auditoria, dentro de
 * Opções). Silenciosa se não houver sessão real ainda (ex: antes do
 * login) — mesmo comportamento do original.
 * @param {string} acao ex: 'criou', 'editou', 'excluiu', 'pagou', 'exportou'
 * @param {string} modulo ex: 'financeiro', 'processo', 'usuario'
 * @param {string} descricao texto livre, o que aconteceu
 * @param {string} [detalhes] contexto adicional opcional
 */
export async function registrarAuditoria(acao, modulo, descricao, detalhes) {
  const sb = await getSB();
  const escritorioId = getEscritorioId();
  if (!sb || !escritorioId) return; // sem sessão real ainda — não registra

  const session = getSessao();
  const { error } = await sb.from('auditoria').insert({
    escritorio_id: escritorioId,
    usuario_id: session.userId || null,
    usuario_nome: session.nome || session.email || 'Sistema',
    acao, modulo, descricao,
    detalhes: detalhes || null
  });
  if (error) console.warn('Erro ao registrar auditoria:', error.message);
}
