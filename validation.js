// modules/financeiro/validation.js

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valida os campos obrigatórios de uma despesa. Lança ValidationError com
 * mensagem pronta para exibir ao usuário se algo estiver faltando.
 * @param {{descricao: string, categoria: string, valor: number, vencimento: string}} form
 */
export function validarDespesaForm(form) {
  if (!form.descricao || !form.categoria || !form.valor || !form.vencimento) {
    throw new ValidationError('Preencha Descrição, Categoria, Valor e Vencimento.');
  }
}
