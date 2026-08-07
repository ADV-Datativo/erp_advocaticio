// modules/recebimentos/recebimentos.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama o Supabase direto.

import * as repository from './recebimentos.repository.js';
import * as state from './recebimentos.state.js';
import {
  validarSelecaoParcela,
  validarReagendamento,
  validarAjusteValor,
  validarGeracaoManual
} from './recebimentos.validation.js';

/** Carrega as parcelas do banco e atualiza o estado do submódulo. */
export async function carregarEArmazenarParcelas() {
  const parcelas = await repository.carregarParcelas();
  state.definirParcelas(parcelas);
  return parcelas;
}

/**
 * Status derivado de uma parcela (extraído de getParcelaStatus original).
 * @param {{status: string, vencimento: string}} parcela
 * @param {(data: string) => boolean} isVencido
 */
export function getStatusParcela(parcela, isVencido) {
  if (parcela.status === 'pago') return 'pago';
  if (isVencido(parcela.vencimento)) return 'vencido';
  return 'pendente';
}

/**
 * Agrega os totais do painel de Visão Financeira (extraído de
 * renderFinVisao original, linhas 13364-13374).
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

/**
 * Filtra e ordena a lista de parcelas para a tabela (extraído de
 * renderParcelas original, linhas 13500-13521).
 */
export function filtrarEOrdenarParcelas(parcelas, { filtroStatus, termoBusca }, clientes, processos, isVencido) {
  let lista = parcelas.map((p) => ({ ...p, computedStatus: getStatusParcela(p, isVencido) }));
  if (filtroStatus) lista = lista.filter((p) => p.computedStatus === filtroStatus);
  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    lista = lista.filter((p) => {
      const c = clientes.find((c) => c.id === p.clienteId) || { nome: '' };
      const pr = processos.find((pr) => pr.id === p.processoId) || { numero: '' };
      return c.nome.toLowerCase().includes(termo) || pr.numero.includes(termoBusca);
    });
  }
  lista.sort((a, b) => {
    const aPago = a.computedStatus === 'pago';
    const bPago = b.computedStatus === 'pago';
    if (aPago !== bPago) return aPago ? 1 : -1;
    if (!aPago) return (a.vencimento || '').localeCompare(b.vencimento || '');
    return (b.dtPagamento || '').localeCompare(a.dtPagamento || '');
  });
  return lista;
}

/**
 * Parcelas pendentes, ordenadas por vencimento, para o select de "marcar
 * como paga" (extraído de updateParcelasSelect original).
 */
export function listarParcelasPendentesOrdenadas(parcelas, isVencido) {
  return parcelas
    .filter((p) => p.status !== 'pago')
    .map((p) => ({ ...p, computedStatus: getStatusParcela(p, isVencido) }))
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
}

/**
 * Gera N parcelas para um processo, uma por mês a partir da 1ª data.
 *
 * CORREÇÃO DE BUG (06/08/2026): a versão original desta função
 * (`gerarParcelasManual`, linha 9882) escrevia direto em `store.parcelas`
 * e chamava `saveData()` (localStorage) — NUNCA persistia no Supabase.
 * Decisão registrada: corrigir agora, usando `repository.criarParcelas`
 * como o resto do sistema já faz. Comportamento visível ao usuário
 * (quantidade de parcelas geradas, valores, datas) é idêntico; a
 * diferença é que agora fica salvo de verdade no banco.
 *
 * @param {{processoId: string, clienteId: string, valor: number, nParcelas: number, data1: string}} dados
 * @returns {Promise<Array>} as parcelas criadas.
 */
export async function gerarParcelasParaProcesso(dados) {
  validarGeracaoManual({ processoId: dados.processoId, valor: dados.valor, data1: dados.data1 });

  await repository.excluirParcelasDoProcesso(dados.processoId);

  const valorParcela = parseFloat((dados.valor / dados.nParcelas).toFixed(2));
  const novas = [];
  for (let i = 0; i < dados.nParcelas; i++) {
    const d = new Date(dados.data1 + 'T12:00:00');
    d.setMonth(d.getMonth() + i);
    novas.push({
      processoId: dados.processoId,
      clienteId: dados.clienteId,
      num: i + 1,
      total: dados.nParcelas,
      vencimento: d.toISOString().split('T')[0],
      valor: valorParcela,
      status: 'pendente',
      dtPagamento: null,
      obs: ''
    });
  }

  const salvas = await repository.criarParcelas(novas);
  state.substituirParcelasDoProcesso(dados.processoId, salvas);
  return salvas;
}

/** @returns {Promise<object>} a parcela marcada como paga. */
export async function confirmarPagamento(id, { dataPagamento, obs }) {
  validarSelecaoParcela(id);
  const salvo = await repository.atualizarParcela(id, {
    status: 'pago',
    data_pagamento: dataPagamento,
    observacoes: obs || null
  });
  return state.atualizarParcelaNaLista(salvo);
}

/** @returns {Promise<object>} a parcela reagendada. */
export async function reagendarParcela(id, { novaData, motivo, obsAtual, vencimentoAtual, fmtDate }) {
  validarReagendamento(novaData);
  const novaObs = motivo
    ? (obsAtual ? obsAtual + ' | ' : '') + 'Reagendado de ' + fmtDate(vencimentoAtual) + ': ' + motivo
    : obsAtual;
  const salvo = await repository.atualizarParcela(id, {
    vencimento: novaData,
    status: 'pendente',
    observacoes: novaObs || null
  });
  return state.atualizarParcelaNaLista(salvo);
}

/**
 * Calcula o novo valor com desconto/acréscimo/juros aplicado, sem
 * persistir — usado no preview em tempo real do modal (extraído de
 * calcularDA original).
 */
export function calcularNovoValor(valorOriginal, { tipo, modalidade, input }) {
  if (!(input > 0)) return valorOriginal;
  const ajuste = modalidade === 'percentual' ? valorOriginal * (input / 100) : input;
  return tipo === 'desconto' ? Math.max(0, valorOriginal - ajuste) : valorOriginal + ajuste;
}

/**
 * Aplica e persiste o desconto/acréscimo/juros (extraído de confirmarDA original).
 * @returns {Promise<{parcela: object, descricao: string, valorOriginal: number}>}
 */
export async function aplicarAjusteValor(id, { tipo, modalidade, input, obs, tipoLabel }, obsAtual, valorOriginal) {
  validarAjusteValor(input);
  const ajuste = modalidade === 'percentual' ? valorOriginal * (input / 100) : input;
  let novoValor = tipo === 'desconto' ? Math.max(0, valorOriginal - ajuste) : valorOriginal + ajuste;
  novoValor = parseFloat(novoValor.toFixed(2));
  const descricao = tipoLabel + (modalidade === 'percentual' ? ' de ' + input + '%' : ' de ' + ajuste);
  const novaObs = (obsAtual ? obsAtual + ' | ' : '') + descricao + (obs ? ' — ' + obs : '');

  const salvo = await repository.atualizarParcela(id, { valor: novoValor, observacoes: novaObs });
  const parcela = state.atualizarParcelaNaLista(salvo);
  return { parcela, descricao, valorOriginal };
}

/**
 * Reúne parcela + processo + cliente + tipo em um único objeto, pronto
 * para o template do recibo (extraído do início de gerarReciboPagamento
 * original, linhas 13080-13088). Retorna null se a parcela não existir ou
 * não estiver paga (mesma regra da função original).
 */
export function montarDadosRecibo(parcelaId, { escritorio, nomeEscritorio, hoje }) {
  const pa = state.listarParcelas().find((p) => p.id === parcelaId);
  if (!pa || pa.status !== 'pago') return null;
  const proc = state.listarProcessos().find((p) => p.id === pa.processoId) || { numero: '—', adv: '—' };
  const c = state.listarClientes().find((c) => c.id === pa.clienteId) || { nome: '—', cpf: '—' };
  const t = state.listarTipos().find((t) => t.id === proc.tipoId) || { nome: '—' };
  const reciboNum = String(pa.processoId).padStart(4, '0') + '-' + String(pa.num).padStart(2, '0');
  return { parcela: pa, processo: proc, cliente: c, tipo: t, escritorio, nomeEscritorio, hoje, reciboNum };
}

/**
 * Monta a mensagem de recibo para WhatsApp (extraído de
 * montarMensagemRecibo original, linhas 10418-10430).
 * @param {string} clienteId @param {string|null} parcelaId
 * @param {{msgRecibo: string}} cfg @param {string} templatePadrao
 * @param {(dataISO: string) => string} fmtDate @param {(valor: number) => string} fmtMoney
 * @param {() => string} today @param {string} nomeEscritorio
 */
export function montarMensagemRecibo(clienteId, parcelaId, cfg, templatePadrao, fmtDate, fmtMoney, today, nomeEscritorio) {
  const c = state.listarClientes().find((c) => c.id === clienteId) || { nome: 'Cliente', tel: '' };
  const p = parcelaId ? state.listarParcelas().find((p) => p.id === parcelaId) : null;
  const pr = p ? state.listarProcessos().find((pr) => pr.id === p.processoId) || { numero: '—' } : null;
  const msg = (cfg.msgRecibo || templatePadrao)
    .replace(/{{NOME}}/g, c.nome)
    .replace(/{{PROCESSO}}/g, pr ? pr.numero : '—')
    .replace(/{{PARCELA}}/g, p ? p.num + '/' + p.total : '—')
    .replace(/{{VALOR}}/g, p ? fmtMoney(p.valor) : '—')
    .replace(/{{DATA_PAGAMENTO}}/g, p && p.dtPagamento ? fmtDate(p.dtPagamento) : today())
    .replace(/{{ESCRITORIO}}/g, nomeEscritorio);
  return { msg, tel: c.tel || '' };
}

/**
 * Monta a mensagem de cobrança para WhatsApp (extraído de
 * montarMensagemWpp original, linhas 10441-10455).
 */
export function montarMensagemWpp(clienteId, parcelaId, cfg, templatePadrao, fmtDate, fmtMoney, nomeEscritorio) {
  const c = state.listarClientes().find((c) => c.id === clienteId) || { nome: 'Cliente', tel: '' };
  const p = parcelaId ? state.listarParcelas().find((p) => p.id === parcelaId) : null;
  const pr = p ? state.listarProcessos().find((pr) => pr.id === p.processoId) || { numero: '—' } : null;
  const msg = (cfg.msg || templatePadrao)
    .replace(/{{NOME}}/g, c.nome)
    .replace(/{{PROCESSO}}/g, pr ? pr.numero : '—')
    .replace(/{{PARCELA}}/g, p ? p.num + '/' + p.total : '—')
    .replace(/{{VALOR}}/g, p ? fmtMoney(p.valor) : '—')
    .replace(/{{VENCIMENTO}}/g, p ? fmtDate(p.vencimento) : '—')
    .replace(/{{PIX}}/g, cfg.pix || '(configure em Opções → WhatsApp)')
    .replace(/{{TITULAR}}/g, cfg.pixTitular || nomeEscritorio)
    .replace(/{{ESCRITORIO}}/g, nomeEscritorio);
  return { msg, tel: c.tel || '' };
}
