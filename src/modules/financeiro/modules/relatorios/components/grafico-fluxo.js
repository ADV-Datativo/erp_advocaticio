// modules/relatorios/components/grafico-fluxo.js
import { MESES_NOMES } from '../relatorios.constants.js';

/**
 * @param {Array} dadosGrafico já calculado pelo service (6 meses, ent/sai/isMesAtual)
 * @param {(valor: number) => string} fmtMoney
 */
export function renderizarGraficoFluxo(dadosGrafico, fmtMoney) {
  const grafEl = document.getElementById('rel-grafico-fluxo');
  if (grafEl && dadosGrafico.some((d) => d.ent > 0 || d.sai > 0)) {
    const maxVal = Math.max(...dadosGrafico.map((d) => Math.max(d.ent, d.sai)), 1);
    grafEl.innerHTML = dadosGrafico.map((d) => {
      const hEnt = Math.max(Math.round((d.ent / maxVal) * 140), d.ent > 0 ? 4 : 0);
      const hSai = Math.max(Math.round((d.sai / maxVal) * 140), d.sai > 0 ? 4 : 0);
      const label = MESES_NOMES[d.mes] + '/' + String(d.ano).slice(2);
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="width:100%;display:flex;align-items:flex-end;justify-content:center;gap:2px;height:150px">
          <div title="Entradas: ${fmtMoney(d.ent)}" style="width:42%;background:${d.isMesAtual ? '#4ADE80' : 'var(--success)'};border-radius:4px 4px 0 0;height:${hEnt}px;opacity:0.85"></div>
          <div title="Saídas: ${fmtMoney(d.sai)}" style="width:42%;background:${d.isMesAtual ? '#F87171' : 'var(--danger)'};border-radius:4px 4px 0 0;height:${hSai}px;opacity:0.85"></div>
        </div>
        <div style="font-size:10px;color:${d.isMesAtual ? 'var(--blue-600)' : 'var(--text-muted)'};font-weight:${d.isMesAtual ? 700 : 400}">${label}</div>
      </div>`;
    }).join('');
  }

  const totaisEl = document.getElementById('rel-grafico-totais');
  if (totaisEl) {
    const totalE6 = dadosGrafico.reduce((s, d) => s + d.ent, 0);
    const totalS6 = dadosGrafico.reduce((s, d) => s + d.sai, 0);
    totaisEl.innerHTML = `
      <div style="text-align:center"><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Entradas (6m)</div><div style="font-size:15px;font-weight:700;color:var(--success)">${fmtMoney(totalE6)}</div></div>
      <div style="text-align:center"><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Saídas (6m)</div><div style="font-size:15px;font-weight:700;color:var(--danger)">${fmtMoney(totalS6)}</div></div>
      <div style="text-align:center"><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Saldo (6m)</div><div style="font-size:15px;font-weight:700;color:${totalE6 - totalS6 >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtMoney(totalE6 - totalS6)}</div></div>`;
  }
}
