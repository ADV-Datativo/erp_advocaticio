// modules/intimacoes/intimacoes.validation.js
import { ValidationError } from '../../../../core/errors/index.js';

export { ValidationError };

/** Extraído de salvarIntimacao original, linha 14221. */
export function validarIntimacao({ tipo, data }) {
  if (!tipo || !data) throw new ValidationError('Preencha o tipo e a data da intimação.');
}
