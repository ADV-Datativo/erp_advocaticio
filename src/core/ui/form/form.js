// core/ui/form/form.js
//
// Sétimo componente da Component Library (Sprint 4, Onda 1). CSS já
// existente (.form-group, .form-label, .form-control) reaproveitado
// sem alteração. Achado real durante a construção: NENHUM campo do
// sistema tem estado visual de erro — validação hoje só aparece via
// toast (ValidationError), nunca junto ao campo em si. Vai contra
// docs/design/08-feedback.md ("no lugar do campo, texto claro do que
// precisa mudar"). Este componente já nasce com suporte a isso, para
// formulários novos — retrofit dos formulários existentes fica de fora
// por tempo, é uma oportunidade registrada, não uma correção feita.

import { theme } from '../../theme/tokens/index.js';

/**
 * @param {{
 *   id: string, label: string, tipo?: string, valor?: string,
 *   placeholder?: string, obrigatorio?: boolean, erro?: string
 * }} props
 * @returns {string} HTML do grupo completo (label + input + erro, se houver).
 */
export function renderFormGroup({ id, label, tipo = 'text', valor = '', placeholder = '', obrigatorio = false, erro = '' }) {
  const bordaErro = erro ? `border-color:${theme.colors.danger[600]} !important` : '';
  return `<div class="form-group">
    <label class="form-label" for="${id}">${label}${obrigatorio ? ' *' : ''}</label>
    <input type="${tipo}" id="${id}" class="form-control" value="${valor}" placeholder="${placeholder}" style="${bordaErro}">
    ${erro ? `<div style="color:${theme.colors.danger[600]};font-size:${theme.typography.fontSize.xs};margin-top:4px">${erro}</div>` : ''}
  </div>`;
}
