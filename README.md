# Diário Oficial (Publicações) — módulo de referência

Este módulo é o **padrão oficial** de arquitetura para os módulos do ADV Easy.
Qualquer módulo novo deve seguir a mesma estrutura, salvo justificativa
explícita registrada no README do módulo em questão.

## Escopo desta migração

Migramos apenas **Publicações** do Diário Oficial. **Intimações** (que
tecnicamente também vive sob a página "Diário Oficial" no código legado,
mas é renderizada dentro do detalhe de Processos) foi deixada de fora de
propósito — ela tem acoplamento real com Processos, Agenda e Dashboard, e
migrar isso exige que pelo menos um desses outros módulos já esteja
migrado, para validar como módulos migrados se comunicam entre si. Ver
`operacional.registry.js` — `diario-oficial` está marcado como `migrado`
apenas para a parte de Publicações.

## Estrutura

```
diario-oficial/
├── index.js                    # ponto de entrada — registra globais compatíveis com o HTML legado
├── diario-oficial.controller.js  # única camada que lê o DOM e dispara toast/modal/render
├── diario-oficial.service.js     # regra de negócio pura (filtro, busca, orquestração)
├── diario-oficial.repository.js  # única camada que fala com o Supabase
├── diario-oficial.state.js       # fachada sobre store.publicacoesDiario (não duplica o dado)
├── diario-oficial.validation.js  # validação de formulário
├── diario-oficial.events.js      # addEventListener centralizados
├── diario-oficial.constants.js   # STATUS_PUBLICACAO e afins
└── components/
    ├── lista-publicacoes.js      # renderização pura da lista
    └── autocomplete-cliente.js   # renderização pura do autocomplete
```

## Fluxo de uma ação (exemplo: salvar publicação)

```
clique no botão "Salvar" (onclick="salvarPublicacao()")
  → window.salvarPublicacao  (registrado pelo index.js, aponta pro controller)
    → controller.onSalvarPublicacao()
        lê o formulário do DOM
        → service.salvarPublicacao(form, editId)
            valida (validation.js) — lança ValidationError se algo faltar
            → repository.salvarPublicacao(dados, editId)
                fala com o Supabase — lança RepositoryError em caso de falha
            atualiza o state (adiciona/substitui na lista em memória)
        controller trata o resultado: showToast, closeModal, re-render
```

## Decisões e por quê

- **`state.js` é uma fachada, não um estado novo.** O sistema inteiro usa
  `store` como fonte de verdade única. Duplicar isso por módulo criaria
  dessincronização. Quando o `store` global for fatiado (decisão maior,
  fora do escopo desta etapa), só este arquivo muda.
- **Erros do repository são exceptions tipadas** (`RepositoryError`), não
  `showToast()` disparado dentro do repository. Quem decide como mostrar
  o erro ao usuário é o controller — repository só sabe "deu certo" ou
  "não deu, e por quê".
- **`onclick="..."` inline nos itens de lista não foi eliminado.** Esses
  HTMLs são gerados dinamicamente via `innerHTML` nos componentes. Trocar
  isso por `addEventListener` exige reescrever a geração de HTML com
  event delegation — mudança de implementação maior que o combinado
  ("zero mudança de comportamento"). Registrado como melhoria futura, não
  feito nesta etapa.
- **`index.js` usa injeção de dependência** (`showToast`, `openModal` etc.
  passados como parâmetro) em vez de importar essas funções diretamente do
  monólito, porque elas ainda não são módulos ES — só existem como globais
  `window.*` depois que `initWithSupabase()` roda.

## Status de migração

Ver `../../operacional.registry.js` — `estaMigrado('diario-oficial')` retorna
`true` a partir desta etapa (mas cobre só Publicações, ver "Escopo" acima).
