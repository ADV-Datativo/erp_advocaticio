# Component Handbook — Datativo UI

> Os 8 componentes da Onda 1 (Sprint 4), com API real e exemplo de uso.
> Todos em `src/core/ui/{componente}/{componente}.js`. Onda 2 (card,
> textarea, checkbox, radio, switch, tag, tooltip, dropdown, avatar,
> sidebar, navbar, breadcrumb, pagination, search, dialog, calendar,
> upload, chart) nasce conforme demanda real, ainda não construída.

## Princípio geral
Nenhum componente reinventa CSS que já funcionava (Button, Tabs, Select,
Form reaproveitam classes já existentes: `.btn`, `.tab-btn`,
`.form-control`). Só consolidam o que genuinamente estava duplicado, e
nunca tocam nos dispatchers grandes do monólito (`openModal`,
`switchTab`) que misturam mecanismo com lógica de negócio de múltiplos
domínios — os componentes geram HTML **compatível** com esses
mecanismos, sem precisar alterá-los.

## Badge
```javascript
import { renderBadge } from '.../core/ui/badge/badge.js';
renderBadge({ label: 'Pago', variant: 'success', icon: '✅' })
```
Variantes: `success`, `warning`, `danger`, `info`, `neutral`. Cor sempre
via token (`theme.colors[variant][100]`/`[700]`), nunca hex hardcoded.

## Table
```javascript
import { renderEmptyStateRow, renderTableHeader } from '.../core/ui/table/table.js';
renderEmptyStateRow({ colspan: 7, message: 'Nenhuma parcela encontrada.' })
renderTableHeader(['Cliente', 'Processo', 'Valor', 'Ações'], 'right')
```
Não abstrai conteúdo de linha (muito específico por tabela) — só o
estado vazio (repetido 5x no código antigo) e o cabeçalho.

## Modal
```javascript
import { renderModal } from '.../core/ui/modal/modal.js';
renderModal({
  id: 'modal-novo-item',
  titulo: 'Novo Item',
  bodyHtml: '<p>...</p>',
  footerHtml: '<button class="btn btn-primary">Salvar</button>'
})
```
Usa as mesmas classes CSS já existentes (`.modal-overlay`, `.modal`,
`.open`) — compatível com `openModal(id)`/`closeModal(id)` do monólito
sem precisar de nenhuma mudança neles.

## Button
```javascript
import { renderButton, setLoading } from '.../core/ui/button/button.js';
renderButton({ label: 'Salvar', variant: 'primary', icon: '💾' })

const restaurar = setLoading(botaoEl, 'Salvando...');
try { await algo(); } finally { restaurar(); }
```
Variantes: `primary`, `outline`, `danger`, `ghost`. `setLoading()`
consolida o padrão de desabilitar+trocar texto+restaurar, antes
duplicado manualmente em cada controller.

## Toast
**Sem arquivo próprio** — `showToast()` já era a implementação única e
correta, usada por todo o sistema via injeção de dependência. Achado
corrigido nesta sprint: o toast padrão (info) usava a mesma cor do
sucesso depois da troca pro verde de marca — corrigido com um token
`--info` (`#2563EB`) dedicado.

## Loader
```javascript
import { renderSpinner, renderLoadingBloco } from '.../core/ui/loader/loader.js';
renderLoadingBloco({ mensagem: 'Carregando mensagens...' })
```
Substitui os 15 lugares que usavam só texto "Carregando..." sem spinner
visual. Injeta a animação `@keyframes` uma vez só no documento, não
duplicada a cada uso.

## Tabs
```javascript
import { renderTabsBar } from '.../core/ui/tabs/tabs.js';
renderTabsBar({
  grupo: 'fin',
  abas: [{ id: 'visao', label: 'Visão Geral' }, { id: 'parcelas', label: 'Parcelas' }]
})
```
Compatível com `switchTab(group, tab, btn)` do monólito, sem alterá-lo.

## Form / Input
```javascript
import { renderFormGroup } from '.../core/ui/form/form.js';
renderFormGroup({ id: 'valor', label: 'Valor', tipo: 'number', erro: 'Informe um valor maior que zero.' })
```
**Achado real**: nenhum campo do sistema tinha estado visual de erro
antes deste componente — validação só aparecia via toast. Este
componente já nasce com suporte a erro inline; retrofit dos formulários
existentes fica pra depois.

## Select
```javascript
import { renderSelect } from '.../core/ui/select/select.js';
renderSelect({
  id: 'filtro-status', placeholder: 'Todos os status',
  opcoes: [{ value: 'pago', label: 'Pago' }], valorSelecionado: 'pago'
})
```
Reaproveita `.form-control`, sem CSS próprio.

## Testes
`badge.test.js` cobre as variantes do Badge (4 testes). Os outros 7
componentes ainda não têm teste dedicado — oportunidade pra próxima
rodada de Sprint 6.
