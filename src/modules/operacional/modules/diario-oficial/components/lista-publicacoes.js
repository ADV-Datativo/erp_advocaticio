// modules/diario-oficial/components/lista-publicacoes.js
// Só renderiza. Recebe dados prontos, devolve HTML. Nunca decide filtro,
// nunca calcula nada, nunca chama service ou repository.

import { STATUS_PUBLICACAO } from '../diario-oficial.constants.js';
import { truncarConteudo } from '../diario-oficial.service.js';

/**
 * @param {Array} publicacoes já filtradas pelo controller/service
 * @returns {string} HTML da lista, ou o estado vazio.
 */
export function renderizarListaPublicacoes(publicacoes) {
  if (!publicacoes.length) {
    return '<div style="text-align:center;color:var(--text-muted);padding:40px">Nenhuma publicação encontrada.</div>';
  }

  return publicacoes.map(renderizarItemPublicacao).join('');
}

function renderizarItemPublicacao(p) {
  const st = STATUS_PUBLICACAO[p.status] || STATUS_PUBLICACAO.nova;
  const data = new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR');
  const trecho = truncarConteudo(p.conteudo);
  return `<div onclick="abrirModalEditarPublicacao('${p.id}')" style="cursor:pointer;border:1px solid ${p.status === 'nova' ? st.cor : 'var(--border)'};border-left:4px solid ${st.cor};border-radius:var(--radius);padding:14px 16px;margin-bottom:10px;background:${p.status === 'nova' ? st.bg : 'var(--white)'}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="badge" style="background:${st.bg};color:${st.cor};font-size:10.5px">${st.icon} ${st.label}</span>
        <strong style="font-size:13.5px">${data}</strong>
        ${p.diario ? `<span style="font-size:11.5px;color:var(--text-muted)">${p.diario}</span>` : ''}
        ${p.clienteNome ? `<span style="font-size:12px;color:var(--blue-600)">👤 ${p.clienteNome}</span>` : ''}
        ${p.processoNumero ? `<span class="badge" style="background:var(--blue-50);color:var(--blue-600);font-size:10.5px">⚖️ ${p.processoNumero}</span>` : ''}
        ${!p.processoId && !p.clienteId ? `<span style="font-size:11px;color:var(--text-muted)">· sem vínculo ainda</span>` : ''}
      </div>
      ${p.responsavel ? `<span style="font-size:11.5px;color:var(--text-muted)">Resp: ${p.responsavel}</span>` : ''}
    </div>
    <div style="font-size:13px;color:var(--text-secondary);white-space:pre-wrap">${trecho}</div>
  </div>`;
}
