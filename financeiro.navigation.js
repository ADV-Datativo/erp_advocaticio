// financeiro.navigation.js
//
// Diferente do que o nome poderia sugerir, hoje não existe navegação
// interna a centralizar aqui: Recebimentos ("financeiro"), Despesas
// ("despesas") e Relatórios ("relatorios") são 3 PÁGINAS separadas no
// menu (PAGINA_CATEGORIA, ainda no monólito), não abas dentro de uma
// mesma tela. A troca entre elas já é coberta pela navegação genérica do
// sistema (navigate(), toggleNavCategoria()), que é compartilhada por
// TODAS as categorias do menu — não é específica de Financeiro, então não
// deve ser duplicada/movida para cá (mesmo raciocínio já registrado na
// Etapa 1 do Operacional).
//
// Este arquivo existe para manter a estrutura padrão do domínio e fica
// como o lugar certo caso, no futuro, os 3 submódulos passem a viver
// dentro de uma única tela com abas internas — aí sim a lógica de troca
// de aba entraria aqui.

export {};
