// sistema.navigation.js
//
// Mesmo raciocínio já registrado em financeiro.navigation.js e na Etapa 1
// do Operacional: a troca de categoria no menu (toggleNavCategoria,
// abrirCategoriaDaPagina) é genérica a TODAS as categorias, não específica
// de Sistema — não deve ser duplicada/movida para cá.
//
// Dentro de Opções especificamente existe uma sub-navegação por abas
// (Senha/Usuários/Auditoria/WhatsApp/Sistema-Aparência) via switchTab('opt', ...) —
// essa também é genérica (switchTab é compartilhada por proc/opt/fin/rel),
// então também fica de fora daqui. Quando Opções for migrado (submódulo
// futuro), a lógica de QUAL aba abrir por padrão pode entrar em
// opcoes.navigation.js, se esse arquivo vier a existir.

export {};
