// modules/seguranca/seguranca.repository.js
// Única camada que fala com o Supabase Auth para troca de senha.
// Extraído do index.html monolítico (linhas 12242-12252).

import { getSB } from '../../../../core/supabase-client.js';
import { RepositoryError } from '../../../../core/errors/index.js';

export { RepositoryError };

/**
 * Confirma a senha atual reautenticando (Supabase Auth não tem um
 * endpoint de "verificar senha sem logar" — reautenticar é a forma
 * padrão de confirmar).
 * @param {string} email @param {string} senhaAtual
 * @returns {Promise<boolean>} true se a senha atual está correta.
 */
export async function confirmarSenhaAtual(email, senhaAtual) {
  const sb = await getSB();
  if (!sb) throw new RepositoryError('Sem conexão com o banco.');
  const { error } = await sb.auth.signInWithPassword({ email, password: senhaAtual });
  return !error;
}

/**
 * @param {string} novaSenha
 * @returns {Promise<void>} lança RepositoryError se falhar.
 */
export async function atualizarSenha(novaSenha) {
  const sb = await getSB();
  if (!sb) throw new RepositoryError('Sem conexão com o banco.');
  const { error } = await sb.auth.updateUser({ password: novaSenha });
  if (error) throw new RepositoryError('Erro ao alterar senha: ' + error.message, error);
}
