// modules/diario-oficial/diario-oficial.events.js
//
// Centraliza os addEventListener deste módulo. Os `onclick="..."` inline
// nos itens de lista (gerados dinamicamente via innerHTML em
// components/lista-publicacoes.js e components/autocomplete-cliente.js)
// NÃO foram convertidos para addEventListener nesta etapa — eliminá-los
// exigiria reescrever a geração de HTML para usar event delegation, o que
// é uma mudança de comportamento maior que "só reorganizar arquitetura" e
// foge do escopo combinado (zero mudança de comportamento). Registrado
// como possível próxima melhoria, não feito agora.
//
// O que este arquivo cobre: o único addEventListener que já existia no
// monólito para este módulo (fechar a caixa de autocomplete ao clicar fora
// dela — linha 7154-7158 do index.html original).

export function registrarEventosGlobais({ onCliqueForaDoAutocomplete }) {
  document.addEventListener('click', (e) => {
    const caixa = document.getElementById('do-sugestoes-cliente');
    const input = document.getElementById('do-busca-cliente');
    if (caixa && !caixa.contains(e.target) && e.target !== input) {
      onCliqueForaDoAutocomplete(caixa);
    }
  });
}
