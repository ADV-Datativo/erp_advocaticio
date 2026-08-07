// core/constants/index.js
//
// Constantes genuinamente globais (usadas por mais de um domínio). Vazio
// nesta etapa — a auditoria dos domínios já migrados (Financeiro,
// Operacional/Diário Oficial) não encontrou nenhuma constante realmente
// cross-domain ainda; cada uma pertence a um submódulo específico (ex:
// DESP_CATEGORIAS é só de Despesas, STATUS_PUBLICACAO só de Diário
// Oficial). Quando uma constante precisar ser usada por 2+ domínios de
// verdade, ela migra pra cá.

export {};
