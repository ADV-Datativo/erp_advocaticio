// modules/informativos/informativos.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama Supabase direto.

import * as repository from './informativos.repository.js';
import * as state from './informativos.state.js';

/** Carrega os informativos do banco e atualiza o estado do submódulo. */
export async function carregarEArmazenarInformativos(today) {
  const informativos = await repository.carregarInformativos(today);
  state.definirInformativos(informativos);
  return informativos;
}

/** @returns {number} quantidade de informativos não lidos. */
export function contarNaoLidos(informativos) {
  return (informativos || []).filter((i) => !i.lido).length;
}

/**
 * Marca um informativo como lido: grava no banco, e só atualiza o
 * estado local se a gravação deu certo (mesmo comportamento original).
 * @returns {Promise<object|null>} o informativo atualizado, ou null se falhou.
 */
export async function marcarComoLido(id) {
  const ok = await repository.marcarInformativoLido(id);
  if (!ok) return null;
  return state.marcarComoLidoNaLista(id);
}

/** @returns {Promise<string|null>} URL assinada do anexo, ou null. */
export async function obterUrlAnexo(path) {
  return repository.obterUrlAnexoInformativo(path);
}
