// modules/intimacoes/intimacoes.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama Supabase direto.

import * as repository from './intimacoes.repository.js';
import * as state from './intimacoes.state.js';
import { validarIntimacao } from './intimacoes.validation.js';
import { INTIM_PRAZOS, PRAZO_PADRAO_DIAS, JANELA_ALERTA_FATAL_DIAS } from './intimacoes.constants.js';

/** Carrega todas as intimações do banco e atualiza o estado. */
export async function carregarEArmazenarIntimacoes() {
  const agrupado = await repository.carregarIntimacoes();
  state.definirTodas(agrupado);
  return agrupado;
}

/**
 * Calcula o prazo final a partir do tipo de intimação (ou dias
 * personalizados), ajustando fim de semana pro próximo dia útil.
 * Extraído de intimacaoCalcPrazo original, linhas 14193-14200.
 * @param {{tipo: string, data: string, diasPersonalizados?: number}} params
 * @returns {string|null} data no formato YYYY-MM-DD, ou null se faltar tipo/data.
 */
export function calcularPrazoFinal({ tipo, data, diasPersonalizados }) {
  if (!tipo || !data) return null;
  const dias = tipo === 'personalizado' ? (diasPersonalizados || 0) : (INTIM_PRAZOS[tipo] || PRAZO_PADRAO_DIAS);
  if (!dias) return null;
  const dtFim = new Date(data + 'T12:00:00');
  dtFim.setDate(dtFim.getDate() + dias);
  while (dtFim.getDay() === 0 || dtFim.getDay() === 6) dtFim.setDate(dtFim.getDate() + 1);
  return dtFim.toISOString().split('T')[0];
}

/**
 * Calcula o texto/estilo do aviso de prazo (extraído de
 * intimacaoCalcPrazo original, linhas 14204-14209).
 * @param {string} prazoFinalStr
 * @returns {{mensagem: string, nivel: 'vencido'|'urgente'|'atencao'|null, diasRestantes: number}}
 */
export function calcularAvisoPrazo(prazoFinalStr) {
  const dtFim = new Date(prazoFinalStr + 'T12:00:00');
  const diasRestantes = Math.ceil((dtFim - new Date()) / (1000 * 60 * 60 * 24));
  if (diasRestantes < 0) return { mensagem: `⚠️ Prazo já vencido há ${Math.abs(diasRestantes)}dia(s)!`, nivel: 'vencido', diasRestantes };
  if (diasRestantes <= 5) return { mensagem: `🔴 URGENTE: ${diasRestantes} dia(s) restantes!`, nivel: 'urgente', diasRestantes };
  if (diasRestantes <= 10) return { mensagem: `🟡 Atenção: ${diasRestantes} dias restantes.`, nivel: 'atencao', diasRestantes };
  return { mensagem: '', nivel: null, diasRestantes };
}

/**
 * Status visual de uma intimação individual, pra lista do detalhe do
 * processo (extraído de renderIntimacoesHTML original, linhas
 * 14157-14161).
 * @param {object} intimacao @param {string} hoje
 */
export function getStatusVisual(intimacao, hoje) {
  const dias = intimacao.prazoFinal ? Math.ceil((new Date(intimacao.prazoFinal) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const vencida = intimacao.prazoFinal && intimacao.prazoFinal < hoje;
  const urgente = !vencida && dias !== null && dias <= 5;
  return { dias, vencida, urgente };
}

/**
 * Orquestra salvar (criar ou editar) uma intimação.
 * @param {object} form @param {string|null} editId
 * @returns {Promise<{intimacao: object, eventoRow: object|null, foiEdicao: boolean}>}
 */
export async function salvarIntimacao(form, editId) {
  validarIntimacao(form);

  if (editId) {
    const salva = await repository.atualizarIntimacao(editId, {
      tipo: form.tipo,
      data_intimacao: form.data,
      prazo_final: form.prazoFinal || null,
      descricao: form.descricao || null,
      fatal: form.fatal
    });
    state.atualizarNaLista(form.procId, salva);
    return { intimacao: salva, eventoRow: null, foiEdicao: true };
  }

  const resultado = await repository.registrarIntimacao(form);
  const nova = await repository.buscarIntimacaoPorId(resultado.intimacao_id);
  state.adicionarNaLista(form.procId, nova);

  let eventoRow = null;
  if (resultado.evento_id) {
    eventoRow = await repository.buscarEventoPorId(resultado.evento_id);
  }

  return { intimacao: nova, eventoRow, foiEdicao: false };
}

/** @returns {Promise<boolean>} true se excluiu; já remove do estado do submódulo. */
export async function excluirIntimacao(procId, id) {
  const ok = await repository.excluirIntimacao(id);
  if (ok) state.removerDaLista(procId, id);
  return ok;
}

/** @returns {Promise<object|null>} a intimação atualizada, já refletida no estado. */
export async function marcarCumprida(procId, id, today) {
  const salva = await repository.atualizarIntimacao(id, { cumprido: true });
  const atualizada = state.atualizarNaLista(procId, salva);
  if (atualizada) atualizada.cumpridoEm = today();
  return atualizada;
}

/**
 * Varre TODAS as intimações fatais, não cumpridas, vencidas ou a vencer
 * em até JANELA_ALERTA_FATAL_DIAS. Extraído de getPrazosFatais original,
 * linhas 14266-14282 — usado pelo alerta do Dashboard.
 * @param {(dataISO: string) => string} today
 */
export function getPrazosFatais(today) {
  const agrupado = state.obterTudoAgrupado();
  const hoje = today();
  const d3 = new Date();
  d3.setDate(d3.getDate() + JANELA_ALERTA_FATAL_DIAS);
  const d3s = d3.toISOString().split('T')[0];

  const fatais = [];
  Object.entries(agrupado).forEach(([procId, intims]) => {
    intims.filter((i) => i.fatal && !i.cumprido && i.prazoFinal).forEach((i) => {
      if (i.prazoFinal <= d3s) {
        const dias = Math.ceil((new Date(i.prazoFinal) - new Date()) / (1000 * 60 * 60 * 24));
        const proc = state.listarProcessos().find((p) => p.id === procId) || { numero: '—' };
        const c = state.listarClientes().find((c) => c.id === proc.clienteId) || { nome: '—' };
        fatais.push({ ...i, procId, proc, c, dias });
      }
    });
  });
  return fatais.sort((a, b) => (a.prazoFinal || '').localeCompare(b.prazoFinal || ''));
}
