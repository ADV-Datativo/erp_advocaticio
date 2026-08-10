// core/ui/loader/loader.js
//
// Quinto componente da Component Library (Sprint 4, Onda 1). Achado na
// auditoria: 15 lugares (14 no monólito + 1 em Diário Oficial, já
// migrado) usam só o texto "Carregando..." como placeholder de loading,
// sem nenhum spinner visual — e o único spinner de verdade do sistema
// (tela de sincronização inicial) tem a animação @keyframes definida
// via <style> inline dentro de uma função JS, em vez de reaproveitável.
//
// Este componente consolida os dois: fornece um spinner pequeno pra
// estado "local" (dentro de uma lista/painel carregando) e garante que
// a animação @keyframes só é injetada uma vez no documento, não
// duplicada a cada uso.

import { theme } from '../../theme/tokens/index.js';

let keyframeInjetado = false;

function garantirKeyframe() {
  if (keyframeInjetado || document.getElementById('datativo-spinner-keyframe')) {
    keyframeInjetado = true;
    return;
  }
  const style = document.createElement('style');
  style.id = 'datativo-spinner-keyframe';
  style.textContent = '@keyframes datativoSpin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
  keyframeInjetado = true;
}

/**
 * Spinner pequeno, para estado de carregamento LOCAL (dentro de uma
 * lista, painel ou área específica — ver docs/design/08-feedback.md,
 * distinção local x global). Para o loading GLOBAL de tela cheia, o
 * `mostrarLoadingDB()` do monólito continua sendo o certo — é caso
 * único (sincronização inicial), não vale abstrair mais que isso.
 *
 * @param {{tamanho?: number, cor?: string}} [props]
 * @returns {string} HTML do spinner, pronto pra inserir no lugar de um
 *   texto "Carregando...".
 */
export function renderSpinner({ tamanho = 24, cor = theme.colors.primary[600] } = {}) {
  garantirKeyframe();
  const espessura = Math.max(2, Math.round(tamanho / 8));
  return `<div style="width:${tamanho}px;height:${tamanho}px;border:${espessura}px solid ${theme.colors.neutral[200]};border-top-color:${cor};border-radius:50%;animation:datativoSpin 0.8s linear infinite;display:inline-block"></div>`;
}

/**
 * Bloco de carregamento centralizado — substitui diretamente o padrão
 * `<div style="text-align:center;color:var(--text-muted);padding:40px">Carregando...</div>`
 * já usado 15 vezes pelo sistema.
 * @param {{mensagem?: string, tamanho?: number}} [props]
 */
export function renderLoadingBloco({ mensagem = 'Carregando...', tamanho = 28 } = {}) {
  return `<div style="text-align:center;padding:${theme.spacing[8]};display:flex;flex-direction:column;align-items:center;gap:${theme.spacing[3]}">
    ${renderSpinner({ tamanho })}
    <span style="color:var(--text-muted);font-size:${theme.typography.fontSize.sm}">${mensagem}</span>
  </div>`;
}
