// financeiro.controller.js
//
// Único ponto de entrada externo para o domínio Financeiro. Não conhece
// detalhes internos de Recebimentos/Despesas/Relatórios — só sabe pedir
// coisas ao Registry e repassar. Hoje (Etapa Despesas) ainda não há
// nenhuma orquestração cross-submódulo real acontecendo — isso começa a
// valer a partir da migração de Relatórios, que precisa de dado dos
// outros dois. Por enquanto este arquivo existe para já fixar o formato
// que o resto do domínio vai seguir.

import { apiDoSubmodulo, estaMigrado } from './financeiro.registry.js';

/**
 * @param {'recebimentos'|'despesas'|'relatorios'} submodulo
 * @returns {object|null} a API pública do submódulo, se já migrado.
 */
export function pedirApiDoSubmodulo(submodulo) {
  if (!estaMigrado(submodulo)) {
    console.info(`[financeiro.controller] "${submodulo}" ainda não migrado — quem chamou deve usar o fallback do monólito.`);
    return null;
  }
  return apiDoSubmodulo(submodulo);
}
