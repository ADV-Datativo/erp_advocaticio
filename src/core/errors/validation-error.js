// core/errors/validation-error.js
import { AppError } from './app-error.js';

/**
 * Erro de dado de entrada inválido (formulário, parâmetro). Lançado só
 * pela camada Validation/Service — nunca pelo Repository.
 *
 * Assinatura compatível com as versões locais existentes:
 * `new ValidationError(message)`.
 */
export class ValidationError extends AppError {
  constructor(message) {
    super(message);
  }
}
