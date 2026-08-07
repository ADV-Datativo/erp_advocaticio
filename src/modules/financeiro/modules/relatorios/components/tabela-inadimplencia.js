// modules/relatorios/components/tabela-inadimplencia.js

/** @param {ReturnType<import('../relatorios.service.js').calcularInadimplencia>['cards']} cards */
export function renderizarCardsInadimplencia(cards, fmtMoney) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('inad-qtd-clientes', cards.qtdClientes);
  set('inad-pct-clientes', cards.pctClientes != null ? cards.pctClientes + '% da base' : '');
  set('inad-total', fmtMoney(cards.total));
  set('inad-qtd-parcelas', cards.qtdParcelas + ' parcela(s)');
  set('inad-media-dias', cards.mediaDias + ' dias');
  set('inad-grave', cards.graves);
}

/**
 * @param {Array} vencidas já filtradas/ordenadas pelo service
 * @param {Array} clientes @param {Array} processos
 */
export function renderizarTabelaInadimplencia(vencidas, clientes, processos, fmtDate, fmtMoney, diffDays, hoje) {
  const tb = document.getElementById('tbody-inadimplencia');
  if (!tb) return;
  if (!vencidas.length) {
    tb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px">Sem parcelas em atraso nesse filtro. 🎉</td></tr>';
    return;
  }
  tb.innerHTML = vencidas.map((p) => {
    const c = clientes.find((c) => c.id === p.clienteId) || { nome: '—' };
    const pr = processos.find((pr) => pr.id === p.processoId) || { numero: '—' };
    const dias = diffDays(p.vencimento, hoje);
    const corDias = dias > 60 ? 'var(--danger)' : dias > 30 ? '#92400E' : 'var(--warning)';
    return `<tr style="background:${dias > 30 ? '#FFF5F5' : ''}">
      <td><strong>${c.nome}</strong></td>
      <td style="color:var(--blue-600)">${pr.numero}</td>
      <td style="text-align:center">${p.num}/${p.total}</td>
      <td>${fmtDate(p.vencimento)}</td>
      <td><span style="font-weight:700;color:${corDias}">${dias} dias</span></td>
      <td><strong style="color:var(--danger)">${fmtMoney(p.valor)}</strong></td>
      <td style="white-space:nowrap">
        <button class="btn btn-primary btn-sm" onclick="abrirModalWpp('${c.id}','${p.id}')" title="Cobrar via WhatsApp" style="background:#25D366;border-color:#25D366">📱</button>
        <button class="btn btn-outline btn-sm" onclick="marcarPago('${p.id}')" title="Confirmar pagamento">✅</button>
      </td>
    </tr>`;
  }).join('');
}
