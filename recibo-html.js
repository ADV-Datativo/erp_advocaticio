// modules/recebimentos/components/recibo-html.js
// Monta o HTML do recibo como string pura. Não abre janela, não imprime —
// isso é efeito de UI e fica no controller. Extraído de gerarReciboPagamento
// original, linhas 13090-13174.

/**
 * @param {object} dados já reunidos pelo service (parcela + processo + cliente + tipo + dados do escritório)
 * @param {(valor: number) => string} fmtMoney
 * @param {(dataISO: string) => string} fmtDate
 * @param {(tamanho: number) => string} getLogoInlineHtml
 */
export function montarHtmlRecibo(dados, fmtMoney, fmtDate, getLogoInlineHtml) {
  const { parcela: pa, processo: proc, cliente: c, tipo: t, escritorio, nomeEscritorio, hoje, reciboNum } = dados;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Recibo de Pagamento</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;color:#1A2E45;padding:40px;max-width:680px;margin:0 auto}
    .header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1A2E45;padding-bottom:18px;margin-bottom:24px}
    .logo{width:52px;height:52px;background:#1A2E45;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#C4A96B;font-size:20px;font-weight:700}
    h1{font-size:18px;color:#1A2E45;margin:0}
    .esc p{font-size:11.5px;color:#666;margin:2px 0}
    .badge-recibo{background:#1A2E45;color:#C4A96B;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px}
    .titulo{text-align:center;padding:16px;background:#1A2E45;border-radius:10px;color:white;margin-bottom:24px}
    .titulo h2{font-size:16px;letter-spacing:1.5px;text-transform:uppercase}
    .titulo p{font-size:12px;opacity:0.7;margin-top:4px}
    .valor-box{text-align:center;padding:20px;background:linear-gradient(135deg,#1A2E45,#1D3A5C);border-radius:12px;margin:20px 0;color:white}
    .valor-box .v{font-size:32px;font-weight:700;color:#C4A96B;letter-spacing:1px}
    .valor-box .ext{font-size:12px;opacity:0.75;margin-top:4px}
    .secao{border:1px solid #DDE4EC;border-radius:8px;padding:14px 16px;margin-bottom:14px}
    .secao h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#C4A96B;margin-bottom:10px;border-bottom:1px solid #EEF2F7;padding-bottom:6px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .item label{font-size:10.5px;color:#888;display:block;margin-bottom:2px}
    .item strong{font-size:13px;color:#1A2E45}
    .rodape{margin-top:30px;padding-top:20px;border-top:1px solid #DDE4EC;display:flex;justify-content:space-between;align-items:flex-end}
    .assinatura{text-align:center}
    .assinatura .linha{width:180px;border-top:1px solid #1A2E45;margin:0 auto 6px}
    .assinatura p{font-size:11.5px;color:#666}
    .autenticidade{font-size:10.5px;color:#999;text-align:right}
    @media print{body{padding:20px}}
  </style></head><body>
  <div class="header">
    <div style="display:flex;align-items:center;gap:12px">
      <div class="logo-wrap">${getLogoInlineHtml(52)}</div>
      <div class="esc">
        <h1>${escritorio.nome || nomeEscritorio}</h1>
        <p>${escritorio.oab || 'OAB/PE 51.493'}</p>
        ${escritorio.tel ? `<p>${escritorio.tel}</p>` : ''}
      </div>
    </div>
    <span class="badge-recibo">RECIBO Nº ${reciboNum}</span>
  </div>

  <div class="titulo">
    <h2>Recibo de Pagamento de Honorários</h2>
    <p>Emitido em ${hoje}</p>
  </div>

  <div class="valor-box">
    <div style="font-size:12px;opacity:0.8;margin-bottom:6px;letter-spacing:1px">VALOR RECEBIDO</div>
    <div class="v">${fmtMoney(pa.valor)}</div>
    <div class="ext">Parcela ${pa.num} de ${pa.total} · ${t.nome}</div>
  </div>

  <div class="secao">
    <h3>Dados do Pagador</h3>
    <div class="grid">
      <div class="item"><label>Nome</label><strong>${c.nome}</strong></div>
      <div class="item"><label>CPF/CNPJ</label><strong>${c.cpf || '—'}</strong></div>
      ${c.tel ? `<div class="item"><label>Telefone</label><strong>${c.tel}</strong></div>` : ''}
      ${c.email ? `<div class="item"><label>E-mail</label><strong>${c.email}</strong></div>` : ''}
    </div>
  </div>

  <div class="secao">
    <h3>Referência</h3>
    <div class="grid">
      <div class="item"><label>Processo</label><strong>${proc.numero}</strong></div>
      <div class="item"><label>Tipo de Serviço</label><strong>${t.nome}</strong></div>
      <div class="item"><label>Parcela</label><strong>${pa.num}ª de ${pa.total}</strong></div>
      <div class="item"><label>Vencimento</label><strong>${fmtDate(pa.vencimento)}</strong></div>
      <div class="item"><label>Data do Pagamento</label><strong>${fmtDate(pa.dtPagamento) || hoje}</strong></div>
      <div class="item"><label>Forma de Pagamento</label><strong>${pa.forma || '—'}</strong></div>
    </div>
    ${pa.obs ? `<div class="item" style="margin-top:8px"><label>Observação</label><strong>${pa.obs}</strong></div>` : ''}
  </div>

  <div class="rodape">
    <div class="assinatura">
      <div class="linha"></div>
      <p><strong>${proc.adv || nomeEscritorio}</strong></p>
      <p>Advogado · ${escritorio.oab || 'OAB/PE 51.493'}</p>
    </div>
    <div class="autenticidade">
      <p>Recibo gerado em ${hoje}</p>
      <p>Ref.: Proc. ${proc.numero} · Parc. ${pa.num}/${pa.total}</p>
    </div>
  </div>
  </body></html>`;
}
