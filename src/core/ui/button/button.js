// core/ui/button/button.js
//
// Quarto componente da Component Library (Sprint 4, Onda 1). As classes
// CSS (.btn, .btn-primary, .btn-outline, .btn-danger, .btn-ghost,
// .btn-sm, .btn-icon) já existem e já herdam a cor Datativo
// corretamente via var(--blue-600) (que o Theme Engine da Sprint 3 já
// alimenta) — não foi preciso recriar nada de estilo. O que faltava era
// consistência na geração do HTML e no padrão de "estado de
// carregamento", que já vi duplicado manualmente em pelo menos um
// controller (despesas.controller.js).

/** @typedef {'primary'|'outline'|'danger'|'ghost'} ButtonVariant */

/**
 * @param {{label: string, variant?: ButtonVariant, icon?: string, size?: 'sm'|'md', onClick?: string, id?: string}} props
 * @returns {string} HTML do botão.
 */
export function renderButton({ label, variant = 'primary', icon = '', size = 'md', onClick = '', id = '' }) {
  const classes = ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : ''].filter(Boolean).join(' ');
  const idAttr = id ? `id="${id}"` : '';
  const onclickAttr = onClick ? `onclick="${onClick}"` : '';
  return `<button class="${classes}" ${idAttr} ${onclickAttr}>${icon ? icon + ' ' : ''}${label}</button>`;
}

/**
 * Coloca um botão em estado de carregamento — consolida o padrão já
 * duplicado manualmente (guardar texto original, desabilitar, trocar
 * texto). Uso:
 *   const restaurar = setLoading(btn, 'Salvando...');
 *   try { await algo(); } finally { restaurar(); }
 * @param {HTMLButtonElement} botao
 * @param {string} textoCarregando
 * @returns {() => void} função que restaura o botão ao estado original.
 */
export function setLoading(botao, textoCarregando) {
  if (!botao) return () => {};
  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = textoCarregando;
  return () => {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  };
}
