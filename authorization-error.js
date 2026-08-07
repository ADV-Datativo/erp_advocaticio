// core/errors/authorization-error.js
import { AppError } from './app-error.js';

/**
 * Erro de permissão negada — usuário autenticado, mas sem permissão para
 * a ação. Preparado para quando o sistema de permissões por perfil
 * (PERFIS, hoje só controla visibilidade de menu) evoluir para também
 * bloquear ações na camada de Service/Controller.
 *
 * Ainda não utilizada por nenhum módulo migrado.
 */
export class AuthorizationError extends AppError {
  constructor(message, options) {
    super(message, options);
  }
}
