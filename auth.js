// core/auth.js
// Leitura da sessão local (definida no login). Não faz chamada de rede.

const LOGIN_KEY = 'lexpro_auth';

/** @returns {object} a sessão atual, ou {} se não houver nenhuma. */
export function getSessao() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

/** @returns {string|null} ID do escritório do usuário logado. */
export function getEscritorioId() {
  return getSessao().escritorio_id || null;
}
