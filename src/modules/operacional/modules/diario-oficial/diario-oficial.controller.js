// modules/diario-oficial/diario-oficial.controller.js
// Única camada deste módulo autorizada a ler o DOM e disparar efeitos de UI
// (toast, abrir/fechar modal, re-render). Nunca contém regra de negócio,
// nunca fala com o Supabase.

import * as service from './diario-oficial.service.js';
import * as state from './diario-oficial.state.js';
import { ValidationError } from './diario-oficial.validation.js';
import { RepositoryError } from './diario-oficial.repository.js';
import { renderizarListaPublicacoes } from './components/lista-publicacoes.js';
import { renderizarSugestoesCliente, renderizarOpcoesProcesso } from './components/autocomplete-cliente.js';

/**
 * @param {object} deps dependências que ainda vivem no monólito, injetadas
 *   para evitar import circular enquanto o restante do sistema não migrou.
 */
export function criarControllerDiarioOficial(deps) {
  const { showToast, openModal, closeModal, today } = deps;

  async function onRenderDiarioOficial() {
    const lista = document.getElementById('do-lista-publicacoes');
    lista.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:40px">Carregando...</div>';
    await service.carregarEArmazenarPublicacoes();
    atualizarBadge();
    renderizarLista();
  }

  function atualizarBadge() {
    const naoLidas = service.contarNaoLidas(state.listarPublicacoes());
    const badge = document.getElementById('badge-diario');
    if (badge) { badge.textContent = naoLidas; badge.style.display = naoLidas ? '' : 'none'; }
  }

  function renderizarLista() {
    const filtroStatus = document.getElementById('do-filtro-status').value;
    const termoBusca = document.getElementById('do-busca').value;
    const filtradas = service.filtrarPublicacoes(
      state.listarPublicacoes(),
      { status: filtroStatus, termo: termoBusca },
      state.listarClientes()
    );
    document.getElementById('do-lista-publicacoes').innerHTML = renderizarListaPublicacoes(filtradas);
  }

  function popularSelectProcessos(clienteId) {
    const sel = document.getElementById('do-processo');
    const processosFiltrados = service.filtrarProcessosPorCliente(state.listarProcessos(), clienteId);
    const { html, valorParaRestaurar } = renderizarOpcoesProcesso(processosFiltrados, sel.value);
    sel.innerHTML = html;
    sel.value = valorParaRestaurar;
  }

  function onFiltrarSugestoesCliente(termo) {
    const caixa = document.getElementById('do-sugestoes-cliente');
    if (!termo.trim()) { caixa.style.display = 'none'; caixa.innerHTML = ''; return; }
    const encontrados = service.buscarClientesPorTermo(termo, state.listarClientes());
    caixa.innerHTML = renderizarSugestoesCliente(encontrados);
    caixa.style.display = 'block';
  }

  function onSelecionarCliente(clienteId, nome) {
    document.getElementById('do-busca-cliente').value = nome;
    document.getElementById('do-cliente-id').value = clienteId;
    document.getElementById('do-sugestoes-cliente').style.display = 'none';
    popularSelectProcessos(clienteId);
  }

  function onAbrirModalNovaPublicacao() {
    document.getElementById('do-edit-id').value = '';
    document.getElementById('do-diario').value = '';
    document.getElementById('do-data').value = today();
    document.getElementById('do-numero-publicado').value = '';
    document.getElementById('do-busca-cliente').value = '';
    document.getElementById('do-cliente-id').value = '';
    document.getElementById('do-responsavel').value = '';
    document.getElementById('do-status').value = 'nova';
    document.getElementById('do-conteudo').value = '';
    document.getElementById('modal-publicacao-titulo').textContent = '+ Cadastrar Publicação';
    document.getElementById('do-btn-excluir').style.display = 'none';
    popularSelectProcessos(null);
    openModal('modal-publicacao', false);
  }

  function onAbrirModalEditarPublicacao(id) {
    const p = state.listarPublicacoes().find((p) => p.id === id);
    if (!p) return;
    document.getElementById('do-edit-id').value = p.id;
    document.getElementById('do-diario').value = p.diario;
    document.getElementById('do-data').value = p.data;
    document.getElementById('do-numero-publicado').value = p.numeroPublicado;
    document.getElementById('do-busca-cliente').value = p.clienteNome || '';
    document.getElementById('do-cliente-id').value = p.clienteId || '';
    document.getElementById('do-responsavel').value = p.responsavel;
    document.getElementById('do-status').value = p.status;
    document.getElementById('do-conteudo').value = p.conteudo;
    document.getElementById('modal-publicacao-titulo').textContent = '✏️ Editar Publicação';
    document.getElementById('do-btn-excluir').style.display = '';
    popularSelectProcessos(p.clienteId);
    document.getElementById('do-processo').value = p.processoId || '';
    openModal('modal-publicacao', false);
  }

  function lerFormularioPublicacao() {
    return {
      diario: document.getElementById('do-diario').value.trim(),
      data: document.getElementById('do-data').value,
      numeroPublicado: document.getElementById('do-numero-publicado').value.trim(),
      clienteId: document.getElementById('do-cliente-id').value || null,
      processoId: document.getElementById('do-processo').value || null,
      responsavel: document.getElementById('do-responsavel').value.trim(),
      status: document.getElementById('do-status').value,
      conteudo: document.getElementById('do-conteudo').value.trim()
    };
  }

  async function onSalvarPublicacao() {
    const form = lerFormularioPublicacao();
    const editId = document.getElementById('do-edit-id').value;

    try {
      const { foiEdicao } = await service.salvarPublicacao(form, editId || null);
      showToast(foiEdicao ? 'Publicação atualizada!' : 'Publicação cadastrada!', 'success');
      closeModal('modal-publicacao');
      atualizarBadge();
      renderizarLista();
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      if (err instanceof RepositoryError) { showToast(err.message + (err.cause ? ': ' + err.cause.message : ''), 'error'); return; }
      throw err;
    }
  }

  async function onExcluirPublicacaoAtual() {
    const editId = document.getElementById('do-edit-id').value;
    if (!editId) return;
    if (!confirm('Excluir esta publicação?')) return;
    const ok = await service.excluirPublicacao(editId);
    if (!ok) { showToast('Erro ao excluir publicação.', 'error'); return; }
    closeModal('modal-publicacao');
    showToast('Publicação excluída.');
    atualizarBadge();
    renderizarLista();
  }

  return {
    onRenderDiarioOficial,
    onFiltrarListaPublicacoes: renderizarLista,
    onFiltrarSugestoesCliente,
    onSelecionarCliente,
    onAbrirModalNovaPublicacao,
    onAbrirModalEditarPublicacao,
    onSalvarPublicacao,
    onExcluirPublicacaoAtual
  };
}
