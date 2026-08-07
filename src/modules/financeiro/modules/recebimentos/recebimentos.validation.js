// modules/recebimentos/recebimentos.validation.js

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** Extraído de confirmarPagamento original, linha 13571. */
export function validarSelecaoParcela(id) {
  if (!id) throw new ValidationError('Selecione uma parcela.');
}

/** Extraído de confirmarReagendar original, linha 14464. */
export function validarReagendamento(novaData) {
  if (!novaData) throw new ValidationError('Informe a nova data de vencimento.');
}

/** Extraído de confirmarDA original, linha 14523. */
export function validarAjusteValor(input) {
  if (!input) throw new ValidationError('Informe o valor do desconto ou acréscimo.');
}

/** Extraído de gerarParcelasManual original, linhas 9886-9888. */
export function validarGeracaoManual({ processoId, valor, data1 }) {
  if (!processoId) throw new ValidationError('Selecione um processo.');
  if (!valor) throw new ValidationError('Informe o valor total.');
  if (!data1) throw new ValidationError('Informe a data da 1ª parcela.');
}
