// core/ui/select/select.js
//
// Oitavo e último componente da Onda 1. <select> já reaproveita a
// mesma classe .form-control do Input — sem CSS próprio a criar. Só
// padroniza a geração de HTML com as opções.

/**
 * @param {{
 *   id: string, opcoes: Array<{value: string, label: string}>,
 *   valorSelecionado?: string, onChange?: string, placeholder?: string
 * }} props
 * @returns {string} HTML do select.
 */
export function renderSelect({ id, opcoes, valorSelecionado = '', onChange = '', placeholder = '' }) {
  const onchangeAttr = onChange ? `onchange="${onChange}"` : '';
  const placeholderOpt = placeholder ? `<option value="">${placeholder}</option>` : '';
  const opts = opcoes.map((o) =>
    `<option value="${o.value}"${o.value === valorSelecionado ? ' selected' : ''}>${o.label}</option>`
  ).join('');
  return `<select id="${id}" class="form-control" ${onchangeAttr}>${placeholderOpt}${opts}</select>`;
}
