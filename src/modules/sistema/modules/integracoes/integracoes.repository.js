// modules/integracoes/integracoes.repository.js
// Única camada que fala com o localStorage pra config de WhatsApp.
//
// ACHADO JÁ REGISTRADO (não corrigido nesta migração): essa config só
// existe em localStorage — não sincroniza entre dispositivos do mesmo
// escritório. Decisão de corrigir isso fica pro Renan (mesma categoria
// do achado sobre cores/logo de Aparência). Preservado exatamente como
// estava, sem alteração de comportamento.

import { WPP_KEY } from './integracoes.constants.js';

/** @returns {object} config salva, ou objeto vazio se nunca configurado. */
export function obterConfig() {
  try {
    return JSON.parse(localStorage.getItem(WPP_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

/** @param {object} cfg */
export function salvarConfig(cfg) {
  localStorage.setItem(WPP_KEY, JSON.stringify(cfg));
}
