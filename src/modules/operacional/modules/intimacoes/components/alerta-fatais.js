// modules/intimacoes/components/alerta-fatais.js
// Só renderiza o widget de "prazos fatais" do Dashboard. Continua sendo
// específico de Intimações (não é conteúdo genérico de Dashboard) —
// só o local onde aparece na tela é o Dashboard.

/** @param {Array} fatais já calculado pelo service @param {(dataISO: string) => string} fmtDate */
export function renderizarAlertaFatais(fatais, fmtDate) {
  return fatais.map((f) => {
    const diasLabel = f.dias < 0 ? `VENCIDO há ${Math.abs(f.dias)}d` : f.dias === 0 ? 'VENCE HOJE' : `Vence em ${f.dias}d`;
    return `<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.12);border-radius:8px;padding:8px 12px">
      <div>
        <strong>${f.proc.numero}</strong> — ${f.c.nome}
        <div style="font-size:11.5px;opacity:0.85">${f.descricao || f.tipo} · Prazo: ${fmtDate(f.prazoFinal)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:700;white-space:nowrap">${diasLabel}</span>
        <button onclick="marcarIntimacaoCumprida('${f.procId}','${f.id}')" style="background:rgba(255,255,255,0.2);border:none;border-radius:6px;color:white;cursor:pointer;padding:4px 10px;font-size:12px" title="Marcar como cumprido">✅ Cumprido</button>
      </div>
    </div>`;
  }).join('');
}

/** @param {{mensagem: string, nivel: string|null}} aviso */
export function estiloAvisoPrazo(aviso) {
  if (!aviso.nivel) return { display: 'none' };
  if (aviso.nivel === 'vencido' || aviso.nivel === 'urgente') {
    return { display: 'block', background: '#FEE2E2', color: 'var(--danger)' };
  }
  return { display: 'block', background: '#FEF3C7', color: '#92400E' };
}
