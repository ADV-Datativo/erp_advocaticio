// modules/relatorios/relatorios.repository.js
//
// Relatórios não tem nenhuma tabela própria no Supabase — é 100% derivado
// de dado que já pertence a Recebimentos (parcelas) e Despesas
// (despesas). Este arquivo existe só para manter a estrutura padrão do
// domínio consistente entre os 3 submódulos; não tem função nenhuma
// porque não há nada para buscar diretamente do banco aqui.
//
// Se um dia Relatórios precisar de uma agregação pesada demais para
// calcular no cliente (ex: relatório de anos de histórico), a função
// certa entraria aqui como uma RPC do Supabase — não antes disso ser
// necessário de verdade.

export {};
