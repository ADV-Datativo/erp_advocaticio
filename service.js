// modules/financeiro/service.js
// Regra de negócio pura do módulo Financeiro. Recebe dados prontos, devolve
// dados prontos. Nunca lê document.getElementById, nunca chama showToast,
// nunca chama o Supabase diretamente — só o repository faz isso.

import * as repository from './repository.js';
import { ValidationError, validarDespesaForm } from './validation.js';

const MESES_POR_RECORRENCIA = { mensal: 1, bimestral: 2, trimestral: 3, semestral: 6, anual: 12 };

// ==================== PARCELAS ====================

/**
 * Status derivado de uma parcela — "pago" e "pendente" são persistidos no
 * banco; "vencido" é sempre calculado na hora, nunca gravado (extraído de
 * getParcelaStatus original).
 * @param {{status: string, vencimento: string}} parcela
 * @param {(data: string) => boolean} isVencido função de comparação de data já existente no sistema
 */
export function getStatusParcela(parcela, isVencido) {
  if (parcela.status === 'pago') return 'pago';
  if (isVencido(parcela.vencimento)) return 'vencido';
  return 'pendente';
}

/**
 * Agrega os totais usados no painel de Visão Financeira (extraído de
 * renderFinVisao original — só a parte de cálculo, sem tocar no DOM).
 * @param {Array} parcelas
 * @param {(data: string) => boolean} isVencido
 */
export function calcularResumoFinanceiro(parcelas, isVencido) {
  const pagos = parcelas.filter((p) => p.status === 'pago');
  const vencidos = parcelas.filter((p) => p.status !== 'pago' && isVencido(p.vencimento));
  const aReceber = parcelas.filter((p) => p.status !== 'pago' && !isVencido(p.vencimento));
  const soma = (arr) => arr.reduce((s, p) => s + p.valor, 0);
  return {
    totalRecebido: soma(pagos),
    totalVencido: soma(vencidos),
    totalAReceber: soma(aReceber),
    totalContratado: soma(parcelas),
    vencidos,
    aReceber
  };
}

// ==================== DESPESAS ====================

/**
 * Gera as N despesas de uma recorrência (mensal/bimestral/etc.) a partir de
 * uma despesa-base, uma por competência, com o mesmo grupoRecorrencia.
 * Despesa única retorna um array de 1 item.
 * @param {object} base campos comuns validados
 * @param {{recorrencia: string, repeticoes: number}} opcoes
 */
export function gerarDespesasRecorrentes(base, { recorrencia, repeticoes }) {
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
 * Orquestra a criação ou edição de uma despesa: valida, gera recorrências
 * se for o caso, e delega ao repository. Lança ValidationError ou
 * RepositoryError — quem chama decide como exibir isso ao usuário.
 * @param {object} form dados já lidos do formulário pelo controller
 * @param {string|null} editId presente quando é edição
 * @returns {Promise<{despesas: Array, criouMultiplas: boolean}>}
 */
export async function salvarDespesa(form, editId) {
  validarDespesaForm(form);

  if (editId) {
    const payload = despesaParaPayloadDeAtualizacao(form);
    const salvo = await repository.atualizarDespesaNoBanco(editId, payload);
    return { despesas: [salvo], criouMultiplas: false };
  }

  const novas = gerarDespesasRecorrentes(form, {
    recorrencia: form.recorrencia,
    repeticoes: form.repeticoes
  });
  const salvas = await repository.criarDespesasNoBanco(novas);
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

/** @returns {Promise<boolean>} true se excluiu com sucesso. */
export async function excluirDespesa(id) {
  return repository.excluirDespesaDoBanco(id);
}

/**
 * Marca uma despesa como paga.
 * @returns {Promise<object|null>} a despesa atualizada.
 */
export async function confirmarPagamentoDespesa(id, { dataPagamento, forma }) {
  return repository.atualizarDespesaNoBanco(id, {
    status: 'pago',
    data_pagamento: dataPagamento,
    forma_pagamento: forma
  });
}

export { ValidationError };
