// core/errors/app-error.js
// Toda exception própria do sistema herda daqui. Nunca instanciada
// diretamente — sempre uma das subclasses abaixo.

export class AppError extends Error {
  /**
   * @param {string} message mensagem pronta para exibir ao usuário
   * @param {{cause?: Error, code?: string}} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.cause = options.cause;
    this.code = options.code;
  }
}
