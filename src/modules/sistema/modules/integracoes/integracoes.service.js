// modules/integracoes/integracoes.service.js
// Regra de negócio pura. Nunca toca DOM, nunca chama localStorage direto.

import * as repository from './integracoes.repository.js';
import { DADOS_AMOSTRA_PREVIEW } from './integracoes.constants.js';

/** Carrega a config salva. */
export function carregarConfig() {
  return repository.obterConfig();
}

/** @param {object} dadosForm */
export function salvarConfig(dadosForm) {
  repository.salvarConfig(dadosForm);
}

/**
 * Monta o preview da mensagem de cobrança com dado de amostra (extraído
 * de renderPreviewWpp original, linhas 10490-10499).
 * @param {object} cfg @param {string} templatePadrao @param {string} nomeEscritorio
 */
export function montarPreviewCobranca(cfg, templatePadrao, nomeEscritorio) {
  const msg = cfg.msg || templatePadrao;
  const a = DADOS_AMOSTRA_PREVIEW;
  return msg
    .replace(/{{NOME}}/g, a.nome)
    .replace(/{{PROCESSO}}/g, a.processo)
    .replace(/{{PARCELA}}/g, a.parcela)
    .replace(/{{VALOR}}/g, a.valor)
    .replace(/{{VENCIMENTO}}/g, a.vencimento)
    .replace(/{{PIX}}/g, cfg.pix || 'sua-chave-pix')
    .replace(/{{TITULAR}}/g, cfg.pixTitular || nomeEscritorio)
    .replace(/{{ESCRITORIO}}/g, nomeEscritorio);
}

/**
 * Monta o preview da mensagem de recibo com dado de amostra (extraído
 * de mostrarPreviewWpp original, linhas 10471-10477).
 * @param {object} cfg @param {string} templatePadrao @param {string} nomeEscritorio
 */
export function montarPreviewRecibo(cfg, templatePadrao, nomeEscritorio) {
  const msg = cfg.msgRecibo || templatePadrao;
  const a = DADOS_AMOSTRA_PREVIEW;
  return msg
    .replace(/{{NOME}}/g, a.nome)
    .replace(/{{PROCESSO}}/g, a.processo)
    .replace(/{{PARCELA}}/g, a.parcela)
    .replace(/{{VALOR}}/g, a.valor)
    .replace(/{{DATA_PAGAMENTO}}/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/{{ESCRITORIO}}/g, nomeEscritorio);
}
