// modules/diario-oficial/diario-oficial.validation.js

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valida os campos obrigatórios de uma publicação (extraído de
 * salvarPublicacao original, linhas 7210-7211).
 * @param {{data: string, conteudo: string}} form
 */
export function validarPublicacaoForm(form) {
  if (!form.data) throw new ValidationError('Informe a data da publicação.');
  if (!form.conteudo) throw new ValidationError('Cole o texto da publicação.');
}
