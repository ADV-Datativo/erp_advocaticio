// modules/relatorios/relatorios.controller.js
// Única camada deste submódulo autorizada a ler o DOM e disparar efeitos
// de UI (toast, download de arquivo). Nunca contém regra de negócio,
// nunca fala com o Supabase, nunca lê store.parcelas/store.despesas
// diretamente — tudo isso vem do service, que busca via Registry.

import * as service from './relatorios.service.js';
import * as state from './relatorios.state.js';
import { renderizarCardsFluxoCaixa } from './components/cards-fluxo-caixa.js';
import { renderizarGraficoFluxo } from './components/grafico-fluxo.js';
import { renderizarTabelaEntradas, renderizarTabelaSaidas } from './components/tabelas-fluxo-caixa.js';
import { renderizarCardsInadimplencia, renderizarTabelaInadimplencia } from './components/tabela-inadimplencia.js';

/**
 * @param {object} deps dependências que ainda vivem no monólito.
 */
export function criarControllerRelatorios(deps) {
  const { showToast, fmtMoney, fmtDate, today, isVencido, diffDays } = deps;

  // ==================== FLUXO DE CAIXA ====================

  function onGerarRelatorio() {
    const de = document.getElementById('rel-de')?.value || '';
    const ate = document.getElementById('rel-ate')?.value || '';
    const filtroEntradas = document.getElementById('rel-ent-status')?.value || '';
    const filtroSaidas = document.getElementById('rel-said-status')?.value || '';

    const { cards, grafico, listaEntradas, listaSaidas } = service.calcularFluxoCaixa(
      { de, ate, filtroEntradas, filtroSaidas }, today, isVencido
    );

    renderizarCardsFluxoCaixa(cards, fmtMoney);
    renderizarGraficoFluxo(grafico, fmtMoney);
    renderizarTabelaEntradas(listaEntradas, state.listarClientes(), state.listarProcessos(), fmtDate, fmtMoney);
    renderizarTabelaSaidas(listaSaidas, fmtDate, fmtMoney);
  }

  // Os dois nomes globais originais (renderRelEntradas/renderRelSaidas)
  // só chamavam gerarRelatorio() de novo — comportamento preservado.
  function onRenderRelEntradas() { onGerarRelatorio(); }
  function onRenderRelSaidas() { onGerarRelatorio(); }

  function onExportarCSV() {
    const rows = service.montarCsvFluxoCaixa(state.listarClientes(), state.listarProcessos(), isVencido);
    const csv = rows.map((r) => r.join(';')).join('\n');
    baixarCsv(csv, 'fluxo_caixa_lexPro.csv');
    showToast('CSV exportado com sucesso!', 'success');
  }

  // ==================== INADIMPLÊNCIA ====================

  function onRenderInadimplencia() {
    const filtroDias = parseInt(document.getElementById('inad-filtro-dias')?.value) || 0;
    const { cards, listaFiltrada } = service.calcularInadimplencia(filtroDias, today, diffDays, state.listarClientes());
    renderizarCardsInadimplencia(cards, fmtMoney);
    renderizarTabelaInadimplencia(listaFiltrada, state.listarClientes(), state.listarProcessos(), fmtDate, fmtMoney, diffDays, today());
  }

  function onExportarInadimplencia() {
    const { rows, vazio } = service.montarCsvInadimplencia(today, diffDays, fmtDate, state.listarClientes(), state.listarProcessos());
    if (vazio) { showToast('Sem parcelas em atraso.', 'error'); return; }
    const csv = 'Cliente;Processo;Parcela;Vencimento;Dias Atraso;Valor\n' + rows.join('\n');
    baixarCsv(csv, 'inadimplencia_' + today() + '.csv');
    showToast('Exportado!', 'success');
  }

  function baixarCsv(csv, nomeArquivo) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo;
    a.click();
  }

  return {
    onGerarRelatorio,
    onRenderRelEntradas,
    onRenderRelSaidas,
    onExportarCSV,
    onRenderInadimplencia,
    onExportarInadimplencia
  };
}
