// modules/financeiro/controller.js
// Única camada deste módulo autorizada a ler o DOM (formulários) e a
// disparar efeitos de UI (toast, abrir/fechar modal, re-render). Nunca
// contém regra de negócio nem fala com o Supabase — isso é do service.js
// e do repository.js, respectivamente.
//
// Estas funções substituem, 1 para 1, as funções globais equivalentes que
// hoje vivem soltas no index.html (salvarDespesa, editarDespesa,
// excluirDespesa, abrirPagarDespesa, confirmarPagamentoDespesa). Ver
// index.js deste módulo para o registro delas como globais compatíveis.

import * as service from './service.js';
import { ValidationError } from './validation.js';
import { RepositoryError } from './repository.js';

/**
 * @param {object} deps injeta as dependências que ainda vivem no monólito
 *   (store, showToast, registrarAuditoria, fmtMoney, closeModal, openModal,
 *   renderDespesas, today) — evita import circular enquanto o restante do
 *   sistema não foi migrado.
 */
export function criarControllerDespesas(deps) {
  const { store, showToast, registrarAuditoria, fmtMoney, closeModal, openModal, renderDespesas, today } = deps;

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
        const idx = store.despesas.findIndex((d) => d.id === editId);
        if (idx >= 0) store.despesas[idx] = despesas[0];
        registrarAuditoria('editou', 'despesa', 'Editou despesa: ' + form.descricao, fmtMoney(form.valor));
        showToast('Despesa atualizada!', 'success');
      } else {
        store.despesas.push(...despesas);
        const qtd = despesas.length;
        registrarAuditoria(
          'criou', 'despesa',
          criouMultiplas ? `Criou ${qtd} despesas recorrentes: ${form.descricao}` : 'Cadastrou despesa: ' + form.descricao,
          fmtMoney(form.valor)
        );
        showToast(criouMultiplas ? `${qtd} despesas criadas!` : 'Despesa cadastrada!', 'success');
      }
      closeModal('modal-despesa');
      renderDespesas();
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      if (err instanceof RepositoryError) { showToast(err.message + (err.cause ? ': ' + err.cause.message : ''), 'error'); return; }
      throw err; // erro inesperado — deixa subir, não engole silenciosamente
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = textoOriginal; }
    }
  }

  async function onExcluirDespesa(id) {
    if (!confirm('Excluir esta despesa?')) return;
    const ok = await service.excluirDespesa(id);
    if (!ok) { showToast('Erro ao excluir despesa.', 'error'); return; }
    store.despesas = store.despesas.filter((d) => d.id !== id);
    renderDespesas();
    showToast('Despesa excluída.');
  }

  function onAbrirPagarDespesa(id) {
    const d = store.despesas.find((d) => d.id === id);
    if (!d) return;
    document.getElementById('pagar-despesa-id').value = id;
    document.getElementById('pagar-despesa-desc').innerHTML =
      `<strong>${d.descricao}</strong><br><span style="color:var(--danger)">${fmtMoney(d.valor)}</span> · Vence em ${document.querySelector('[data-fmt-date]')?.dataset.fmtDate ?? d.vencimento}`;
    document.getElementById('pagar-despesa-data').value = today();
    openModal('modal-pagar-despesa', false);
  }

  async function onConfirmarPagamentoDespesa() {
    const id = document.getElementById('pagar-despesa-id').value;
    const d = store.despesas.find((d) => d.id === id);
    if (!d) return;
    const dataPagamento = document.getElementById('pagar-despesa-data').value;
    const forma = document.getElementById('pagar-despesa-forma').value;

    try {
      const salvo = await service.confirmarPagamentoDespesa(id, { dataPagamento, forma });
      if (!salvo) { showToast('Erro ao confirmar pagamento.', 'error'); return; }
      Object.assign(d, salvo);
      closeModal('modal-pagar-despesa');
      renderDespesas();
      registrarAuditoria('pagou', 'despesa', 'Pagou despesa: ' + (d.descricao || ''), 'Valor: ' + fmtMoney(d.valor || 0));
      showToast('✅ Pagamento confirmado!', 'success');
    } catch (err) {
      if (err instanceof RepositoryError) { showToast(err.message, 'error'); return; }
      throw err;
    }
  }

  return { onSalvarDespesa, onExcluirDespesa, onAbrirPagarDespesa, onConfirmarPagamentoDespesa };
}
