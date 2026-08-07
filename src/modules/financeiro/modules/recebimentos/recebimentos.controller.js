// modules/recebimentos/recebimentos.controller.js
// Única camada deste submódulo autorizada a ler o DOM e disparar efeitos
// de UI (toast, modal, print, abrir janela). Nunca contém regra de
// negócio, nunca fala com o Supabase.

import * as service from './recebimentos.service.js';
import * as state from './recebimentos.state.js';
import { ValidationError } from './recebimentos.validation.js';
import { RepositoryError } from './recebimentos.repository.js';
import { TIPO_AJUSTE_LABEL } from './recebimentos.constants.js';
import { renderizarTabelaParcelas } from './components/tabela-parcelas.js';
import { renderizarOpcoesParcelaPendente } from './components/select-parcela-pagar.js';
import { montarHtmlRecibo } from './components/recibo-html.js';

/**
 * @param {object} deps dependências que ainda vivem no monólito.
 */
export function criarControllerRecebimentos(deps) {
  const {
    showToast, registrarAuditoria, fmtMoney, fmtDate, today, isVencido,
    closeModal, openModal, getConfigWpp, wppMsgPadrao, wppMsgReciboPadrao,
    getDadosEscritorio, getNomeEscritorio, getLogoInlineHtml,
    notifPagamentoConfirmado, updateDashboard, diffDays
  } = deps;

  function renderizarTabela(termoBusca = '') {
    const filtroStatus = (document.getElementById('filter-status-parcela') || {}).value || '';
    const lista = service.filtrarEOrdenarParcelas(
      state.listarParcelas(),
      { filtroStatus, termoBusca },
      state.listarClientes(),
      state.listarProcessos(),
      isVencido
    );
    const tb = document.getElementById('tbody-parcelas');
    if (tb) tb.innerHTML = renderizarTabelaParcelas(lista, state.listarClientes(), state.listarProcessos(), fmtDate, fmtMoney);
  }

  function onRenderParcelas(termoBusca = '') {
    renderizarTabela(termoBusca);
  }

  function onRenderFinVisao() {
    const resumo = service.calcularResumoFinanceiro(state.listarParcelas(), isVencido);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('fin-total-recebido', fmtMoney(resumo.totalRecebido));
    set('fin-total-vencido', fmtMoney(resumo.totalVencido));
    set('fin-total-areceber', fmtMoney(resumo.totalAReceber));
    set('fin-total-contratado', fmtMoney(resumo.totalContratado));
    renderizarBlocoVencidos(resumo.vencidos);
    renderizarBlocoProximos(resumo.aReceber);
  }

  function renderizarBlocoVencidos(vencidos) {
    const vl = document.getElementById('vencidas-list');
    if (!vl) return;
    if (!vencidos.length) {
      vl.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0">Sem parcelas vencidas.</div>';
      return;
    }
    vl.innerHTML = vencidos.slice(0, 6).map((p) => {
      const proc = state.listarProcessos().find((pr) => pr.id === p.processoId) || { numero: '—' };
      const c = state.listarClientes().find((c) => c.id === p.clienteId) || { nome: '—' };
      const dias = diffDays(today(), p.vencimento);
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
        <div><strong>${c.nome}</strong><br><span style="color:var(--text-muted)">${proc.numero} — Parc. ${p.num}/${p.total}</span></div>
        <div style="text-align:right"><div style="color:var(--danger);font-weight:600">${fmtMoney(p.valor)}</div><div style="font-size:11px;color:var(--danger)">${dias}d atrasado</div></div>
      </div>`;
    }).join('');
  }

  function renderizarBlocoProximos(aReceber) {
    const pl = document.getElementById('proximos-list');
    if (!pl) return;
    const d30 = new Date(); d30.setDate(d30.getDate() + 30);
    const prox = aReceber.filter((p) => new Date(p.vencimento) <= d30).sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    if (!prox.length) {
      pl.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0">Sem vencimentos próximos.</div>';
      return;
    }
    pl.innerHTML = prox.slice(0, 6).map((p) => {
      const proc = state.listarProcessos().find((pr) => pr.id === p.processoId) || { numero: '—' };
      const c = state.listarClientes().find((c) => c.id === p.clienteId) || { nome: '—' };
      const dias = diffDays(p.vencimento, today());
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
        <div><strong>${c.nome}</strong><br><span style="color:var(--text-muted)">${proc.numero} — Parc. ${p.num}/${p.total}</span></div>
        <div style="text-align:right"><div style="color:var(--blue-600);font-weight:600">${fmtMoney(p.valor)}</div><div style="font-size:11px;color:var(--text-muted)">${fmtDate(p.vencimento)} (${dias}d)</div></div>
      </div>`;
    }).join('');
  }

  function onUpdateParcelasSelect() {
    const sel = document.getElementById('select-parcela-pagar');
    if (!sel) return;
    const pendentes = service.listarParcelasPendentesOrdenadas(state.listarParcelas(), isVencido);
    sel.innerHTML = renderizarOpcoesParcelaPendente(pendentes, state.listarClientes(), state.listarProcessos(), fmtDate, fmtMoney);
    document.getElementById('data-pagamento').value = today();
  }

  async function onConfirmarPagamento() {
    const id = document.getElementById('select-parcela-pagar').value;
    const dt = document.getElementById('data-pagamento').value;
    const obs = document.getElementById('obs-pagamento').value.trim();
    try {
      const p = await service.confirmarPagamento(id, { dataPagamento: dt, obs });
      notifPagamentoConfirmado(p.id);
      onUpdateParcelasSelect();
      onRenderFinVisao();
      registrarAuditoria('pagou', 'financeiro', 'Pagamento confirmado: parcela ' + p.num + '/' + p.total, 'Valor: ' + fmtMoney(p.valor));
      showToast('Pagamento confirmado!', 'success');
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      if (err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  async function onMarcarPago(id) {
    try {
      const p = await service.confirmarPagamento(id, { dataPagamento: today(), obs: null });
      onRenderParcelas();
      onRenderFinVisao();
      updateDashboard();
      showToast('Parcela marcada como paga!', 'success');
    } catch (err) {
      if (err instanceof RepositoryError || err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  function onAbrirReagendar(id) {
    const p = state.listarParcelas().find((p) => p.id === id);
    if (!p) return;
    const c = state.listarClientes().find((c) => c.id === p.clienteId) || { nome: '—' };
    const pr = state.listarProcessos().find((pr) => pr.id === p.processoId) || { numero: '—' };
    document.getElementById('reagendar-id').value = id;
    document.getElementById('reagendar-nova-data').value = p.vencimento || '';
    document.getElementById('reagendar-motivo').value = '';
    document.getElementById('reagendar-info').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div style="font-size:11px;color:var(--text-muted)">Cliente</div><strong>${c.nome}</strong></div>
        <div><div style="font-size:11px;color:var(--text-muted)">Processo</div><strong style="color:var(--blue-600)">${pr.numero}</strong></div>
        <div><div style="font-size:11px;color:var(--text-muted)">Parcela</div><strong>${p.num}/${p.total}</strong></div>
        <div><div style="font-size:11px;color:var(--text-muted)">Vencimento atual</div><strong style="color:var(--warning)">${fmtDate(p.vencimento)}</strong></div>
        <div><div style="font-size:11px;color:var(--text-muted)">Valor</div><strong>${fmtMoney(p.valor)}</strong></div>
      </div>`;
    openModal('modal-reagendar', false);
  }

  async function onConfirmarReagendar() {
    const id = document.getElementById('reagendar-id').value;
    const novaData = document.getElementById('reagendar-nova-data').value;
    const motivo = document.getElementById('reagendar-motivo').value.trim();
    const p = state.listarParcelas().find((p) => p.id === id);
    if (!p) return;
    const dataAntiga = p.vencimento;
    try {
      await service.reagendarParcela(id, { novaData, motivo, obsAtual: p.obs, vencimentoAtual: dataAntiga, fmtDate });
      closeModal('modal-reagendar');
      onRenderParcelas();
      onRenderFinVisao();
      registrarAuditoria('editou', 'financeiro', 'Parcela reagendada: ' + fmtDate(dataAntiga) + ' → ' + fmtDate(novaData), motivo || '');
      showToast('📅 Parcela reagendada para ' + fmtDate(novaData) + '!', 'success');
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      if (err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  function onAbrirDescontoAcrescimo(id) {
    const p = state.listarParcelas().find((p) => p.id === id);
    if (!p) return;
    const c = state.listarClientes().find((c) => c.id === p.clienteId) || { nome: '—' };
    const pr = state.listarProcessos().find((pr) => pr.id === p.processoId) || { numero: '—' };
    document.getElementById('da-parcela-id').value = id;
    document.getElementById('da-tipo').value = 'desconto';
    document.getElementById('da-modalidade').value = 'percentual';
    document.getElementById('da-valor-input').value = '';
    document.getElementById('da-novo-valor').value = fmtMoney(p.valor);
    document.getElementById('da-obs').value = '';
    document.getElementById('da-valor-label').textContent = 'Percentual (%)';
    document.getElementById('da-info').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><div style="font-size:11px;color:var(--text-muted)">Cliente</div><strong>${c.nome}</strong></div>
        <div><div style="font-size:11px;color:var(--text-muted)">Processo</div><strong style="color:var(--blue-600)">${pr.numero}</strong></div>
        <div><div style="font-size:11px;color:var(--text-muted)">Parcela</div><strong>${p.num}/${p.total}</strong></div>
        <div><div style="font-size:11px;color:var(--text-muted)">Valor original</div><strong>${fmtMoney(p.valor)}</strong></div>
      </div>`;
    openModal('modal-desconto-acrescimo', false);
  }

  function onCalcularDA() {
    const id = document.getElementById('da-parcela-id').value;
    const p = state.listarParcelas().find((p) => p.id === id);
    if (!p) return;
    const tipo = document.getElementById('da-tipo').value;
    const modalidade = document.getElementById('da-modalidade').value;
    const input = parseFloat(document.getElementById('da-valor-input').value) || 0;
    const labelEl = document.getElementById('da-valor-label');
    if (labelEl) labelEl.textContent = modalidade === 'percentual' ? 'Percentual (%)' : 'Valor fixo (R$)';
    const novoValor = service.calcularNovoValor(p.valor, { tipo, modalidade, input });
    const el = document.getElementById('da-novo-valor');
    if (el) {
      el.value = fmtMoney(novoValor);
      el.style.color = tipo === 'desconto' ? 'var(--success)' : 'var(--danger)';
    }
  }

  async function onConfirmarDA() {
    const id = document.getElementById('da-parcela-id').value;
    const p = state.listarParcelas().find((p) => p.id === id);
    if (!p) return;
    const tipo = document.getElementById('da-tipo').value;
    const modalidade = document.getElementById('da-modalidade').value;
    const input = parseFloat(document.getElementById('da-valor-input').value) || 0;
    const obs = document.getElementById('da-obs').value.trim();
    const tipoLabel = TIPO_AJUSTE_LABEL[tipo] || tipo;
    try {
      const { descricao, valorOriginal, parcela } = await service.aplicarAjusteValor(
        id, { tipo, modalidade, input, obs, tipoLabel }, p.obs, p.valor
      );
      closeModal('modal-desconto-acrescimo');
      onRenderParcelas();
      onRenderFinVisao();
      registrarAuditoria('editou', 'financeiro', descricao + ' aplicado na parcela ' + p.num + '/' + p.total, 'De ' + fmtMoney(valorOriginal) + ' para ' + fmtMoney(parcela.valor));
      showToast('💱 ' + descricao + ' aplicado! Novo valor: ' + fmtMoney(parcela.valor), 'success');
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      if (err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  async function onGerarParcelasManual() {
    const processoId = document.getElementById('gp-processo').value;
    const valor = parseFloat(document.getElementById('gp-valor').value) || 0;
    const nParcelas = parseInt(document.getElementById('gp-nparc').value) || 1;
    const data1 = document.getElementById('gp-data1').value;
    const proc = state.listarProcessos().find((p) => p.id === processoId);
    if (!proc) { showToast('Processo não encontrado.', 'error'); return; }

    try {
      const salvas = await service.gerarParcelasParaProcesso({
        processoId, clienteId: proc.clienteId, valor, nParcelas, data1
      });
      closeModal('modal-gerar-parcelas');
      onRenderParcelas();
      onRenderFinVisao();
      onUpdateParcelasSelect();
      registrarAuditoria('criou', 'financeiro', 'Parcelas geradas: ' + proc.numero, nParcelas + 'x de ' + fmtMoney(salvas[0]?.valor || 0));
      showToast('✅ ' + nParcelas + ' parcela(s) gerada(s)!', 'success');
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      if (err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  function onGerarReciboPagamento(parcelaId) {
    const dados = service.montarDadosRecibo(parcelaId, {
      escritorio: getDadosEscritorio(),
      nomeEscritorio: getNomeEscritorio(),
      hoje: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    });
    if (!dados) return;
    const html = montarHtmlRecibo(dados, fmtMoney, fmtDate, getLogoInlineHtml);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
    registrarAuditoria('exportou', 'financeiro', 'Recibo gerado: ' + dados.processo.numero + ' parc.' + dados.parcela.num, 'Valor: ' + fmtMoney(dados.parcela.valor));
  }

  function onMontarMensagemRecibo(clienteId, parcelaId) {
    return service.montarMensagemRecibo(clienteId, parcelaId, getConfigWpp(), wppMsgReciboPadrao, fmtDate, fmtMoney, today, getNomeEscritorio());
  }

  function onAbrirModalWppRecibo(clienteId, parcelaId) {
    const { msg, tel } = onMontarMensagemRecibo(clienteId, parcelaId);
    preencherModalWpp(clienteId, parcelaId, msg, tel);
  }

  function onMontarMensagemWpp(clienteId, parcelaId) {
    return service.montarMensagemWpp(clienteId, parcelaId, getConfigWpp(), wppMsgPadrao, fmtDate, fmtMoney, getNomeEscritorio());
  }

  function onAbrirModalWpp(clienteId, parcelaId) {
    const { msg, tel } = onMontarMensagemWpp(clienteId, parcelaId);
    preencherModalWpp(clienteId, parcelaId, msg, tel);
  }

  function preencherModalWpp(clienteId, parcelaId, msg, tel) {
    document.getElementById('wpp-send-clienteId').value = clienteId || '';
    document.getElementById('wpp-send-parcelaId').value = parcelaId || '';
    document.getElementById('wpp-send-msg').value = msg;
    const telNum = tel.replace(/\D/g, '');
    document.getElementById('wpp-send-numero').value = telNum.startsWith('55') ? telNum : (telNum ? '55' + telNum : '');
    openModal('modal-whatsapp', false);
  }

  return {
    onRenderParcelas,
    onRenderFinVisao,
    onUpdateParcelasSelect,
    onConfirmarPagamento,
    onMarcarPago,
    onAbrirReagendar,
    onConfirmarReagendar,
    onAbrirDescontoAcrescimo,
    onCalcularDA,
    onConfirmarDA,
    onGerarParcelasManual,
    onGerarReciboPagamento,
    onMontarMensagemRecibo,
    onAbrirModalWppRecibo,
    onMontarMensagemWpp,
    onAbrirModalWpp
  };
}
