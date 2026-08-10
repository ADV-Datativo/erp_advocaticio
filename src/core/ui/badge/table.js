// core/ui/table/table.js
//
// Segundo componente da Component Library (Sprint 4, Onda 1). Consolida
// o padrão de "estado vazio" já reimplementado 5 vezes de forma quase
// idêntica nos módulos migrados (Despesas, Recebimentos, Relatórios) —
// mesma estrutura, só variando colspan/padding/mensagem.
//
// Diferente do Badge, este componente NÃO tenta abstrair o conteúdo das
// linhas de dado (cada tabela tem células muito específicas de negócio
// — badge, botão de ação, formatação própria). O que se repete de
// verdade, e vale consolidar, é a casca (estado vazio, wrapper de
// cabeçalho). Forçar um "renderRow genérico" agora seria abstração
// prematura sem ganho real.

import { theme } from '../../theme/tokens/index.js';

/**
 * Linha de estado vazio — substitui as 5 versões manuais quase
 * idênticas já espalhadas pelos módulos migrados.
 * @param {{colspan: number, message: string, icon?: string}} props
 * @returns {string} HTML de um <tr> pronto pra colocar no lugar das
 *   linhas normais quando a lista estiver vazia.
 */
export function renderEmptyStateRow({ colspan, message, icon = '' }) {
  return `<tr><td colspan="${colspan}" style="text-align:center;color:var(--text-muted);padding:${theme.spacing[8]}">${icon ? icon + ' ' : ''}${message}</td></tr>`;
}

/**
 * Cabeçalho de tabela padronizado — usa var(--border) (já adaptativo
 * claro/escuro, mesmo padrão do resto do app) para a linha inferior.
 * @param {string[]} colunas rótulos das colunas, na ordem
 * @param {string} [alinhamentoUltima] 'left'|'right'|'center' pra última coluna (comum ser "Ações", alinhada à direita)
 */
export function renderTableHeader(colunas, alinhamentoUltima = 'left') {
  const ths = colunas.map((c, i) => {
    const align = i === colunas.length - 1 ? alinhamentoUltima : 'left';
    return `<th style="text-align:${align};padding:${theme.spacing[2]} ${theme.spacing[3]};font-size:${theme.typography.fontSize.xs};font-weight:${theme.typography.fontWeight.semibold};color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border)">${c}</th>`;
  }).join('');
  return `<thead><tr>${ths}</tr></thead>`;
}
