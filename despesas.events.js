// modules/despesas/despesas.events.js
//
// Nenhum addEventListener específico de Despesas existe hoje no monólito
// — toda interação passa por onclick="..." nos botões (Pagar/Editar/
// Excluir), já cobertos pelo controller via os globais registrados em
// index.js. Este arquivo fica como o lugar certo para isso, caso
// addEventListener seja adotado no futuro (ver limitação já registrada
// no README do Diário Oficial sobre onclick gerado dinamicamente).
//
// Também é onde o submódulo, quando Relatórios for migrado, vai emitir
// eventos via financeiro.events.js (ex: 'despesa:paga') para que
// Relatórios saiba recalcular sem que os dois se conheçam diretamente.

import { emitir } from '../../financeiro.events.js';

/** Chamado pelo controller depois de confirmar pagamento com sucesso. */
export function notificarDespesaPaga(despesa) {
  emitir('despesa:paga', despesa);
}
