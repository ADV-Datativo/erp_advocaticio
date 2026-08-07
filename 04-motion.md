# 04 — Motion

> Filosofia de movimento. Nenhuma animação é implementada aqui — isso é
> trabalho da Sprint 3 (Theme Engine, tokens de `animation.js`) e da
> Sprint 4 (Component Library). Este documento decide QUANDO e POR QUÊ
> algo se move, não COMO tecnicamente.

## Princípio central
Movimento comunica mudança de estado. Se uma animação não está
respondendo à pergunta "o que mudou?", ela não deveria existir.

## Quando animar

- **Transição de estado** — algo virou outra coisa (modal abrindo,
  aba trocando, item entrando/saindo de uma lista)
- **Feedback de ação** — o sistema confirma que recebeu o clique/toque
  antes mesmo da ação terminar (leve resposta visual imediata em botões)
- **Carregamento** — indicar que algo está em progresso, nunca deixar o
  usuário sem sinal nenhum de que o sistema está processando
- **Guiar atenção** — quando uma ação do usuário produz um resultado que
  aparece fora do campo de visão imediato (ex: item adicionado ao fim de
  uma lista longa), um movimento sutil ajuda a localizar onde olhar

## Quando NÃO animar

- Decoração pura, sem relação com mudança de estado
- Qualquer animação que atrase a percepção de que uma ação foi concluída
  (ex: um "salvo com sucesso" que demora mais pra aparecer por causa da
  animação do que a própria operação levou)
- Repetição de uma mesma animação toda vez que uma tela é revisitada
  (animações de entrada de página cansam rápido em uso diário)
- Qualquer coisa que não respeite `prefers-reduced-motion` do sistema
  operacional do usuário (ver `05-accessibility.md`)

## Duração

Como faixa conceitual, não valor final (definido em tokens na Sprint 2):
- **Instantâneo** — feedback de clique/toque, algo que precisa parecer
  simultâneo à ação do usuário
- **Rápido** — transições de estado dentro do mesmo contexto (abrir um
  dropdown, trocar de aba)
- **Moderado** — transições que mudam o contexto inteiro da tela (abrir
  um modal, navegar entre páginas)

Nunca "lento" como categoria própria — se uma transição precisa ser
lenta o suficiente para ser notada como "lenta", provavelmente é a
operação em si que deveria ser mais rápida, não a animação que deveria
disfarçar a espera.

## Easing (conceito)
Movimento no mundo real desacelera ao chegar ao destino — nada para
instantaneamente. A curva de aceleração/desaceleração usada em todo o
sistema deve ser consistente (mesma "personalidade" de movimento em
qualquer lugar), não escolhida caso a caso por componente.

## Feedback visual de estado

Todo estado interativo (hover, foco, pressionado, desabilitado) precisa
de indicação visual — nunca depender só do cursor mudando de forma.
Essencial tanto para usabilidade quanto para acessibilidade (ver
próximo documento).

## Transições entre telas
Navegação entre páginas principais do sistema não deve ter transição
elaborada — o custo de atenção de "assistir" uma transição toda vez que
se navega, múltiplas vezes por hora de uso, é maior que o benefício
estético. Transição de página: mínima ou inexistente. Transição dentro
de um mesmo contexto (abrir detalhe, trocar aba): pode ser mais notável,
porque acontece com menos frequência e ajuda a manter contexto espacial.
