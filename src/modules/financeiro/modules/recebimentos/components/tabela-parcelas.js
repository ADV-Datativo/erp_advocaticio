// modules/recebimentos/components/tabela-parcelas.js
// Só renderiza. Recebe a lista já filtrada/ordenada/com status calculado.

/**
 * @param {Array} lista já filtrada/ordenada, com computedStatus preenchido
 * @param {Array} clientes @param {Array} processos
 * @param {(dataISO: string) => string} fmtDate
 * @param {(valor: number) => string} fmtMoney
 */
export function renderizarTabelaParcelas(lista, clientes, processos, fmtDate, fmtMoney) {
  if (!lista.length) {
    return '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:28px">Nenhuma parcela encontrada.</td></tr>';
  }
  return lista.map((p) => renderizarLinha(p, clientes, processos, fmtDate, fmtMoney)).join('');
}

function renderizarLinha(p, clientes, processos, fmtDate, fmtMoney) {
  const c = clientes.find((c) => c.id === p.clienteId) || { nome: '—' };
  const pr = processos.find((pr) => pr.id === p.processoId) || { numero: '—' };
  const st = p.computedStatus;
  const stLabel = st === 'pago' ? 'Pago' : st === 'vencido' ? 'Vencido' : 'Pendente';
  const stCls = st === 'pago' ? 'badge-green' : st === 'vencido' ? 'badge-red' : 'badge-amber';
  return `<tr>
    <td><strong style="color:var(--blue-600)">${pr.numero}</strong></td>
    <td>${c.nome}</td>
    <td>${p.num} / ${p.total}</td>
    <td>${fmtDate(p.vencimento)}</td>
    <td><strong>${fmtMoney(p.valor)}</strong></td>
    <td><span class="badge ${stCls}">${stLabel}</span>${p.dtPagamento ? `<br><span style="font-size:10px;color:var(--text-muted)">Pago em ${fmtDate(p.dtPagamento)}</span>` : ''}</td>
    <td>${
      st !== 'pago'
        ? `<button class="btn btn-primary btn-sm" onclick="marcarPago('${p.id}')">✅ Pagar</button>
           <button class="btn btn-outline btn-sm" onclick="abrirReagendar('${p.id}')" title="Reagendar vencimento" style="font-size:11px">📅</button>
           <button class="btn btn-outline btn-sm" onclick="abrirDescontoAcrescimo('${p.id}')" title="Desconto / Acréscimo" style="font-size:11px">💱</button>
           <button class="btn btn-outline btn-sm" onclick="abrirModalWpp('${p.clienteId}','${p.id}')" title="Enviar Cobrança WhatsApp" style="background:#E7FFDB;border-color:#25D366;color:#128C7E">📱</button>`
        : `<span style="color:var(--success);font-size:12px">✔ Confirmado</span>
           <button class="btn btn-outline btn-sm" onclick="gerarReciboPagamento('${p.id}')" title="Gerar Recibo PDF" style="font-size:11px;padding:3px 8px">🧾</button>
           <button class="btn btn-outline btn-sm" onclick="abrirModalWppRecibo('${p.clienteId}','${p.id}')" title="Enviar Recibo WhatsApp" style="background:#E7FFDB;border-color:#25D366;color:#128C7E;font-size:11px;padding:3px 8px">📱</button>`
    }</td>
  </tr>`;
}
