// modules/relatorios/relatorios.events.js
//
// Relatórios poderia escutar 'despesa:paga' (emitido por Despesas, ver
// despesas.events.js) para se recalcular automaticamente. NÃO fizemos
// essa religação nesta etapa — o comportamento original nunca teve
// auto-refresh (o usuário só vê dado atualizado ao reabrir/re-filtrar a
// aba de Relatórios), e adicionar isso agora seria uma mudança de
// comportamento visível, fora do que foi pedido ("não altere
// funcionalidades"). Fica documentado como oportunidade futura.

export {};
