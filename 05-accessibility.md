# 05 — Accessibility

> Requisitos, não aspirações. Tudo aqui é não-negociável (ver
> `02-design-principles.md`, princípio 7) e vale desde o primeiro
> componente construído na Sprint 4, não como auditoria posterior.

## Nível de conformidade alvo
**WCAG 2.1 nível AA** como piso obrigatório em todo o sistema. **AAA**
como meta em telas de alto uso repetitivo (Dashboard, listagens
principais de Processos/Financeiro) onde o ganho de acessibilidade tem
maior retorno pela frequência de uso.

## Contraste
- Texto normal: mínimo 4.5:1 contra o fundo (AA)
- Texto grande (≥18px ou ≥14px bold): mínimo 3:1 (AA)
- Elementos de interface não-textuais com significado (ícone de status,
  borda de campo com erro): mínimo 3:1
- Definição exata de cores que cumprem isso é responsabilidade da Sprint
  2 (Design Tokens) — aqui fixamos a régua que os tokens precisam
  respeitar, não os valores

## Foco (navegação por teclado)
- Todo elemento interativo precisa ser alcançável e operável só com
  teclado — sem exceção, incluindo modais, dropdowns e tabelas com ações
- Indicador de foco sempre visível, nunca removido por `outline: none`
  sem substituto equivalente
- Ordem de tabulação segue a ordem lógica de leitura da tela, não a
  ordem do DOM se ela divergir visualmente
- Atalhos de teclado (quando existirem) documentados de forma
  descobrível, nunca só na cabeça de quem os criou

## Leitura por leitor de tela
- Toda imagem/ícone com significado tem texto alternativo; ícone
  puramente decorativo é marcado como tal, para não gerar ruído
- Estado dinâmico (toast, contador de não-lidas, erro de validação) é
  anunciado — não só visual, também para quem depende de leitor de tela
- Tabelas de dado usam marcação semântica de tabela, não `<div>` estilizada
  imitando visualmente uma tabela

## Tamanhos mínimos
- Área clicável mínima: 44×44px (padrão de toque confortável, também
  ajuda quem tem menor precisão motora com mouse)
- Texto de corpo: nunca menor que 14px como padrão da aplicação; texto
  auxiliar/metadado pode ser menor, mas nunca abaixo do que ainda cumpre
  contraste e legibilidade

## `prefers-reduced-motion`
Todo movimento definido em `04-motion.md` precisa ter uma versão
reduzida (ou removida) quando o sistema operacional do usuário sinaliza
preferência por menos movimento. Isso é requisito de implementação da
Sprint 3/4, registrado aqui como decisão de princípio.

## Como isso se conecta às sprints seguintes
- Sprint 2 (Tokens): paleta de cor validada contra as razões de
  contraste acima antes de ser aprovada, não depois
- Sprint 3 (Theme Engine): `animation.js` inclui variante reduzida por
  padrão
- Sprint 4 (Component Library): cada componente nasce com foco de
  teclado, ARIA e área clicável mínima — não como checklist ao final
