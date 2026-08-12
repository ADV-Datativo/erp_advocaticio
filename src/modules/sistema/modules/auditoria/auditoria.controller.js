// modules/auditoria/auditoria.controller.js
// Única camada que lê o DOM e dispara efeito de UI.

import * as service from './auditoria.service.js';
import { obterCache } from './auditoria.state.js';
import { renderizarTabelaAuditoria } from './components/tabela-auditoria.js';

export function criarControllerAuditoria(deps) {
  const { showToast, today } = deps;

  async function onRenderAuditoria() {
    const logs = await service.carregarSeNecessario();
    const filtroTipo = document.getElementById('audit-filtro-tipo')?.value || '';
    const filtroAcao = document.getElementById('audit-filtro-acao')?.value || '';
    const filtroDe = document.getElementById('audit-filtro-de')?.value || '';
    const filtroAte = document.getElementById('audit-filtro-ate')?.value || '';

    const lista = service.filtrarLogs(logs, { tipo: filtroTipo, acao: filtroAcao, de: filtroDe, ate: filtroAte });

    const tb = document.getElementById('tbody-auditoria');
    const contador = document.getElementById('audit-contador');
    if (!tb) return;
    if (contador) contador.textContent = lista.length + ' registro(s)';
    tb.innerHTML = renderizarTabelaAuditoria(lista);
  }

  /**
   * Exporta o cache atual — igual ao comportamento original, que também
   * dependia de `_auditoriaCache` já estar preenchido por uma chamada
   * anterior a `onRenderAuditoria()` (o botão de exportar só fica
   * disponível depois que a tela já carregou pelo menos uma vez).
   */
  function onExportarAuditoria() {
    const { linhas, vazio } = service.montarCsv(obterCache() || []);
    if (vazio) { showToast('Sem registros para exportar.', 'error'); return; }
    const csv = linhas.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'auditoria_dvn_' + today() + '.csv';
    a.click();
    showToast('Auditoria exportada!', 'success');
  }

  async function onAtualizarBadgeAuditoria() {
    const logs = await service.carregarSeNecessario();
    const btn = document.querySelector('[onclick*="auditoria"]');
    if (btn && logs.length > 0) {
      btn.innerHTML = '🔍 Auditoria <span style="background:var(--blue-600);color:white;border-radius:8px;padding:0 6px;font-size:10px;margin-left:4px">' + logs.length + '</span>';
    }
  }

  return { onRenderAuditoria, onExportarAuditoria, onAtualizarBadgeAuditoria };
}
