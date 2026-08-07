// core/errors/business-rule-error.js
import { AppError } from './app-error.js';

/**
 * Erro de violação de regra de negócio que não é simples validação de
 * formulário (ex: "não é possível excluir processo com parcelas pagas").
 * Diferença de ValidationError: ValidationError é sobre o formato do
 * dado; BusinessRuleError é sobre uma regra do domínio que impede a
 * operação mesmo com dado bem formado.
 *
 * Ainda não utilizada por nenhum módulo migrado — infraestrutura
 * disponível para quando um caso real surgir.
 */
export class BusinessRuleError extends AppError {
  constructor(message, options) {
    super(message, options);
  }
}
