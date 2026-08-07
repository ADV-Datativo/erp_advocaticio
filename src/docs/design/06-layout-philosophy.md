# 06 — Layout Philosophy

> Estrutura de página, não componentes. "Cabeçalho" aqui é um conceito
> de zona da tela, não o desenho de um componente `<Header>` (isso é
> Sprint 4/5). Este documento também não substitui a Sprint 5 (Layout
> Engine) — ele é a filosofia que o Layout Engine vai implementar.

## Estrutura de página padrão
Toda tela do sistema (com raras exceções documentadas por que fogem à
regra — ex: tela de login, que é pré-sistema) segue a mesma divisão
espacial:

1. **Barra lateral** — navegação persistente entre domínios (Financeiro,
   Operacional, Sistema...). Sempre no mesmo lugar, sempre com a mesma
   largura relativa, para que a posição vire memória muscular
2. **Cabeçalho de página** — identifica onde o usuário está e oferece a
   ação primária daquele contexto (ex: "+ Nova Despesa")
3. **Área de trabalho** — o conteúdo principal da tela. É onde a maior
   parte da densidade de informação mora
4. **Painel contextual (opcional)** — quando existe, mostra detalhe sem
   forçar navegação para outra tela (ver conceito de "painel" em
   `03-visual-language.md`)

## Áreas de trabalho
Dentro da área de trabalho, a densidade de informação varia por domínio
de propósito, não por preferência estética:
- **Telas de listagem** (Processos, Clientes, Despesas) — densas,
  priorizam quantidade de dado visível de uma vez
- **Telas de formulário** (cadastro, edição) — espaçosas, priorizam
  clareza de campo e redução de erro de preenchimento
- **Telas de visão geral** (Dashboard, Relatórios) — hierárquicas,
  priorizam os números mais importantes em destaque, detalhe disponível
  mas não competindo por atenção

## Barra lateral
Fixa, persistente, categorizada por domínio (o mesmo agrupamento que já
guia a arquitetura de código: Financeiro, Operacional, Sistema...). A
estrutura de navegação visual espelha a estrutura de domínio real do
sistema — não são independentes uma da outra.

## Cabeçalhos
Cada tela tem exatamente um cabeçalho, com uma responsabilidade clara:
dizer onde o usuário está e o que ele pode fazer de mais importante ali.
Cabeçalho nunca compete com o conteúdo da área de trabalho por
densidade de informação — ele é mais leve, propositalmente.

## Conteúdo
Regra geral de largura: conteúdo de leitura (formulários, textos) tem
largura máxima confortável de leitura, mesmo em telas grandes — nunca se
estica até a borda da tela só porque há espaço. Conteúdo tabular/denso
(tabelas, dashboards) pode usar a largura inteira disponível, porque
densidade é o objetivo ali.

## Responsividade
O sistema já tem um padrão mobile parcialmente implementado (bottom nav
+ drawer, corrigido recentemente na sessão que resolveu o bug da faixa
preta). A filosofia de responsividade não é "encolher a versão desktop"
— é reconhecer que mobile e desktop têm padrões de uso diferentes
(mobile: consulta rápida, ação pontual; desktop: trabalho sustentado,
múltiplas telas abertas mentalmente). A hierarquia de informação pode
mudar entre os dois, não só o tamanho dos elementos.

## Relação com a Sprint 5 (Layout Engine)
Este documento é a decisão de "o quê" e "por quê". A Sprint 5 decide "com
o quê" tecnicamente (grid system, breakpoints exatos, mecanismo de
composição de layout) — consumindo os tokens da Sprint 2 e os
componentes da Sprint 4.
