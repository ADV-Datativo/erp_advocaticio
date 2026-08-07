// modules/mensagens/mensagens.events.js
//
// Nenhum addEventListener próprio no original — a caixa de mensagem é
// enviada por botão (onclick), não por Enter/submit. Arquivo mantido pela
// estrutura padrão do domínio.
//
// Candidato futuro: emitir 'mensagens:nao-lidas-mudou' no barramento de
// Sistema (sistema.events.js) sempre que atualizarBadge rodar, para um
// componente de notificação compartilhado entre Mensagens e Informativos
// escutar — não implementado nesta etapa (mudaria comportamento).

export {};
