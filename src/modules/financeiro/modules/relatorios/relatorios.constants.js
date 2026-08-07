// modules/relatorios/relatorios.constants.js
//
// NOTA SOBRE DUPLICAÇÃO INTENCIONAL: os mapas abaixo (status de parcela,
// categorias/status de despesa) já existem em recebimentos.constants.js e
// despesas.constants.js. Sob a regra de isolamento do domínio ("nenhum
// submódulo importa arquivos de dentro de outro submódulo"), Relatórios
// não pode importar aqueles arquivos diretamente — só pode pedir DADOS
// via financeiro.registry.js, não METADADOS de exibição de outro
// submódulo. Duplicar esses pequenos mapas de label/ícone é o trade-off
// aceito (mesmo padrão já usado para RepositoryError entre Despesas e
// Recebimentos). Se um dia isso doer de verdade, a solução correta é
// mover esses mapas para um `shared/` de domínio, não quebrar o
// isolamento importando direto.

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

export const MESES_NOMES = Object.freeze(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']);
export const JANELA_GRAFICO_MESES = 6;
