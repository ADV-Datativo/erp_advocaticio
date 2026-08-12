// modules/configuracoes-gerais/configuracoes-gerais.state.js
// Substitui window._apLogoTemp (estado transitório de upload de logo,
// antes de salvar) — confirmado que só era usado dentro deste cluster
// de funções, seguro migrar pra estado local do módulo.
//
// Os 3 estados possíveis (mesma semântica do original):
//   undefined = nenhum upload/remoção nesta sessão de edição (mantém o que já estava salvo)
//   uma string base64 = novo upload pendente de salvar
//   null = remoção pendente de salvar

let logoTemp;

export function definirLogoTemp(valor) {
  logoTemp = valor;
}

export function obterLogoTemp() {
  return logoTemp;
}

export function limparLogoTemp() {
  logoTemp = undefined;
}
