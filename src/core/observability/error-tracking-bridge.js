// core/observability/error-tracking-bridge.js
// Inicializa a captura de erros assim que o módulo carrega — não
// precisa expor nada em window, é auto-contido.

import { iniciarCapturaDeErros } from './error-tracking.js';

iniciarCapturaDeErros();
console.info('[error-tracking] captura de erros de frontend ativa');
