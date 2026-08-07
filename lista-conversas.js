// modules/mensagens/components/lista-conversas.js
// Só renderiza. Recebe o agrupamento por cliente já pronto.
import { REMETENTE } from '../mensagens.constants.js';

/**
 * @param {Record<string, {nome: string, msgs: Array}>} porCliente
 * @param {string|null} clienteIdAtivo
 */
export function renderizarListaConversas(porCliente, clienteIdAtivo) {
  const entradas = Object.entries(porCliente);
  if (!entradas.length) {
    return '<div style="text-align:center;color:var(--text-muted);padding:20px;font-size:12.5px">Nenhuma mensagem ainda.</div>';
  }
  return entradas.map(([cid, c]) => renderizarItemConversa(cid, c, cid === clienteIdAtivo)).join('');
}

function renderizarItemConversa(cid, c, ativo) {
  const naoLidas = c.msgs.filter((m) => m.remetente === REMETENTE.CLIENTE && !m.lida).length;
  const ultima = c.msgs[0];
  const hora = ultima ? new Date(ultima.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
  return `<div onclick="abrirConversaPortal('${cid}','${c.nome.replace(/'/g, "\\\\'")}')"
    style="padding:10px 12px;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${ativo ? 'var(--blue-50)' : 'none'};transition:background 0.15s"
    onmouseover="if(!this.classList.contains('ativo'))this.style.background='var(--surface)'" onmouseout="if(!this.classList.contains('ativo'))this.style.background='${ativo ? 'var(--blue-50)' : 'none'}'">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
      <strong style="font-size:13px;color:var(--text-primary)">${c.nome}</strong>
      ${naoLidas ? `<span style="background:var(--danger);color:white;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px">${naoLidas}</span>` : ''}
    </div>
    <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">${hora}</div>
  </div>`;
}
