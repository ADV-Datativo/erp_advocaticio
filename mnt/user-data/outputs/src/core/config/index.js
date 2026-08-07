// core/config/index.js
//
// Configuração compartilhada entre módulos. Hoje o sistema não tem
// nenhuma configuração verdadeiramente global fora do que já vive em
// core/supabase-client.js (SB_URL/SB_ANON) — este arquivo existe para
// centralizar o que for configuração cross-domain no futuro (ex:
// feature flags globais, URLs de serviço externo, timeouts padrão),
// sem cada módulo inventar sua própria forma de guardar isso.

const config = {
  // Exemplo de formato esperado, sem valores reais ainda:
  // featureFlags: { novoModuloRelatorios: false },
  // timeouts: { requisicaoSupabaseMs: 10000 }
};

/**
 * @param {string} chave ex: 'featureFlags.novoModuloRelatorios'
 * @param {*} [padrao] valor se a chave não existir
 */
export function obterConfig(chave, padrao) {
  return chave.split('.').reduce((acc, parte) => (acc == null ? acc : acc[parte]), config) ?? padrao;
}

/** @param {string} chave @param {*} valor */
export function definirConfig(chave, valor) {
  const partes = chave.split('.');
  const ultima = partes.pop();
  const alvo = partes.reduce((acc, parte) => (acc[parte] ??= {}), config);
  alvo[ultima] = valor;
}
