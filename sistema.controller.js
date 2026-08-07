// sistema.controller.js
// Único ponto de entrada externo para o domínio Sistema. Não conhece
// detalhes internos de Mensagens/Informativos/Opções — só pede ao
// Registry e repassa. Mesmo padrão de financeiro.controller.js.

import { apiDoSubmodulo, estaMigrado } from './sistema.registry.js';

/**
 * @param {'mensagens'|'informativos'|'opcoes'} submodulo
 * @returns {object|null}
 */
export function pedirApiDoSubmodulo(submodulo) {
  if (!estaMigrado(submodulo)) {
    console.info(`[sistema.controller] "${submodulo}" ainda não migrado.`);
    return null;
  }
  return apiDoSubmodulo(submodulo);
}
