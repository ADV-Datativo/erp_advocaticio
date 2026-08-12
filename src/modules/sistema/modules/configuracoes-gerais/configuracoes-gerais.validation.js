// modules/configuracoes-gerais/configuracoes-gerais.validation.js
import { ValidationError } from '../../../../core/errors/index.js';
import { REGEX_HEX, TAMANHO_MAX_LOGO_BYTES } from './configuracoes-gerais.constants.js';

export { ValidationError };

export function corHexValida(valor) {
  return REGEX_HEX.test(valor);
}

/** Extraído de salvarAparencia original, linha 9020. */
export function validarNomeEscritorio(nome) {
  if (!nome) throw new ValidationError('Informe o nome do escritório.');
}

/** Extraído de handleUploadLogo original, linhas 8994-8995. */
export function validarArquivoLogo(file) {
  if (!file.type.startsWith('image/')) throw new ValidationError('Selecione um arquivo de imagem válido.');
  if (file.size > TAMANHO_MAX_LOGO_BYTES) throw new ValidationError('Imagem muito grande. Use um arquivo de até 2MB.');
}
