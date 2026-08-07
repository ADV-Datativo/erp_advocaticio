// modules/operacional/operacional.constants.js
//
// "Operacional" hoje NÃO é um módulo de código — é só o valor 'operacional'
// dentro do mapa PAGINA_CATEGORIA (ainda em index.html), que agrupa estas
// 7 páginas visualmente sob o mesmo cabeçalho de menu. Este arquivo apenas
// nomeia essa lista como uma constante própria, para que os próximos
// arquivos do orquestrador (registry.js e o que vier depois) tenham uma
// única fonte de verdade — sem duplicar a lista à mão em cada arquivo novo.
//
// Nada neste arquivo é chamado ainda por nenhum outro código (nem novo,
// nem do monólito). Puramente aditivo.

/** As 7 páginas que hoje vivem sob a categoria "Operacional" no menu. */
export const PAGINAS_OPERACIONAIS = Object.freeze([
  'processos',
  'orcamentos',
  'agenda',
  'kanban',
  'diario-oficial',
  'modelos-documentos',
  'leads'
]);

/** Nome da categoria, como usado hoje em PAGINA_CATEGORIA e nos data-cat do HTML. */
export const CATEGORIA_OPERACIONAL = 'operacional';
