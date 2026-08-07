// modules/despesas/despesas.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama o Supabase direto.

import * as repository from './despesas.repository.js';
import * as state from './despesas.state.js';
import { validarDespesaForm } from './despesas.validation.js';
import { DIAS_JANELA_A_VENCER } from './despesas.constants.js';

const MESES_POR_RECORRENCIA = { mensal: 1, bimestral: 2, trimestral: 3, semestral: 6, anual: 12 };

/** Carrega despesas do banco e atualiza o estado do submódulo. */
export async function carregarEArmazenarDespesas() {
  const despesas = await repository.carregarDespesas();
  state.definirDespesas(despesas);
  return despesas;
}

/**
 * Marca como "vencido" toda despesa pendente cujo vencimento já passou.
 * Extraído de atualizarStatusDespesas original — é recálculo local, não
 * persiste no banco (o banco só é atualizado quando o usuário paga/edita).
 * @param {(dataISO: string) => string} today
 */
export function atualizarStatusVencidas(despesas, today) {
  const hoje = today();
  despesas.forEach((d) => { if (d.status === 'pendente' && d.vencimento < hoje) d.status = 'vencido'; });
}

/**
 * Agrega os totais dos cards do painel de Despesas (extraído de
 * renderDespesasCards original — só o cálculo, sem tocar no DOM).
 * @param {(dataISO: string) => string} today
 */
export function calcularResumoCards(despesas, today) {
  const hoje = today();
  const mesAtual = hoje.substring(0, 7);
  const d30 = new Date();
  d30.setDate(d30.getDate() + DIAS_JANELA_A_VENCER);
  const d30s = d30.toISOString().split('T')[0];

  const doMes = despesas.filter((d) => (d.vencimento || '').startsWith(mesAtual));
  const vencidas = despesas.filter((d) => d.status === 'vencido');
  const aVencer = despesas.filter((d) => d.status === 'pendente' && d.vencimento > hoje && d.vencimento <= d30s);
  const pagas = despesas.filter((d) => d.status === 'pago' && (d.dataPagamento || d.vencimento || '').startsWith(mesAtual));
  const soma = (arr) => arr.reduce((s, d) => s + d.valor, 0);

  return {
    totalMes: soma(doMes), qtdMes: doMes.length,
    totalVencidas: soma(vencidas), qtdVencidas: vencidas.length,
    totalAVencer: soma(aVencer), qtdAVencer: aVencer.length,
    totalPagas: soma(pagas), qtdPagas: pagas.length
  };
}

/**
 * Filtra e ordena a lista de despesas para a tabela (extraído de
 * renderDespesas original, linhas 10696-10701).
 * @param {{status?: string, categoria?: string, mes?: string}} filtros
 */
export function filtrarEOrdenarDespesas(despesas, { status, categoria, mes }) {
  let lista = despesas;
  if (status) lista = lista.filter((d) => d.status === status);
  if (categoria) lista = lista.filter((d) => d.categoria === categoria);
  if (mes) lista = lista.filter((d) => (d.vencimento || '').startsWith(mes));
  return lista.slice().sort((a, b) => (a.vencimento || '').localeCompare(b.vencimento || ''));
}

function gerarDespesasRecorrentes(base, { recorrencia, repeticoes }) {
  const qtd = recorrencia !== 'unica' ? repeticoes : 1;
  const intervalo = MESES_POR_RECORRENCIA[recorrencia] || 1;
  const grupo = recorrencia !== 'unica' ? crypto.randomUUID() : null;
  const despesas = [];
  for (let i = 0; i < qtd; i++) {
    const data = new Date(base.vencimento + 'T12:00:00');
    data.setMonth(data.getMonth() + i * intervalo);
    despesas.push({
      ...base,
      vencimento: data.toISOString().split('T')[0],
      status: i === 0 ? base.status : 'pendente',
      grupoRecorrencia: grupo
    });
  }
  return despesas;
}

/**
 * Orquestra criação/edição: valida, gera recorrências se for o caso,
 * delega ao repository, e atualiza o estado do submódulo.
 * @returns {Promise<{despesas: Array, criouMultiplas: boolean}>}
 */
export async function salvarDespesa(form, editId) {
  validarDespesaForm(form);

  if (editId) {
    const payload = despesaParaPayloadDeAtualizacao(form);
    const salvo = await repository.atualizarDespesa(editId, payload);
    state.atualizarDespesaNaLista(salvo);
    return { despesas: [salvo], criouMultiplas: false };
  }

  const novas = gerarDespesasRecorrentes(form, { recorrencia: form.recorrencia, repeticoes: form.repeticoes });
  const salvas = await repository.criarDespesas(novas);
  state.adicionarDespesas(salvas);
  return { despesas: salvas, criouMultiplas: salvas.length > 1 };
}

function despesaParaPayloadDeAtualizacao(form) {
  return {
    descricao: form.descricao,
    categoria: form.categoria,
    valor: form.valor,
    vencimento: form.vencimento,
    conta: form.conta || null,
    data_pagamento: form.dataPagamento || null,
    forma_pagamento: form.forma || null,
    recorrencia: form.recorrencia,
    status: form.status,
    observacoes: form.obs || null
  };
}

/** @returns {Promise<boolean>} true se excluiu; já remove do estado do submódulo. */
export async function excluirDespesa(id) {
  const ok = await repository.excluirDespesa(id);
  if (ok) state.removerDespesaDaLista(id);
  return ok;
}

/** @returns {Promise<object|null>} a despesa atualizada, já refletida no estado. */
export async function confirmarPagamento(id, { dataPagamento, forma }) {
  const salvo = await repository.atualizarDespesa(id, {
    status: 'pago',
    data_pagamento: dataPagamento,
    forma_pagamento: forma
  });
  if (salvo) state.atualizarDespesaNaLista(salvo);
  return salvo;
}

export { ValidationError } from './despesas.validation.js';
