// core/errors/repository-error.js
import { AppError } from './app-error.js';

/**
 * Erro de comunicação com a fonte de dados (Supabase). Lançado só pela
 * camada Repository — nunca por Service ou Controller diretamente.
 *
 * Assinatura preservada igual às versões locais que existiam em
 * despesas.repository.js e recebimentos.repository.js:
 * `new RepositoryError(message, cause)` — cause é o erro original do
 * Supabase, não um options object, para não exigir mudança nos pontos
 * de uso já migrados.
 */
export class RepositoryError extends AppError {
  constructor(message, cause) {
    super(message, { cause });
  }
}
