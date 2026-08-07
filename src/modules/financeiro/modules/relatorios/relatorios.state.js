// modules/relatorios/relatorios.state.js
//
// Diferente de Despesas e Recebimentos, Relatórios NÃO tem estado próprio
// de negócio — ele é 100% derivado de dado que pertence a outros dois
// submódulos. Este arquivo só expõe leitura de clientes/processos
// (referência cruzada de exibição, mesmo padrão usado em todo o domínio),
// nunca `store.parcelas` nem `store.despesas` diretamente — esses vêm
// exclusivamente via `financeiro.registry.js`.

let _store = null;

export function conectarStore(storeGlobal) {
  _store = storeGlobal;
}

export function listarClientes() {
  return _store.clientes || [];
}

export function listarProcessos() {
  return _store.processos || [];
}
