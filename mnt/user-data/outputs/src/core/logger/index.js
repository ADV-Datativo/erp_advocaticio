// core/logger/index.js
//
// Encapsula console.*. Nenhum módulo deve chamar console.log/warn/error
// diretamente a partir de agora — sempre logger.info/warn/error/audit.
//
// Hoje só repassa para console com um prefixo de origem, mas existir como
// ponto único é o que permite, no futuro, trocar o destino (enviar pra um
// serviço de log real, filtrar por ambiente, desligar em produção etc.)
// sem tocar em nenhum módulo que já usa o logger.

function formatar(origem, mensagem) {
  return origem ? `[${origem}] ${mensagem}` : mensagem;
}

export const logger = {
  /** @param {string} mensagem @param {string} [origem] ex: 'despesas.repository' */
  info(mensagem, origem) {
    console.info(formatar(origem, mensagem));
  },

  /** @param {string} mensagem @param {string} [origem] */
  warn(mensagem, origem) {
    console.warn(formatar(origem, mensagem));
  },

  /**
   * @param {string} mensagem
   * @param {Error} [erro] causa original, se houver
   * @param {string} [origem]
   */
  error(mensagem, erro, origem) {
    console.error(formatar(origem, mensagem), erro || '');
  },

  /**
   * Log de auditoria — ação de negócio relevante (não confundir com
   * `registrarAuditoria()` do monólito, que grava no banco para o usuário
   * ver na tela de Auditoria; isto aqui é log técnico de desenvolvimento).
   * @param {string} mensagem @param {object} [detalhe]
   */
  audit(mensagem, detalhe) {
    console.info(formatar('audit', mensagem), detalhe || '');
  }
};
