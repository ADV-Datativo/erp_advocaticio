// modules/usuarios/usuarios.validation.js
import { ValidationError } from '../../../../core/errors/index.js';

export { ValidationError };

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Extraído de enviarConvite original, linha 12102. */
export function validarEmailConvite(email) {
  if (!email || !REGEX_EMAIL.test(email)) {
    throw new ValidationError('Informe um e-mail válido.');
  }
}
