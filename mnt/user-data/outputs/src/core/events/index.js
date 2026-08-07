// core/events/index.js
//
// Barramento de eventos genérico, para comunicação desacoplada entre
// QUALQUER módulo do sistema (cross-domain — ex: Financeiro avisando
// Processos, Operacional avisando Dashboard).
//
// Diferente de financeiro.events.js, que é um barramento escopado só aos
// submódulos de um domínio (Recebimentos/Despesas/Relatórios entre si).
// Os dois podem coexistir: um domínio usa seu barramento interno para
// comunicação entre seus próprios submódulos, e usa este EventBus do
// Core quando precisa avisar algo para FORA do domínio. Nenhum domínio
// existente foi religado para usar este EventBus ainda — é
// infraestrutura pronta, não uma migração.

class EventBus {
  constructor() {
    this._listeners = new Map(); // nome do evento -> Set<function>
  }

  /** @param {string} nome @param {(detalhe: any) => void} callback */
  on(nome, callback) {
    if (!this._listeners.has(nome)) this._listeners.set(nome, new Set());
    this._listeners.get(nome).add(callback);
    return () => this.off(nome, callback); // conveniência: on() retorna a função de unsubscribe
  }

  /** @param {string} nome @param {(detalhe: any) => void} callback */
  off(nome, callback) {
    this._listeners.get(nome)?.delete(callback);
  }

  /**
   * Escuta só a próxima ocorrência do evento, depois se desregistra sozinho.
   * @param {string} nome @param {(detalhe: any) => void} callback
   */
  once(nome, callback) {
    const wrapper = (detalhe) => {
      this.off(nome, wrapper);
      callback(detalhe);
    };
    this.on(nome, wrapper);
  }

  /** @param {string} nome @param {any} [detalhe] */
  emit(nome, detalhe) {
    this._listeners.get(nome)?.forEach((callback) => callback(detalhe));
  }
}

/** Instância única compartilhada por todo o sistema. */
export const eventBus = new EventBus();
