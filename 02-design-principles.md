# 02 — Design Principles

> Princípios que orientam toda decisão de interface daqui em diante.
> Quando duas soluções de UI competirem, estes princípios decidem —
> nessa ordem de prioridade quando entrarem em conflito entre si.

## 1. Clareza acima de decoração
Todo elemento visual precisa justificar sua existência pela informação
que carrega, não pelo efeito que causa. Uma cor, sombra ou ícone que não
ajuda a entender o dado mais rápido é candidato a remoção.

## 2. Informação acima de efeitos
Animações, transições e microinterações servem para comunicar mudança
de estado (algo foi salvo, algo está carregando, algo mudou de lugar) —
nunca para "dar vida" à tela por si só. Ver `04-motion.md`.

## 3. Consistência absoluta
O mesmo tipo de informação se comporta visualmente da mesma forma em
qualquer lugar do sistema. Um "status pago" tem a mesma cor e formato em
Recebimentos, Relatórios e no Portal do Cliente — nunca reinventado por
tela. Essa é literalmente a motivação técnica por trás da Component
Library (Sprint 4): tornar consistência o caminho de menor esforço, não
uma disciplina manual.

## 4. Previsibilidade
O usuário nunca deve precisar adivinhar o que um clique vai fazer. Botão
primário sempre no mesmo canto relativo, ação destrutiva sempre com a
mesma cor de aviso, confirmação sempre pedida antes de exclusão
irreversível.

## 5. Performance percebida acima de performance real
Um carregamento de 800ms com feedback visual imediato (skeleton, spinner
no lugar certo) é percebido como mais rápido que um carregamento de
400ms sem nenhum feedback até o conteúdo aparecer de repente. Priorizar
a sensação de responsividade, não só a métrica bruta.

## 6. Poucos elementos por tela
Cada tela tem uma tarefa primária. Elementos secundários (filtros
avançados, ações raras) ficam disponíveis mas não competem visualmente
com a tarefa primária pela atenção do usuário.

## 7. Acessibilidade desde o início, não como camada final
Contraste, foco de teclado e tamanho de área clicável são requisitos de
todo componente desde o primeiro desenho — não uma auditoria feita
depois que o visual já está pronto. Detalhado em `05-accessibility.md`.

## Como estes princípios se aplicam em caso de conflito
Quando dois princípios puxam em direções opostas (ex: "poucos elementos"
vs. "informação acima de efeitos" — mostrar mais dado numa tabela densa
de Financeiro), a ordem de prioridade desta lista decide: Clareza >
Informação > Consistência > Previsibilidade > Performance percebida >
Poucos elementos > Acessibilidade é sempre não-negociável, nunca entra
nesse desempate — ela é requisito, não trade-off.
