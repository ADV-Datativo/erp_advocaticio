// modules/diario-oficial/components/autocomplete-cliente.js
// Só renderiza a caixa de sugestões. A lógica de busca vive no service.

/**
 * @param {Array} clientesEncontrados já filtrados pelo service
 * @returns {string} HTML da caixa de sugestões.
 */
export function renderizarSugestoesCliente(clientesEncontrados) {
  if (!clientesEncontrados.length) {
    return '<div style="padding:10px 14px;font-size:12.5px;color:var(--text-muted)">Nenhum cliente encontrado.</div>';
  }
  return clientesEncontrados
    .map(
      (c) => `<div onclick="selecionarClienteDO('${c.id}','${c.nome.replace(/'/g, "\\'")}')"
      style="padding:9px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border)"
      onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='none'">
      <strong>${c.nome}</strong>${c.cpf ? ` <span style="color:var(--text-muted);font-size:11.5px">${c.cpf}</span>` : ''}
    </div>`
    )
    .join('');
}

/**
 * @param {Array} processos já filtrados pelo service (por cliente, se houver)
 * @param {string} valorSelecionadoAtual preserva a seleção ao repopular
 */
export function renderizarOpcoesProcesso(processos, valorSelecionadoAtual) {
  const opcoes =
    '<option value="">— Nenhum —</option>' +
    processos.map((p) => `<option value="${p.id}">${p.numero}</option>`).join('');
  return { html: opcoes, valorParaRestaurar: valorSelecionadoAtual };
}
