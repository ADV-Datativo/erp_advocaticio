// modules/processos/processos.validation.js
import { ValidationError } from '../../../../core/errors/index.js';

export { ValidationError };

/** Extraído de salvarProcesso original, linha 13010. */
export function validarProcesso({ numero, clienteId, tipoId }) {
  if (!numero || !clienteId || !tipoId) {
    throw new ValidationError('Preencha todos os campos obrigatórios.');
  }
}
