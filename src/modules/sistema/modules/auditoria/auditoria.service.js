// modules/auditoria/auditoria.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama Supabase direto.

import * as repository from './auditoria.repository.js';
import * as state from './auditoria.state.js';

/**
 * Carrega a auditoria só se ainda não tiver cache — mesmo comportamento
 * original (`if(_auditoriaCache === null) { ... }`).
 * @returns {Promise<Array>}
 */
export async function carregarSeNecessario() {
  if (!state.estaCarregado()) {
    const logs = await repository.carregarAuditoria();
    state.definirCache(logs);
  }
  return state.obterCache();
}

/**
 * Filtra os logs por tipo (módulo), ação e período (extraído de
 * renderAuditoria original, linhas 10668-10672).
 * @param {Array} logs
 * @param {{tipo?: string, acao?: string, de?: string, ate?: string}} filtros
 */
export function filtrarLogs(logs, { tipo, acao, de, ate }) {
  let lista = logs;
  if (tipo) lista = lista.filter((l) => l.modulo === tipo);
  if (acao) lista = lista.filter((l) => l.acao === acao);
  if (de) lista = lista.filter((l) => l.ts && l.ts.substring(0, 10) >= de);
  if (ate) lista = lista.filter((l) => l.ts && l.ts.substring(0, 10) <= ate);
  return lista;
}

/**
 * Monta as linhas do CSV de exportação (extraído de exportarAuditoria
 * original, linhas 10717-10721 — só a montagem de dado, sem baixar
 * arquivo, isso é responsabilidade do controller).
 * @param {Array} logs
 * @returns {{linhas: string[], vazio: boolean}}
 */
export function montarCsv(logs) {
  if (!logs || !logs.length) return { linhas: [], vazio: true };
  const header = 'Data;Hora;Usuário;Ação;Módulo;Descrição;Detalhes';
  const linhas = logs.map((l) =>
    [l.data, l.hora, l.usuario, l.acao, l.modulo, l.descricao, l.detalhes || ''].join(';')
  );
  return { linhas: [header, ...linhas], vazio: false };
}
