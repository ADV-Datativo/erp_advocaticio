// core/observability/error-tracking.js
//
// Sprint 10 (Observabilidade). Escopo deliberadamente reduzido em
// relação à proposta original do ChatGPT (Tracing, Health, Metrics de
// infraestrutura) — o ADV Easy é SPA estático + Supabase (BaaS), sem
// servidor próprio onde rodar telemetria de infraestrutura. Construir
// isso seria inventar capacidade que a stack não tem.
//
// O que É real e implementável: captura de erro de frontend (JS não
// tratado, Promise rejeitada sem catch), registrado via logger (console)
// E persistido na tabela `auditoria` que já existe — reaproveitando
// infraestrutura real, não criando tabela nova.

import { logger } from '../logger/index.js';
import { registrarAuditoria } from '../audit/audit.js';

let jaInicializado = false;

/**
 * Registra os handlers globais de erro. Chamado uma vez, no carregamento
 * da aplicação (ver error-tracking-bridge.js).
 */
export function iniciarCapturaDeErros() {
  if (jaInicializado) return;
  jaInicializado = true;

  window.addEventListener('error', (evento) => {
    capturarErro(evento.error || evento.message, 'erro_js_nao_tratado');
  });

  window.addEventListener('unhandledrejection', (evento) => {
    capturarErro(evento.reason, 'promise_rejeitada_sem_catch');
  });
}

function capturarErro(erro, tipo) {
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  const stack = erro instanceof Error ? erro.stack : undefined;

  logger.error(mensagem, erro instanceof Error ? erro : undefined, tipo);

  // Persistido na tabela auditoria já existente — sem sessão real
  // (ex: erro na tela de login), registrarAuditoria() já retorna
  // silenciosamente, mesmo comportamento de sempre.
  registrarAuditoria('erro_frontend', 'sistema', mensagem, stack ? stack.slice(0, 500) : null)
    .catch(() => {}); // nunca deixar a captura de erro criar outro erro
}
