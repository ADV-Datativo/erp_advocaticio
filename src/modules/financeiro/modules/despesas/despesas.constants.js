// modules/despesas/despesas.constants.js

export const DESP_CATEGORIAS = Object.freeze({
  aluguel:       { icon: '🏠', label: 'Aluguel' },
  salario:       { icon: '👤', label: 'Salário' },
  honorario:     { icon: '⚖️', label: 'Honorário' },
  energia:       { icon: '💡', label: 'Energia' },
  agua:          { icon: '💧', label: 'Água' },
  internet:      { icon: '🌐', label: 'Internet' },
  telefone:      { icon: '📱', label: 'Telefone' },
  sistema:       { icon: '💻', label: 'Sistema/Software' },
  material:      { icon: '📦', label: 'Material' },
  imposto:       { icon: '📋', label: 'Imposto/Taxa' },
  contabilidade: { icon: '🧾', label: 'Contabilidade' },
  outro:         { icon: '📁', label: 'Outro' }
});

export const DESP_STATUS = Object.freeze({
  pendente:  { icon: '⏳', label: 'Pendente',  cls: 'badge-amber' },
  pago:      { icon: '✅', label: 'Pago',      cls: 'badge-green' },
  vencido:   { icon: '⚠️', label: 'Vencido',  cls: 'badge-red' },
  cancelado: { icon: '❌', label: 'Cancelado', cls: 'badge-gray' }
});

export const CATEGORIA_PADRAO = 'outro';
export const DIAS_JANELA_A_VENCER = 30;
