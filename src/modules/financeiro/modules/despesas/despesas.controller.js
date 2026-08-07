// modules/despesas/despesas.controller.js
// Única camada deste submódulo autorizada a ler o DOM e disparar efeitos
// de UI. Nunca contém regra de negócio, nunca fala com o Supabase.

import * as service from './despesas.service.js';
import * as state from './despesas.state.js';
import { ValidationError } from './despesas.validation.js';
import { RepositoryError } from './despesas.repository.js';
import { renderizarTabelaDespesas } from './components/tabela-despesas.js';
import { renderizarCardsResumo } from './components/cards-resumo.js';
import { notificarDespesaPaga } from './despesas.events.js';

/**
 * @param {object} deps dependências que ainda vivem no monólito.
 */
export function criarControllerDespesas(deps) {
  const { showToast, registrarAuditoria, fmtMoney, fmtDate, closeModal, openModal, today } = deps;

  function onToggleRecorrencia(valor) {
    const bloco = document.getElementById('bloco-parcelas-desp');
    if (bloco) bloco.style.display = valor !== 'unica' ? 'block' : 'none';
  }

  function renderizarCards() {
    const resumo = service.calcularResumoCards(state.listarDespesas(), today);
    renderizarCardsResumo(resumo, fmtMoney);
  }

  function renderizarTabela() {
    const filtroStatus = document.getElementById('desp-filtro-status')?.value || '';
    const filtroCategoria = document.getElementById('desp-filtro-categoria')?.value || '';
    const filtroMes = document.getElementById('desp-filtro-mes')?.value || '';
    const tb = document.getElementById('tbody-despesas');
    if (!tb) return;
    const lista = service.filtrarEOrdenarDespesas(state.listarDespesas(), {
      status: filtroStatus, categoria: filtroCategoria, mes: filtroMes
    });
    tb.innerHTML = renderizarTabelaDespesas(lista, fmtDate, fmtMoney);
  }

  function onRenderDespesas() {
    service.atualizarStatusVencidas(state.listarDespesas(), today);
    renderizarCards();
    renderizarTabela();
  }

  function lerFormularioDespesa() {
    return {
      descricao: document.getElementById('despesa-descricao').value.trim(),
      categoria: document.getElementById('despesa-categoria').value,
      valor: parseFloat(document.getElementById('despesa-valor').value) || 0,
      vencimento: document.getElementById('despesa-vencimento').value,
      conta: document.getElementById('despesa-conta').value.trim(),
      dataPagamento: document.getElementById('despesa-pagamento').value,
      forma: document.getElementById('despesa-forma').value,
      recorrencia: document.getElementById('despesa-recorrencia').value,
      repeticoes: parseInt(document.getElementById('despesa-repeticoes').value) || 1,
      status: document.getElementById('despesa-status').value,
      obs: document.getElementById('despesa-obs').value.trim()
    };
  }

  async function onSalvarDespesa() {
    const form = lerFormularioDespesa();
    const editId = document.getElementById('despesa-edit-id').value;
    const btn = document.querySelector('#modal-despesa .btn-primary');
    const textoOriginal = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
      const { despesas, criouMultiplas } = await service.salvarDespesa(form, editId || null);
      if (editId) {
        registrarAuditoria('editou', 'despesa', 'Editou despesa: ' + form.descricao, fmtMoney(form.valor));
        showToast('Despesa atualizada!', 'success');
      } else {
        const qtd = despesas.length;
        registrarAuditoria(
          'criou', 'despesa',
          criouMultiplas ? `Criou ${qtd} despesas recorrentes: ${form.descricao}` : 'Cadastrou despesa: ' + form.descricao,
          fmtMoney(form.valor)
        );
        showToast(criouMultiplas ? `${qtd} despesas criadas!` : 'Despesa cadastrada!', 'success');
      }
      closeModal('modal-despesa');
      onRenderDespesas();
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      if (err instanceof RepositoryError) { showToast(err.message + (err.cause ? ': ' + err.cause.message : ''), 'error'); return; }
      throw err;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = textoOriginal; }
    }
  }

  function onEditarDespesa(id) {
    const d = state.listarDespesas().find((d) => d.id === id);
    if (!d) return;
    document.getElementById('despesa-edit-id').value = d.id;
    document.getElementById('modal-despesa-title').textContent = 'Editar Despesa';
    document.getElementById('despesa-descricao').value = d.descricao || '';
    document.getElementById('despesa-categoria').value = d.categoria || '';
    document.getElementById('despesa-conta').value = d.conta || '';
    document.getElementById('despesa-valor').value = d.valor || '';
    document.getElementById('despesa-vencimento').value = d.vencimento || '';
    document.getElementById('despesa-pagamento').value = d.dataPagamento || '';
    document.getElementById('despesa-forma').value = d.forma || '';
    document.getElementById('despesa-recorrencia').value = d.recorrencia || 'unica';
    document.getElementById('despesa-status').value = d.status || 'pendente';
    document.getElementById('despesa-obs').value = d.obs || '';
    onToggleRecorrencia(d.recorrencia || 'unica');
    openModal('modal-despesa', false);
  }

  async function onExcluirDespesa(id) {
    if (!confirm('Excluir esta despesa?')) return;
    const ok = await service.excluirDespesa(id);
    if (!ok) { showToast('Erro ao excluir despesa.', 'error'); return; }
    onRenderDespesas();
    showToast('Despesa excluída.');
  }

  function onAbrirPagarDespesa(id) {
    const d = state.listarDespesas().find((d) => d.id === id);
    if (!d) return;
    document.getElementById('pagar-despesa-id').value = id;
    document.getElementById('pagar-despesa-desc').innerHTML =
      `<strong>${d.descricao}</strong><br><span style="color:var(--danger)">${fmtMoney(d.valor)}</span> · Vence em ${fmtDate(d.vencimento)}`;
    document.getElementById('pagar-despesa-data').value = today();
    openModal('modal-pagar-despesa', false);
  }

  async function onConfirmarPagamentoDespesa() {
    const id = document.getElementById('pagar-despesa-id').value;
    const d = state.listarDespesas().find((d) => d.id === id);
    if (!d) return;
    const dataPagamento = document.getElementById('pagar-despesa-data').value;
    const forma = document.getElementById('pagar-despesa-forma').value;

    try {
      const salvo = await service.confirmarPagamento(id, { dataPagamento, forma });
      if (!salvo) { showToast('Erro ao confirmar pagamento.', 'error'); return; }
      closeModal('modal-pagar-despesa');
      onRenderDespesas();
      notificarDespesaPaga(salvo);
      registrarAuditoria('pagou', 'despesa', 'Pagou despesa: ' + (d.descricao || ''), 'Valor: ' + fmtMoney(d.valor || 0));
      showToast('✅ Pagamento confirmado!', 'success');
    } catch (err) {
      if (err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  return {
    onRenderDespesas,
    onToggleRecorrencia,
    onSalvarDespesa,
    onEditarDespesa,
    onExcluirDespesa,
    onAbrirPagarDespesa,
    onConfirmarPagamentoDespesa
  };
}
