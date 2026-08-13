// modules/processos/processos.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama Supabase direto.

import * as repository from './processos.repository.js';
import * as state from './processos.state.js';
import { validarProcesso } from './processos.validation.js';
import { apiDoSubmodulo, estaMigrado } from '../../../financeiro/financeiro.registry.js';

/** Carrega todos os processos e atualiza o estado. */
export async function carregarEArmazenarProcessos() {
  const processos = await repository.carregarProcessos();
  state.definirProcessos(processos);
  return processos;
}

/**
 * Calcula o preview de condições financeiras de um cliente, exatamente
 * como usado no formulário de novo processo. Extraído de
 * mostrarPreviewFinanceiroCliente original, linhas 12970-12994 — só o
 * CÁLCULO, sem tocar DOM.
 * @param {object|null} cliente
 */
export function calcularPreviewFinanceiro(cliente) {
  if (!cliente) return { visivel: false };
  const valor = parseFloat(cliente.valor) || 0;
  if (valor <= 0) {
    return { visivel: true, temCondicoes: false };
  }
  const nParc = parseInt(cliente.nParcelas) || 1;
  const primeiraData = cliente.datasParcelas?.[0] || null;
  return {
    visivel: true, temCondicoes: true,
    valor, nParcelas: nParc, valorParcela: valor / nParc, primeiraData
  };
}

/**
 * Monta as parcelas a gerar pro processo novo, respeitando datas
 * customizadas por parcela do cliente quando existirem (fallback:
 * mensal a partir da 1ª data). Extraído de salvarProcesso original,
 * linhas 13050-13068.
 * @param {string} processoId @param {object} cliente @param {(dataISO: string) => string} today @param {(data: string, meses: number) => string} addMonths
 */
export function montarParcelasParaGerar(processoId, cliente, today, addMonths) {
  const valor = parseFloat(cliente.valor) || 0;
  const nParcelas = parseInt(cliente.nParcelas) || 1;
  if (valor <= 0) return [];

  const valorParcela = parseFloat((valor / nParcelas).toFixed(2));
  const dt1 = (cliente.datasParcelas && cliente.datasParcelas[0]) || today();
  const parcelas = [];
  for (let i = 0; i < nParcelas; i++) {
    const dtVenc = (cliente.datasParcelas && cliente.datasParcelas[i]) || addMonths(dt1, i);
    parcelas.push({
      processoId, clienteId: cliente.id,
      num: i + 1, total: nParcelas,
      vencimento: dtVenc, valor: valorParcela,
      status: 'pendente', dtPagamento: null, obs: ''
    });
  }
  return parcelas;
}

/**
 * Orquestra salvar (criar ou editar) um processo. Extraído de
 * salvarProcesso original, linhas 13006-13078.
 *
 * Achado corrigido: o original escrevia direto em store.parcelas,
 * pulando o domínio Recebimentos (já migrado). Agora passa pelo
 * Registry do Financeiro — nunca toca `store` de outro domínio direto.
 *
 * @param {object} form @param {string|null} editId
 * @param {{criarAndamentoNoBanco: Function, today: () => string, addMonths: Function, registrarAuditoria: Function}} deps
 * @returns {Promise<{processo: object, foiEdicao: boolean, parcelasGeradas: number, criouAndamento: boolean}>}
 */
export async function salvarProcesso(form, editId, deps) {
  validarProcesso(form);
  const salvo = await repository.salvarProcesso(form, editId);

  if (editId) {
    state.atualizarNaLista(salvo);
    deps.registrarAuditoria('editou', 'processo', 'Editou processo: ' + form.numero, '');
    return { processo: salvo, foiEdicao: true, parcelasGeradas: 0, criouAndamento: false };
  }

  state.adicionarNaLista(salvo);
  state.garantirAndamentosVazio(salvo.id);
  const andamentoAbertura = await deps.criarAndamentoNoBanco(salvo.id, 'Processo aberto.', form.status);
  if (andamentoAbertura) state.adicionarAndamento(salvo.id, andamentoAbertura);

  const cliente = state.buscarCliente(form.clienteId);
  const valorCliente = parseFloat(cliente?.valor) || 0;

  let parcelasGeradas = 0;
  if (cliente && valorCliente > 0 && estaMigrado('recebimentos')) {
    const parcelas = montarParcelasParaGerar(salvo.id, cliente, deps.today, deps.addMonths);
    await apiDoSubmodulo('recebimentos').salvarParcelasPreCalculadas(salvo.id, parcelas);
    parcelasGeradas = parcelas.length;
    deps.registrarAuditoria('criou', 'processo', 'Criou processo: ' + form.numero + ' com ' + parcelasGeradas + ' parcela(s)', '');
  } else {
    deps.registrarAuditoria('criou', 'processo', 'Criou processo: ' + form.numero, 'Sem condições financeiras no cliente');
  }

  return { processo: salvo, foiEdicao: false, parcelasGeradas, criouAndamento: !!andamentoAbertura };
}

/** @returns {Promise<boolean>} true se excluiu; já remove do estado do submódulo. */
export async function excluirProcesso(id) {
  const ok = await repository.excluirProcesso(id);
  if (ok) state.removerDaLista(id);
  return ok;
}

/**
 * Filtra e busca processos pra listagem (extraído de renderProcessos
 * original, linhas 13082-13089).
 * @param {string} filtroTab 'todos' ou um status @param {string} busca
 */
export function filtrarProcessos(filtroTab, busca) {
  return state.listarProcessos().filter((p) => {
    if (filtroTab !== 'todos' && p.status !== filtroTab) return false;
    if (busca) {
      const c = state.buscarCliente(p.clienteId);
      return p.numero.includes(busca) || (c && c.nome.toLowerCase().includes(busca.toLowerCase()));
    }
    return true;
  });
}

/** @param {string} processoId @returns {{pago: number, total: number, pct: number}} */
export function calcularProgressoFinanceiro(processoId) {
  const parcelas = state.parcelasDoProcesso(processoId);
  const pago = parcelas.filter((p) => p.status === 'pago').reduce((s, p) => s + p.valor, 0);
  const total = parcelas.reduce((s, p) => s + p.valor, 0);
  return { pago, total, pct: total > 0 ? Math.min(100, Math.round((pago / total) * 100)) : 0 };
}
