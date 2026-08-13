// modules/processos/processos.controller.js
// Única camada que lê o DOM e escreve nele.

import * as service from './processos.service.js';
import * as state from './processos.state.js';
import { ValidationError } from './processos.validation.js';
import { RepositoryError } from './processos.repository.js';
import { renderizarTabelaProcessos } from './components/tabela-processos.js';

export function criarControllerProcessos(deps) {
  const {
    showToast, registrarAuditoria, today, addMonths, fmtDate, fmtMoney,
    criarAndamentoNoBanco, saveData, updateDashboard, closeModal, editarCliente,
    renderTagsBadgesHTML, renderTagsProcessoModal, getProcTabFilter
  } = deps;

  // ---------- Formulário ----------

  function onResetFormProcesso() {
    document.getElementById('processo-edit-id').value = '';
    document.getElementById('modal-processo-title').textContent = 'Novo Processo';
    ['proc-numero', 'proc-adv', 'proc-vara', 'proc-descricao', 'proc-lembrete-data', 'proc-lembrete-hora', 'proc-lembrete-msg'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('proc-abertura').value = today();
    document.getElementById('proc-status').value = 'andamento';
    onToggleResultadoProc();
    onSetLembreteAtivo(false);
    onPopulateClientesSelect();
    onPopulateTiposProcSelect();
    renderTagsProcessoModal();
  }

  function onSetLembreteAtivo(ativo) {
    const btn = document.getElementById('btn-toggle-lembrete');
    const knob = document.getElementById('toggle-knob');
    const fields = document.getElementById('lembrete-fields');
    btn.dataset.ativo = ativo ? '1' : '0';
    btn.style.background = ativo ? 'var(--blue-600)' : 'var(--border)';
    knob.style.left = ativo ? '23px' : '3px';
    fields.style.display = ativo ? 'block' : 'none';
  }

  function onToggleLembrete() {
    const atual = document.getElementById('btn-toggle-lembrete').dataset.ativo === '1';
    onSetLembreteAtivo(!atual);
  }

  function onPopulateClientesSelect() {
    const sel = document.getElementById('proc-cliente');
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Selecionar Cliente —</option>';
    state.listarClientesAtivos().forEach((c) => { sel.innerHTML += `<option value="${c.id}">${c.nome}</option>`; });
    sel.value = cur;
  }

  function onPopulateTiposProcSelect() {
    const sel = document.getElementById('proc-tipo');
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Selecionar Tipo —</option>';
    state.listarTipos().forEach((t) => { sel.innerHTML += `<option value="${t.id}">${t.nome} (${t.area})</option>`; });
    sel.value = cur;
  }

  // Sem valor/parcelas padrão por tipo modelado no banco (vem do cliente,
  // não do tipo) — mantida como no-op, mesmo comportamento original, só
  // pra não quebrar quem já chama (onchange do select).
  function onPreencherValorPorTipo() {}

  function onPreencherTipoPorCliente() {
    const cId = document.getElementById('proc-cliente').value;
    const c = state.buscarCliente(cId);
    if (c && c.tipoProcessoId) {
      document.getElementById('proc-tipo').value = c.tipoProcessoId;
      onPreencherValorPorTipo();
    }
  }

  function onToggleResultadoProc() {
    const status = document.getElementById('proc-status')?.value;
    const bloco = document.getElementById('bloco-resultado');
    if (bloco) bloco.style.display = status === 'encerrado' ? 'block' : 'none';
  }

  function onMostrarPreviewFinanceiroCliente() {
    const cId = document.getElementById('proc-cliente').value;
    const el = document.getElementById('proc-preview-financeiro');
    if (!el) return;
    if (!cId) { el.style.display = 'none'; return; }
    const cli = state.buscarCliente(cId);
    const preview = service.calcularPreviewFinanceiro(cli);
    if (!preview.visivel) { el.style.display = 'none'; return; }

    el.style.display = 'block';
    if (preview.temCondicoes) {
      const dt1 = preview.primeiraData ? fmtDate(preview.primeiraData) : '—';
      el.style.background = '#E2F5EC'; el.style.border = '1px solid #6EE7B7'; el.style.color = '#065F46';
      el.innerHTML = `✅ <strong>Condições financeiras encontradas:</strong> ${fmtMoney(preview.valor)} em ${preview.nParcelas}x de ${fmtMoney(preview.valorParcela)} · 1ª parcela: ${dt1}<br>
        <span style="font-size:11.5px;opacity:0.85">As parcelas serão geradas automaticamente ao salvar.</span>`;
    } else {
      el.style.background = '#FEF3C7'; el.style.border = '1px solid #FCD34D'; el.style.color = '#92400E';
      el.innerHTML = `⚠️ <strong>Este cliente não tem condições financeiras cadastradas.</strong><br>
        <span style="font-size:11.5px">O processo será criado sem parcelas. <a href="#" onclick="closeModal('modal-processo');setTimeout(()=>editarCliente('${cId}'),200);return false;" style="color:#92400E;font-weight:600;text-decoration:underline">Clique aqui para cadastrar antes →</a></span>`;
    }
  }

  function onAtualizarPreviewParcelasProcesso() { onMostrarPreviewFinanceiroCliente(); }

  async function onSalvarProcesso() {
    const num = document.getElementById('proc-numero').value.trim();
    const cId = document.getElementById('proc-cliente').value;
    const tId = document.getElementById('proc-tipo').value;
    const editId = document.getElementById('processo-edit-id').value;
    const statusProc = document.getElementById('proc-status').value;

    const form = {
      numero: num, clienteId: cId, tipoId: tId,
      adv: document.getElementById('proc-adv').value.trim(),
      abertura: document.getElementById('proc-abertura').value,
      status: statusProc,
      vara: document.getElementById('proc-vara').value.trim(),
      descricao: document.getElementById('proc-descricao').value.trim(),
      resultado: statusProc === 'encerrado' ? (document.getElementById('proc-resultado').value || '') : '',
      dataEncerramento: statusProc === 'encerrado' ? (document.getElementById('proc-data-enc').value || today()) : ''
    };

    const btn = document.querySelector('#modal-processo .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
      const { foiEdicao, parcelasGeradas } = await service.salvarProcesso(form, editId || null, {
        criarAndamentoNoBanco, today, addMonths, registrarAuditoria
      });

      if (foiEdicao) {
        showToast('Processo atualizado!', 'success');
      } else if (parcelasGeradas > 0) {
        showToast('Processo criado com ' + parcelasGeradas + ' parcela(s)!', 'success');
      } else {
        showToast('Processo criado! Configure as condições financeiras no cadastro do cliente para gerar parcelas.', 'success');
      }

      saveData();
      closeModal('modal-processo');
      onRenderProcessos();
      updateDashboard();
    } catch (err) {
      if (err instanceof ValidationError || err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = editId ? 'Salvar Alterações' : 'Cadastrar Processo'; }
    }
  }

  // ---------- Listagem ----------

  function onRenderProcessos() {
    const q = (document.getElementById('search-processos') || {}).value || '';
    const lista = service.filtrarProcessos(getProcTabFilter(), q);
    const tb = document.getElementById('tbody-processos');
    if (!tb) return;
    tb.innerHTML = renderizarTabelaProcessos(lista, {
      buscarCliente: state.buscarCliente,
      buscarTipo: state.buscarTipo,
      calcularProgresso: service.calcularProgressoFinanceiro,
      qtdDocumentos: state.qtdDocumentosDoProcesso,
      renderTagsBadgesHTML,
      tagsDoProcesso: state.tagsDoProcesso,
      fmtDate, fmtMoney
    });
  }

  async function onExcluirProcesso(id) {
    if (!confirm('Excluir este processo e suas parcelas?')) return;
    const ok = await service.excluirProcesso(id);
    if (!ok) return;
    saveData();
    onRenderProcessos();
    updateDashboard();
    showToast('Processo excluído.');
  }

  return {
    onResetFormProcesso, onSetLembreteAtivo, onToggleLembrete,
    onPopulateClientesSelect, onPopulateTiposProcSelect, onPreencherValorPorTipo,
    onPreencherTipoPorCliente, onToggleResultadoProc,
    onMostrarPreviewFinanceiroCliente, onAtualizarPreviewParcelasProcesso,
    onSalvarProcesso, onRenderProcessos, onExcluirProcesso
  };
}
