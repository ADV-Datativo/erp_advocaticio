// modules/usuarios/usuarios.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama Supabase direto.

import * as repository from './usuarios.repository.js';
import * as state from './usuarios.state.js';
import { validarEmailConvite } from './usuarios.validation.js';

/** Carrega usuários + convites e atualiza o estado do submódulo. */
export async function carregarEArmazenarUsuarios() {
  const usuarios = await repository.carregarUsuariosEscritorio();
  state.definirUsuarios(usuarios);
  return usuarios;
}

/** Carrega só os convites e atualiza o estado. */
export async function carregarEArmazenarConvites() {
  const convites = await repository.carregarConvitesPendentes();
  state.definirConvites(convites);
  return convites;
}

/**
 * Envia um convite: valida o e-mail, delega ao repository (Edge
 * Function), e recarrega a lista de convites.
 * @param {{email: string, papel: string}} dados
 */
export async function enviarConvite({ email, papel }) {
  validarEmailConvite(email);
  const resultado = await repository.enviarConvite({ email, papel });
  await carregarEArmazenarConvites();
  return resultado;
}

/** @returns {Promise<boolean>} true se cancelou; já recarrega a lista. */
export async function cancelarConvite(id) {
  const ok = await repository.cancelarConvite(id);
  if (ok) await carregarEArmazenarConvites();
  return ok;
}

/** @returns {Promise<boolean>} true se removeu; já recarrega a lista. */
export async function removerUsuario(id) {
  const ok = await repository.removerUsuarioEscritorio(id);
  if (ok) await carregarEArmazenarUsuarios();
  return ok;
}
