// modules/despesas/despesas.validation.js

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** Extraído de salvarDespesa original, linha 10730. */
export function validarDespesaForm(form) {
  if (!form.descricao || !form.categoria || !form.valor || !form.vencimento) {
    throw new ValidationError('Preencha Descrição, Categoria, Valor e Vencimento.');
  }
}
