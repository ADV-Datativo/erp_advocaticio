# 07 — Navigation

> Padrões de navegação, como conceito. O desenho final de menu,
> breadcrumb e abas é trabalho da Component Library (Sprint 4) — este
> documento decide o comportamento esperado, não a aparência.

## Menu principal (barra lateral)
- Categorizado por domínio, nunca por página isolada solta fora de
  categoria (mesmo princípio já usado na arquitetura de código —
  navegação visual e arquitetura de domínio contam a mesma história)
- No máximo um nível de agrupamento (categoria → página). Um segundo
  nível de aninhamento é sinal de que a categorização em si precisa ser
  revista, não que o menu precisa de mais profundidade
- Categoria ativa sempre visualmente distinguível sem ambiguidade —
  usuário nunca deveria precisar clicar para descobrir "onde eu estou"

## Breadcrumb
Usado só quando a profundidade de navegação real justifica (ex: dentro
do detalhe de um processo específico) — não é decoração obrigatória em
toda tela. Regra: se a barra lateral já deixa claro onde o usuário está,
breadcrumb é redundante e não deve ser forçado.

## Abas
Usadas para dividir um mesmo contexto de dado em visões diferentes (ex:
dentro de Financeiro: Visão Geral / Parcelas / Lançar Pagamento — já
existe no sistema hoje). Não usadas para navegação entre domínios
diferentes — isso é papel do menu principal, não de abas.

## Navegação interna (dentro de uma tela)
Ações que abrem detalhe sem trocar de contexto amplo (ex: abrir detalhe
de um processo a partir da listagem) preferem painel contextual a
navegação de página inteira, sempre que a tarefa permitir manter o
usuário orientado no lugar onde ele já estava — reduz o custo de "vai e
volta" para tarefas rápidas.

## Fluxo entre telas
Toda transição de tela iniciada por uma ação do usuário precisa ter
caminho de volta óbvio — nunca deixar o usuário numa tela sem noção
clara de como retornar ao contexto anterior. Isso vale tanto para
navegação normal quanto para fluxos de várias etapas (ex: cadastro de
processo com múltiplos passos).

## Estado de navegação e URL
Fora de escopo definir aqui se o sistema usa roteamento por URL (hoje
não usa — é uma SPA de página única com `store` controlando qual "page"
está visível). Essa é decisão técnica que cabe à Sprint 5 (Layout
Engine) ou além, não a este documento de filosofia.
