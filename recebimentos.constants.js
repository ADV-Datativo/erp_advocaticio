// modules/recebimentos/recebimentos.constants.js

export const STATUS_PARCELA_LABEL = Object.freeze({
  pago: '✅ Pago',
  pendente: '⏳ Pendente',
  vencido: '⚠️ Vencido'
});

export const STATUS_PARCELA_CLASSE = Object.freeze({
  pago: 'badge-green',
  pendente: 'badge-amber',
  vencido: 'badge-red'
});

export const TIPO_AJUSTE_LABEL = Object.freeze({
  desconto: 'Desconto',
  acrescimo: 'Acréscimo',
  juros: 'Juros'
});
