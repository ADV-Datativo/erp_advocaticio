// modules/seguranca/seguranca.validation.js
import { ValidationError } from '../../../../core/errors/index.js';
import { TAMANHO_MINIMO_SENHA } from './seguranca.constants.js';

export { ValidationError };

/** Extraído de alterarSenha original, linhas 12232-12240. */
export function validarNovaSenha({ atual, nova, confirmar }) {
  if (!atual || !nova || !confirmar) {
    throw new ValidationError('Preencha todos os campos.');
  }
  if (nova.length < TAMANHO_MINIMO_SENHA) {
    throw new ValidationError(`A nova senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
  }
  if (nova !== confirmar) {
    throw new ValidationError('A nova senha e a confirmação não coincidem.');
  }
}
