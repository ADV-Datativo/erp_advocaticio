# 08 — Feedback

> Padrões de comunicação de estado do sistema para o usuário. Conceito
> e regra de uso — a implementação visual concreta (toast, badge, etc.)
> é da Component Library (Sprint 4).

## Princípio geral
O usuário nunca deveria ficar em dúvida sobre o resultado de uma ação —
toda ação relevante (salvar, excluir, enviar) produz uma confirmação
visível, mesmo quando o resultado é óbvio para quem programou o sistema.

## Sucesso
Confirmação breve, não intrusiva, que não exige ação do usuário para
desaparecer (o sistema já usa toast pra isso hoje — mantido como padrão
conceitual). Sucesso nunca bloqueia o fluxo — o usuário pode continuar
trabalhando imediatamente.

## Erro
Diferente de sucesso: erro pode exigir atenção mais deliberada,
dependendo da gravidade.
- **Erro de validação de campo** (formulário) — no lugar do campo, no
  momento em que o usuário tenta prosseguir, texto claro do que precisa
  mudar (nunca só "campo inválido" sem dizer o quê)
- **Erro de operação** (falha ao salvar, sem conexão) — comunicado de
  forma que não pareça um sucesso disfarçado; o usuário precisa saber
  que a ação NÃO teve efeito

## Alerta
Informação que não é erro, mas precisa de atenção antes de prosseguir
(ex: "esta ação não pode ser desfeita"). Visualmente distinto tanto de
sucesso quanto de erro — três estados, três linguagens visuais
diferentes, nunca reaproveitando a mesma cor/formato para significados
diferentes.

## Confirmação
Ações destrutivas ou irreversíveis (excluir, cancelar processo) sempre
pedem confirmação explícita antes de executar — nunca dependem só de
"desfazer depois". Confirmação não deve virar hábito automático de
clicar sem ler — texto de confirmação específico à ação (não um
"Tem certeza?" genérico repetido em todo lugar).

## Loading
Toda operação que leva tempo perceptível mostra que está em progresso.
Duas categorias:
- **Local** — só o componente/área afetada mostra estado de carregamento
  (ex: botão "Salvando..." desabilitado)
- **Global** — a tela inteira está indisponível até completar (usar com
  parcimônia, só quando genuinamente nada mais pode ser feito enquanto
  isso)

## Estados vazios
Uma lista/tabela sem dado nunca é só um espaço em branco — comunica
claramente que está vazia por design (nenhum dado ainda) versus vazia
por filtro (nenhum resultado para os critérios aplicados) — são
situações diferentes e merecem mensagens diferentes.

## Consistência entre os cinco estados
Sucesso, erro, alerta, confirmação e loading precisam ser reconhecíveis
à primeira vista, em qualquer lugar do sistema, sem o usuário precisar
ler o texto pra saber qual dos cinco está vendo — a cor/ícone/formato
comunica a categoria antes mesmo do conteúdo.
