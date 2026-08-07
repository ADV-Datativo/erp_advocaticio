// financeiro.constants.js
//
// Só o que é genuinamente compartilhado por mais de um submódulo do
// domínio. A maior parte das constantes (DESP_CATEGORIAS, DESP_STATUS,
// STATUS_PARCELA etc.) pertence a um submódulo específico e vive dentro
// dele — ver modules/despesas/despesas.constants.js.

export const SUBMODULOS_FINANCEIRO = Object.freeze(['recebimentos', 'despesas', 'relatorios']);
