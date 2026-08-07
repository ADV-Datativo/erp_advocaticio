// core/errors/index.js
// Ponto único de import. Qualquer módulo que precise de erro tipado
// importa daqui, nunca dos arquivos individuais diretamente.
//
// import { RepositoryError, ValidationError } from '.../core/errors/index.js';

export { AppError } from './app-error.js';
export { RepositoryError } from './repository-error.js';
export { ValidationError } from './validation-error.js';
export { BusinessRuleError } from './business-rule-error.js';
export { AuthorizationError } from './authorization-error.js';
