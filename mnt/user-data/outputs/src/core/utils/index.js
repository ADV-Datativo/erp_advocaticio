// core/utils/index.js
//
// Utilitários genuinamente compartilhados entre módulos (não específicos
// de nenhum domínio). Está vazio de propósito nesta etapa: o monólito já
// tem fmtMoney, fmtDate, diffDays, isVencido etc., e movê-los pra cá sem
// auditar CADA regra de formatação existente arrisca introduzir um
// mismatch sutil de comportamento — exatamente o que esta etapa proíbe.
//
// Quando um módulo migrado precisar de um desses utilitários hoje, o
// padrão correto é INJETAR a função do monólito via dependência (como já
// fazemos em recebimentos/index.js, despesas/index.js), não duplicar a
// lógica aqui. Este arquivo é o lugar certo para quando uma função for
// deliberadamente extraída e auditada — não antes.

export {};
