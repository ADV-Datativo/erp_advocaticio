// modules/seguranca/seguranca.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama Supabase direto.

import * as repository from './seguranca.repository.js';
import { validarNovaSenha, ValidationError } from './seguranca.validation.js';
import { FORCA_SENHA_CORES, FORCA_SENHA_LABELS } from './seguranca.constants.js';

/**
 * Calcula a força de uma senha (extraído de avaliarForcaSenha original,
 * linhas 12213-12217 — só o cálculo, sem tocar no DOM).
 * @param {string} v
 * @returns {{score: number, cor: string, label: string} | null} null se `v` vazio (esconder o indicador)
 */
export function calcularForcaSenha(v) {
  if (!v) return null;
  let score = 0;
  if (v.length >= 6) score++;
  if (v.length >= 10) score++;
  if (/[A-Z]/.test(v) && /[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  if (score === 0) return { score: 0, cor: FORCA_SENHA_CORES[0], label: FORCA_SENHA_LABELS[0] };
  return { score, cor: FORCA_SENHA_CORES[score - 1], label: FORCA_SENHA_LABELS[score - 1] };
}

/**
 * Orquestra a troca de senha completa: valida, confirma a senha atual
 * (reautenticando), e só então atualiza.
 * @param {{atual: string, nova: string, confirmar: string, email: string}} dados
 */
export async function alterarSenha({ atual, nova, confirmar, email }) {
  validarNovaSenha({ atual, nova, confirmar });

  if (!email) throw new ValidationError('Sessão inválida. Faça login novamente.');

  const senhaAtualCorreta = await repository.confirmarSenhaAtual(email, atual);
  if (!senhaAtualCorreta) throw new ValidationError('Senha atual incorreta.');

  await repository.atualizarSenha(nova);
}
