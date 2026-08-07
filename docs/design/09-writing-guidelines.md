# 09 — Writing Guidelines

> Padronização de texto da interface (UX writing), consistente com a
> personalidade definida em `01-brand-principles.md`: sóbria, precisa,
> confiante, discreta.

## Princípios gerais
- **Direto, nunca prolixo.** Um botão diz "Salvar", não "Clique aqui
  para salvar as informações"
- **Específico, nunca genérico.** Mensagem de erro diz o que precisa
  mudar, não só que algo deu errado
- **Tom profissional, nunca informal demais.** O produto é usado por
  advogados em contexto de trabalho sério — sem gírias, sem excesso de
  emoji (os que já existem no sistema hoje são usados como marcador
  visual funcional — ex: ✅ para pago — não como tom de voz descontraído)
- **Português claro, sem jargão técnico desnecessário.** "Sincronizado"
  em vez de "persistido no banco"; "Não foi possível salvar" em vez de
  "Erro 500"

## Títulos
Título de tela: substantivo direto, sem artigo (ex: "Despesas", não "As
Despesas" nem "Gerenciar Despesas"). Título de modal: verbo de ação
quando é uma ação (ex: "Nova Despesa", "Editar Cliente"), substantivo
quando é visualização (ex: "Detalhe do Processo").

## Botões
- Ação primária: verbo no infinitivo ou substantivo de ação curto
  ("Salvar", "Excluir", "+ Nova Despesa")
- Nunca usar "OK"/"Confirmar" genérico quando um verbo específico cabe
  ("Excluir despesa" é melhor que "Confirmar" num modal de exclusão)
- Botão de cancelar/fechar sempre com o mesmo texto em todo o sistema
  ("Cancelar")

## Mensagens (toast, confirmações)
- Sucesso: confirma o que aconteceu, específico ao objeto ("Despesa
  cadastrada!", não "Sucesso!")
- Recorrência (ex: despesa recorrente criando várias parcelas): informa
  quantidade quando relevante ("3 despesas criadas!")

## Textos de erro
- Sempre dizem o que fazer para corrigir, não só o que está errado
  ("Preencha Descrição, Categoria, Valor e Vencimento." em vez de
  "Formulário inválido")
- Erro técnico (falha de rede, erro do servidor) traduzido para
  linguagem que o usuário entende, sem esconder que algo real falhou
  ("Erro ao salvar. Verifique sua conexão." em vez de expor stack trace
  ou código de erro cru — quando o erro tiver detalhe técnico relevante,
  ele pode aparecer, mas nunca como única informação)

## Confirmações de ação destrutiva
Texto específico à ação e ao objeto, nunca genérico:
- "Excluir esta despesa?" — não "Tem certeza?"
- Quando a consequência não é óbvia, ela é dita explicitamente ("Esta
  ação não pode ser desfeita.")

## Capitalização
Português padrão (só a primeira palavra maiúscula), nunca Title Case
importado do inglês — "Nova despesa", não "Nova Despesa" — **exceção**:
nomes próprios do sistema (Financeiro, Recebimentos) que já funcionam
como rótulos de categoria/domínio, esses mantêm maiúscula inicial por
serem nomes, não frases.
