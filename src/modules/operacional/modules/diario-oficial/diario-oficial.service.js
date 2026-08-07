// modules/diario-oficial/diario-oficial.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama o Supabase direto —
// só o repository.js faz isso.

import * as repository from './diario-oficial.repository.js';
import * as state from './diario-oficial.state.js';
import { validarPublicacaoForm } from './diario-oficial.validation.js';
import { STATUS_PADRAO, LIMITE_CARACTERES_TRECHO } from './diario-oficial.constants.js';

/** Carrega as publicações do banco e atualiza o estado do módulo. */
export async function carregarEArmazenarPublicacoes() {
  const publicacoes = await repository.carregarPublicacoes();
  state.definirPublicacoes(publicacoes);
  return publicacoes;
}

/** @returns {number} quantidade de publicações com status "nova" (para o badge). */
export function contarNaoLidas(publicacoes) {
  return publicacoes.filter((p) => p.status === STATUS_PADRAO).length;
}

/**
 * Filtra a lista de publicações por status e por termo de busca (nome do
 * cliente, número do processo/publicação, ou CPF — extraído de
 * renderListaPublicacoes original, linhas 7078-7089).
 * @param {Array} publicacoes
 * @param {{status?: string, termo?: string}} filtros
 * @param {Array} clientes necessário para casar CPF no termo de busca
 */
export function filtrarPublicacoes(publicacoes, { status, termo }, clientes) {
  let resultado = publicacoes;

  if (status) resultado = resultado.filter((p) => p.status === status);

  if (termo) {
    const termoBusca = termo.trim().toLowerCase();
    const termoSoDigitos = termoBusca.replace(/\D/g, '');
    resultado = resultado.filter((p) => {
      const nomeMatch = (p.clienteNome || '').toLowerCase().includes(termoBusca);
      const procMatch =
        (p.processoNumero || '').toLowerCase().includes(termoBusca) ||
        (p.numeroPublicado || '').toLowerCase().includes(termoBusca);
      const docMatch =
        termoSoDigitos.length >= 3 &&
        clientes.some((c) => c.id === p.clienteId && (c.cpf || '').replace(/\D/g, '').includes(termoSoDigitos));
      return nomeMatch || procMatch || docMatch;
    });
  }

  return resultado;
}

/** @returns {string} o conteúdo truncado para exibição em lista, com reticências se necessário. */
export function truncarConteudo(conteudo) {
  return conteudo.length > LIMITE_CARACTERES_TRECHO
    ? conteudo.slice(0, LIMITE_CARACTERES_TRECHO) + '…'
    : conteudo;
}

/**
 * Busca clientes por nome ou CPF, para o autocomplete do modal (extraído
 * de filtrarSugestoesClienteDO original).
 * @param {string} termo
 * @param {Array} clientes
 * @param {number} limite
 */
export function buscarClientesPorTermo(termo, clientes, limite = 30) {
  const termoLimpo = termo.trim().toLowerCase();
  if (!termoLimpo) return [];
  const termoSoDigitos = termo.replace(/\D/g, '');
  return clientes
    .filter((c) => {
      const nomeMatch = c.nome.toLowerCase().includes(termoLimpo);
      const docMatch = termoSoDigitos.length >= 3 && (c.cpf || '').replace(/\D/g, '').includes(termoSoDigitos);
      return nomeMatch || docMatch;
    })
    .slice(0, limite);
}

/**
 * @param {Array} processos todos os processos
 * @param {string|null} clienteId quando informado, filtra só os do cliente
 */
export function filtrarProcessosPorCliente(processos, clienteId) {
  return clienteId ? processos.filter((p) => p.clienteId === clienteId) : processos;
}

/**
 * Orquestra a criação/edição de uma publicação: valida, delega ao
 * repository, e atualiza o estado do módulo.
 * @param {object} form dados já lidos do formulário pelo controller
 * @param {string|null} editId
 * @returns {Promise<{publicacao: object, foiEdicao: boolean}>}
 */
export async function salvarPublicacao(form, editId) {
  validarPublicacaoForm(form);
  const salvo = await repository.salvarPublicacao(form, editId);
  if (editId) {
    state.atualizarPublicacaoNaLista(salvo);
  } else {
    state.adicionarPublicacao(salvo);
  }
  return { publicacao: salvo, foiEdicao: Boolean(editId) };
}

/** @returns {Promise<boolean>} true se excluiu com sucesso; já remove do estado do módulo. */
export async function excluirPublicacao(id) {
  const ok = await repository.excluirPublicacao(id);
  if (ok) state.removerPublicacaoDaLista(id);
  return ok;
}
