# 03 — Visual Language

> Conceitos de organização visual, sem desenhar componentes concretos.
> "Cartão" aqui é um conceito de agrupamento de informação, não o
> desenho final de `<Card>` — isso é trabalho da Sprint 4 (Component
> Library), consumindo os tokens definidos na Sprint 2.

## Superfícies

O sistema tem 3 níveis de superfície, cada um comunicando uma relação
diferente com o conteúdo "atrás" dele:

1. **Base** — o fundo da aplicação. Onde tudo repousa.
2. **Elevada** — conteúdo que se destaca do fundo (um cartão, um painel,
   uma linha de tabela em hover). Elevação sutil, nunca dramática — o
   objetivo é diferenciação, não hierarquia teatral.
3. **Flutuante** — conteúdo que interrompe temporariamente o fluxo
   (modal, dropdown, tooltip). É a única superfície que pode sobrepor
   outro conteúdo.

## Cartões (conceito, não componente)

Um cartão agrupa informação que pertence junta e se relaciona como uma
unidade — um resumo financeiro, um item de lista, um card de Kanban.
Regra conceitual: se o conteúdo de dentro de um cartão não faz sentido
sem o resto do cartão, é um cartão de verdade. Se cada linha dentro dele
é independente, provavelmente deveria ser uma tabela, não uma pilha de
cartões.

## Painéis

Um painel é uma área persistente de trabalho — diferente de um cartão
(que é uma unidade de conteúdo), um painel é um espaço de contexto,
geralmente lateral ou fixo (ex: painel de detalhe de um processo aberto
ao lado da lista). Painéis não competem por atenção com o conteúdo
principal — existem para dar contexto sem forçar navegação.

## Hierarquia visual

Três níveis de ênfase, aplicáveis a qualquer contexto (texto, cor, peso):

1. **Primário** — a informação que a tela existe para mostrar (o valor
   de uma parcela, o nome de um cliente numa lista de clientes)
2. **Secundário** — contexto que ajuda a interpretar o primário (data de
   vencimento ao lado do valor, cargo ao lado do nome)
3. **Terciário** — metadado, presente mas nunca competindo por atenção
   (ID interno, timestamp de criação, texto de ajuda)

## Espaçamento (conceito)

Espaço em branco não é ausência de design — é o principal mecanismo de
agrupamento visual antes mesmo de qualquer borda ou cor entrar em cena.
Dois elementos próximos são percebidos como relacionados; elementos
distantes, como independentes. A escala numérica exata (4px, 8px, 16px
etc.) é decisão da Sprint 2 (Design Tokens) — aqui só fixamos o
princípio: espaçamento é hierarquia, não preenchimento.

## Organização visual geral

Do mais amplo ao mais específico, toda tela segue a mesma lógica de
zoom: **contexto → grupo → item → detalhe**. Uma tela nunca pula direto
de contexto pra detalhe sem passar pelos níveis intermediários — é assim
que o usuário nunca se sente perdido ao entrar numa tela nova do
sistema, porque a lógica espacial é sempre a mesma.
