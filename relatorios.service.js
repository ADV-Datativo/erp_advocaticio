// modules/relatorios/relatorios.service.js
// Regra de negócio pura. Nunca toca DOM. Busca dado de Recebimentos e
// Despesas exclusivamente via financeiro.registry.js — nunca lê
// store.parcelas nem store.despesas diretamente (essa era exatamente a
// violação identificada na auditoria original: gerarRelatorio original
// lia store.parcelas e getDespesas() direto).

import { apiDoSubmodulo, estaMigrado } from '../../financeiro.registry.js';
import { JANELA_GRAFICO_MESES, LIMITE_DIAS_INADIMPLENCIA_GRAVE } from './relatorios.constants.js';

/**
 * Busca a lista de parcelas via o submódulo Recebimentos (Registry).
 * Lança erro claro se Recebimentos ainda não migrou — não deveria
 * acontecer em produção (Recebimentos migra antes de Relatórios ser
 * habilitado), mas evita um erro confuso caso a ordem seja violada.
 */
function obterParcelas() {
  if (!estaMigrado('recebimentos')) {
    throw new Error('[relatorios] Recebimentos precisa estar migrado antes de Relatórios.');
  }
  return apiDoSubmodulo('recebimentos').listarTodas();
}

function obterDespesas() {
  if (!estaMigrado('despesas')) {
    throw new Error('[relatorios] Despesas precisa estar migrado antes de Relatórios.');
  }
  return apiDoSubmodulo('despesas').listarTodas();
}

function obterStatusParcela(p, isVencido) {
  return apiDoSubmodulo('recebimentos').getStatusParcela(p, isVencido);
}

// ==================== FLUXO DE CAIXA ====================

/**
 * Calcula tudo que a aba "Fluxo de Caixa" precisa (extraído de
 * gerarRelatorio original, linhas 14902-14985 — só a parte de cálculo,
 * sem HTML de tabela/gráfico, isso fica nos components).
 * @param {{de?: string, ate?: string, filtroEntradas?: string, filtroSaidas?: string}} filtros
 * @param {(dataISO: string) => string} today @param {(data: string) => boolean} isVencido
 */
export function calcularFluxoCaixa({ de, ate, filtroEntradas, filtroSaidas }, today, isVencido) {
  let parcelas = obterParcelas().slice();
  if (de) parcelas = parcelas.filter((p) => (p.dtPagamento || p.vencimento || '') >= de);
  if (ate) parcelas = parcelas.filter((p) => (p.dtPagamento || p.vencimento || '') <= ate);

  const totalEntradas = parcelas.filter((p) => p.status === 'pago').reduce((s, p) => s + p.valor, 0);
  const totalVencEnt = parcelas.filter((p) => obterStatusParcela(p, isVencido) === 'vencido').reduce((s, p) => s + p.valor, 0);
  const totalAReceber = parcelas.filter((p) => obterStatusParcela(p, isVencido) === 'pendente').reduce((s, p) => s + p.valor, 0);

  let despesas = obterDespesas().slice();
  if (de) despesas = despesas.filter((d) => (d.dataPagamento || d.vencimento || '') >= de);
  if (ate) despesas = despesas.filter((d) => (d.dataPagamento || d.vencimento || '') <= ate);

  const totalSaidas = despesas.filter((d) => d.status === 'pago').reduce((s, d) => s + d.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  let listaEntradas = parcelas.slice().sort((a, b) => (a.vencimento || '').localeCompare(b.vencimento || ''));
  if (filtroEntradas) listaEntradas = listaEntradas.filter((p) => obterStatusParcela(p, isVencido) === filtroEntradas);

  let listaSaidas = despesas.slice().sort((a, b) => (a.vencimento || '').localeCompare(b.vencimento || ''));
  if (filtroSaidas) listaSaidas = listaSaidas.filter((d) => d.status === filtroSaidas);

  return {
    cards: {
      totalEntradas, qtdEntradas: parcelas.filter((p) => p.status === 'pago').length,
      totalSaidas, qtdSaidas: despesas.filter((d) => d.status === 'pago').length,
      saldo,
      totalAReceber: totalAReceber + totalVencEnt,
      totalVencido: totalVencEnt
    },
    grafico: calcularGrafico6Meses(parcelas, despesas),
    listaEntradas: listaEntradas.map((p) => ({ ...p, computedStatus: obterStatusParcela(p, isVencido) })),
    listaSaidas
  };
}

/**
 * Agrega entradas/saídas pagas dos últimos N meses, para o gráfico de
 * barras (extraído de gerarRelatorio original, linhas 14934-14943).
 */
function calcularGrafico6Meses(parcelas, despesas) {
  const hoje = new Date();
  const meses = [];
  for (let i = JANELA_GRAFICO_MESES - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push({ ano: d.getFullYear(), mes: d.getMonth() });
  }
  return meses.map((m) => {
    const prefix = m.ano + '-' + String(m.mes + 1).padStart(2, '0');
    const ent = parcelas.filter((p) => p.status === 'pago' && (p.dtPagamento || p.vencimento || '').startsWith(prefix)).reduce((s, p) => s + p.valor, 0);
    const sai = despesas.filter((d) => d.status === 'pago' && (d.dataPagamento || d.vencimento || '').startsWith(prefix)).reduce((s, d) => s + d.valor, 0);
    return { ...m, ent, sai, isMesAtual: m.ano === hoje.getFullYear() && m.mes === hoje.getMonth() };
  });
}

// ==================== INADIMPLÊNCIA ====================

/**
 * Calcula tudo que a aba "Inadimplência" precisa (extraído de
 * renderInadimplencia original, linhas 9650-9682 — só cálculo).
 * @param {number} filtroDias 0 = sem filtro, 1/15/30/60 = faixas
 * @param {(dataISO: string) => string} today @param {(d1: string, d2: string) => number} diffDays
 * @param {Array} clientes referência para calcular % da base de clientes
 */
export function calcularInadimplencia(filtroDias, today, diffDays, clientes) {
  const hoje = today();
  const todasVencidas = obterParcelas().filter((p) => p.status !== 'pago' && p.vencimento < hoje);

  const totalInad = todasVencidas.reduce((s, p) => s + p.valor, 0);
  const diasAtraso = todasVencidas.map((p) => diffDays(p.vencimento, hoje));
  const mediaDias = diasAtraso.length ? Math.round(diasAtraso.reduce((s, d) => s + d, 0) / diasAtraso.length) : 0;
  const graves = todasVencidas.filter((p) => diffDays(p.vencimento, hoje) > LIMITE_DIAS_INADIMPLENCIA_GRAVE).length;
  const clientesInad = [...new Set(todasVencidas.map((p) => p.clienteId))];

  let vencidas = todasVencidas;
  if (filtroDias === 1) vencidas = vencidas.filter((p) => { const d = diffDays(p.vencimento, hoje); return d >= 1 && d <= 15; });
  if (filtroDias === 15) vencidas = vencidas.filter((p) => { const d = diffDays(p.vencimento, hoje); return d > 15 && d <= 30; });
  if (filtroDias === 30) vencidas = vencidas.filter((p) => diffDays(p.vencimento, hoje) > 30);
  if (filtroDias === 60) vencidas = vencidas.filter((p) => diffDays(p.vencimento, hoje) > 60);
  vencidas = vencidas.slice().sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  return {
    cards: {
      qtdClientes: clientesInad.length,
      pctClientes: clientes.length ? Math.round((clientesInad.length / clientes.length) * 100) : null,
      total: totalInad,
      qtdParcelas: todasVencidas.length,
      mediaDias,
      graves
    },
    listaFiltrada: vencidas
  };
}

// ==================== EXPORTAÇÃO CSV ====================

/**
 * Monta o CSV de todas as parcelas (extraído de exportarCSV original,
 * linhas 15061-15066). Retorna as linhas prontas — quem dispara o
 * download (criar link, clicar) é o controller.
 */
export function montarCsvFluxoCaixa(clientes, processos, isVencido) {
  const rows = [['Data Venc', 'Data Pgto', 'Cliente', 'Processo', 'Parcela', 'Valor', 'Status']];
  obterParcelas().forEach((p) => {
    const c = clientes.find((c) => c.id === p.clienteId) || { nome: '—' };
    const pr = processos.find((pr) => pr.id === p.processoId) || { numero: '—' };
    rows.push([p.vencimento, p.dtPagamento || '', c.nome, pr.numero, `${p.num}/${p.total}`, p.valor.toFixed(2), obterStatusParcela(p, isVencido)]);
  });
  return rows;
}

/**
 * Monta o CSV de parcelas em atraso (extraído de exportarInadimplencia
 * original, linhas 9707-9715).
 * @returns {{rows: string[], vazio: boolean}}
 */
export function montarCsvInadimplencia(today, diffDays, fmtDate, clientes, processos) {
  const hoje = today();
  const vencidas = obterParcelas().filter((p) => p.status !== 'pago' && p.vencimento < hoje);
  if (!vencidas.length) return { rows: [], vazio: true };
  const rows = vencidas.map((p) => {
    const c = clientes.find((c) => c.id === p.clienteId) || { nome: '—' };
    const pr = processos.find((pr) => pr.id === p.processoId) || { numero: '—' };
    const dias = diffDays(p.vencimento, hoje);
    return [c.nome, pr.numero, p.num + '/' + p.total, fmtDate(p.vencimento), dias + 'd', p.valor.toFixed(2)].join(';');
  });
  return { rows, vazio: false };
}
