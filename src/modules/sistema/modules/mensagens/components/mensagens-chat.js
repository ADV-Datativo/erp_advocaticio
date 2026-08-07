// modules/mensagens/components/mensagens-chat.js
import { REMETENTE } from '../mensagens.constants.js';

/** @param {Array} mensagens da conversa aberta */
export function renderizarMensagensDaConversa(mensagens) {
  if (!mensagens.length) {
    return '<div style="text-align:center;color:var(--text-muted);padding:20px;font-size:13px">Nenhuma mensagem ainda.</div>';
  }
  return mensagens.map(renderizarBolha).join('');
}

function renderizarBolha(m) {
  const eu = m.remetente === REMETENTE.ESCRITORIO;
  const hora = new Date(m.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return `<div style="display:flex;flex-direction:column;align-items:${eu ? 'flex-end' : 'flex-start'}">
    <div style="max-width:72%;padding:9px 13px;border-radius:12px;font-size:13.5px;line-height:1.5;
      background:${eu ? 'var(--blue-600)' : 'var(--surface)'};color:${eu ? 'white' : 'var(--text-primary)'};
      border:${eu ? 'none' : '1px solid var(--border)'};
      border-bottom-${eu ? 'right' : 'left'}-radius:3px">
      ${m.conteudo}
      <div style="font-size:10.5px;opacity:0.7;margin-top:4px">${hora}</div>
    </div>
  </div>`;
}
