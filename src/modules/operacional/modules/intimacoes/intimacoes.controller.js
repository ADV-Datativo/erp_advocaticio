// modules/intimacoes/intimacoes.controller.js
// Única camada que lê o DOM e dispara efeito de UI.
//
// Acoplamento com 3 domínios não migrados, preservado via dependência
// injetada (não absorvido nem removido):
//   - Processos: verDetalhe(procId) — recarrega a tela de detalhe após qualquer ação
//   - Agenda: eventoDoBanco(row) — converte o evento criado pela RPC
//   - Dashboard: updateDashboard(), renderAlertaFatais() é exposta por
//     este módulo, mas quem decide QUANDO chamar continua sendo o
//     monólito (Dashboard)

import * as service from './intimacoes.service.js';
import * as state from './intimacoes.state.js';
import { ValidationError } from './intimacoes.validation.js';
import { RepositoryError } from './intimacoes.repository.js';
import { renderizarListaIntimacoes } from './components/lista-intimacoes.js';
import { renderizarAlertaFatais, estiloAvisoPrazo } from './components/alerta-fatais.js';

export function criarControllerIntimacoes(deps) {
  const {
    showToast, registrarAuditoria, today, fmtDate, openModal, closeModal,
    verDetalhe, eventoDoBanco, updateDashboard
  } = deps;

  function onGetIntimacoes(procId) {
    return state.listarPorProcesso(procId);
  }

  function onRenderIntimacoesHTML(procId) {
    return renderizarListaIntimacoes(state.listarPorProcesso(procId), today, fmtDate);
  }

  function onAbrirNovaIntimacao(procId) {
    document.getElementById('intim-proc-id').value = procId;
    document.getElementById('intim-tipo').value = '';
    document.getElementById('intim-descricao').value = '';
    document.getElementById('intim-data').value = today();
    document.getElementById('intim-prazo-final').value = '';
    document.getElementById('intim-aviso').style.display = 'none';
    document.getElementById('intim-dias-bloco').style.display = 'none';
    openModal('modal-intimacao', false);
  }

  function onIntimacaoCalcPrazo() {
    const tipo = document.getElementById('intim-tipo').value;
    const data = document.getElementById('intim-data').value;
    const diasBloco = document.getElementById('intim-dias-bloco');
    const diasInput = parseInt(document.getElementById('intim-dias').value) || 0;
    if (diasBloco) diasBloco.style.display = tipo === 'personalizado' ? 'block' : 'none';

    const prazoFinal = service.calcularPrazoFinal({ tipo, data, diasPersonalizados: diasInput });
    if (!prazoFinal) return;
    document.getElementById('intim-prazo-final').value = prazoFinal;

    const avisoEl = document.getElementById('intim-aviso');
    if (!avisoEl) return;
    const aviso = service.calcularAvisoPrazo(prazoFinal);
    const estilo = estiloAvisoPrazo(aviso);
    avisoEl.textContent = aviso.mensagem;
    if (estilo.display === 'none') {
      avisoEl.style.display = 'none';
    } else {
      avisoEl.style.cssText = `display:block;padding:8px 12px;border-radius:var(--radius);font-size:12.5px;font-weight:500;background:${estilo.background};color:${estilo.color}`;
    }
  }

  function lerFormularioIntimacao() {
    return {
      procId: document.getElementById('intim-proc-id').value,
      tipo: document.getElementById('intim-tipo').value,
      data: document.getElementById('intim-data').value,
      prazoFinal: document.getElementById('intim-prazo-final').value,
      descricao: document.getElementById('intim-descricao').value.trim(),
      criarEvento: document.getElementById('intim-criar-evento').value,
      fatal: document.getElementById('intim-fatal').value === 'sim'
    };
  }

  async function onSalvarIntimacao() {
    const form = lerFormularioIntimacao();
    const editId = document.getElementById('intim-proc-id').dataset.editId;

    try {
      const { intimacao, eventoRow, foiEdicao } = await service.salvarIntimacao(form, editId || null);

      if (foiEdicao) {
        delete document.getElementById('intim-proc-id').dataset.editId;
        closeModal('modal-intimacao');
        showToast('📨 Intimação atualizada!', 'success');
        updateDashboard();
        setTimeout(() => verDetalhe(form.procId), 150);
        return;
      }

      if (eventoRow) {
        state.listarEventos().push(eventoDoBanco(eventoRow));
      }

      registrarAuditoria('criou', 'processo', 'Intimação' + (form.fatal ? ' FATAL' : '') + ' registrada', 'Prazo: ' + fmtDate(form.prazoFinal));
      closeModal('modal-intimacao');
      showToast('📨 Intimação registrada' + (form.criarEvento === 'sim' ? ' e prazo criado na agenda!' : '!') + (form.fatal ? ' ⚠️ Marcada como FATAL!' : ''), 'success');
      updateDashboard();
      setTimeout(() => verDetalhe(form.procId), 150);
    } catch (err) {
      if (err instanceof ValidationError || err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  function onGetPrazosFatais() {
    return service.getPrazosFatais(today);
  }

  function onRenderAlertaFatais() {
    const fatais = onGetPrazosFatais();
    const bloco = document.getElementById('dash-alerta-fatal');
    const lista = document.getElementById('dash-fatal-lista');
    const sub = document.getElementById('dash-fatal-sub');
    if (!bloco || !lista) return;
    if (!fatais.length) { bloco.style.display = 'none'; return; }
    bloco.style.display = 'block';
    const vencidos = fatais.filter((f) => f.dias < 0).length;
    const hojeCount = fatais.filter((f) => f.dias === 0).length;
    if (sub) sub.textContent = `${fatais.length} prazo(s) fatal(is) crítico(s)${vencidos ? ' · ' + vencidos + ' já vencido(s)' : ''}${hojeCount ? ' · ' + hojeCount + ' vence hoje' : ''}`;
    lista.innerHTML = renderizarAlertaFatais(fatais, fmtDate);
  }

  function onEditarIntimacao(procId, intimId) {
    const i = state.listarPorProcesso(procId).find((i) => i.id === intimId);
    if (!i) return;
    document.getElementById('intim-proc-id').value = procId;
    document.getElementById('intim-tipo').value = i.tipo || '';
    document.getElementById('intim-descricao').value = i.descricao || '';
    document.getElementById('intim-data').value = i.data || '';
    document.getElementById('intim-prazo-final').value = i.prazoFinal || '';
    document.getElementById('intim-fatal').value = i.fatal ? 'sim' : 'nao';
    document.getElementById('intim-criar-evento').value = 'nao';
    document.getElementById('intim-dias-bloco').style.display = i.tipo === 'personalizado' ? 'block' : 'none';
    document.getElementById('intim-proc-id').dataset.editId = intimId;
    closeModal('modal-detalhe');
    openModal('modal-intimacao', false);
  }

  async function onExcluirIntimacao(procId, intimId) {
    if (!confirm('Excluir esta intimação?')) return;
    const ok = await service.excluirIntimacao(procId, intimId);
    if (!ok) return;
    updateDashboard();
    showToast('Intimação excluída.', 'success');
    setTimeout(() => verDetalhe(procId), 150);
  }

  async function onMarcarIntimacaoCumprida(procId, intimId) {
    const salva = await service.marcarCumprida(procId, intimId, today);
    if (!salva) return;
    updateDashboard();
    showToast('✅ Prazo marcado como cumprido!', 'success');
    setTimeout(() => verDetalhe(procId), 150);
  }

  return {
    onGetIntimacoes,
    onRenderIntimacoesHTML,
    onAbrirNovaIntimacao,
    onIntimacaoCalcPrazo,
    onSalvarIntimacao,
    onGetPrazosFatais,
    onRenderAlertaFatais,
    onEditarIntimacao,
    onExcluirIntimacao,
    onMarcarIntimacaoCumprida
  };
}
