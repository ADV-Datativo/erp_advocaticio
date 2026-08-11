# Coding Standards — ADV Easy / Datativo Labs

> Convenções reais, extraídas do que já foi aplicado consistentemente
> ao longo de toda a migração — não regras teóricas escritas antes da
> prática validar.

## Estrutura de arquivo por submódulo
```
{submodulo}/
├── index.js                    # registra globais + declara "migrado" no registry do domínio
├── {submodulo}.controller.js   # única camada que lê o DOM
├── {submodulo}.service.js      # regra de negócio pura
├── {submodulo}.repository.js   # única camada que fala com Supabase
├── {submodulo}.state.js        # acesso a dado (fachada ou dono real)
├── {submodulo}.validation.js   # validação de formulário
├── {submodulo}.events.js       # eventos de domínio
├── {submodulo}.constants.js    # constantes específicas
├── README.md                   # decisões e achados dessa migração específica
└── components/
    └── *.js                    # renderização pura (recebe dado pronto, devolve HTML)
```

## Regras de camada (não-negociáveis)
- **Controller** nunca chama Supabase. Nunca contém regra de negócio (cálculo, decisão)
- **Service** nunca lê `document.*`. Nunca chama `showToast`/`openModal`/etc
- **Repository** nunca decide regra de negócio. Nunca chama efeito de UI (erros viram exception tipada, não toast direto)
- **Components** (`components/*.js`) só renderizam — recebem dado já processado, nunca calculam

## Erros
Sempre `RepositoryError`/`ValidationError` do Core (`src/core/errors/index.js`), nunca `throw new Error()` genérico. Repository re-exporta a classe importada do Core (`export { RepositoryError };`) pra controllers não precisarem trocar o `import` quando a origem migra.

## Comunicação entre submódulos
Nunca `import` direto de dentro de outro submódulo. Sempre via `{dominio}.registry.js`:
```javascript
import { apiDoSubmodulo, estaMigrado } from '../../financeiro.registry.js';
if (!estaMigrado('recebimentos')) { /* fallback ou erro claro */ }
const dado = apiDoSubmodulo('recebimentos').listarTodas();
```

## Bridging pro monólito (strangler pattern)
Quando um módulo novo precisa que o monólito (script clássico) enxergue algo, expõe via `window`:
```javascript
window.DATATIVO_THEME_DEFAULTS = { ... };  // dado
window.registrarAuditoria = registrarAuditoria;  // função, sobrescreve a global antiga
```
Nunca o contrário (módulo ES importando do monólito) — a informação sempre flui de dentro pra fora.

## Design Tokens
Nunca cor/espaçamento/raio hardcoded em componente novo:
```javascript
// ERRADO
`background:#227056`
// CERTO
import { theme } from '.../core/theme/tokens/index.js';
`background:${theme.colors.primary[600]}`
```
Para propriedades que já são adaptativas claro/escuro via CSS variable existente (`var(--text-muted)`, `var(--border)`), continuar usando a variável — não duplicar em token JS.

## Testes
Convenção: `{arquivo}.test.js` **ao lado** do arquivo testado, nunca em pasta `tests/` separada. Roda com `node --test` (nativo do Node 22+, zero dependência). Testar funções puras de `service.js` e `components/` — não vale a pena testar `controller.js` (acoplado a DOM) nem `repository.js` (acoplado a rede) sem mock pesado.

## Nomenclatura
- Arquivos e funções internas: português (`salvarDespesa`, `calcularResumoCards`) — o time é brasileiro, o código reflete isso
- Nomes de classe/tipo de erro: inglês, por convenção JS (`RepositoryError`, `ValidationError`)
- Chaves de permissão RBAC: inglês, formato `dominio.submodulo.acao` (`financeiro.despesas.delete`)

## Verificação antes de entregar qualquer módulo novo
1. Testar em runtime de verdade (`node --input-type=module -e "import(...)..."`), nunca só ler o código e assumir que funciona
2. Rodar a verificação de import/export em todo o `src/` (script Python já usado repetidamente nesta migração)
3. Rodar `node --test` — nenhum teste existente pode quebrar
4. Conferir contagem de linhas do `index.html` antes/depois de qualquer edição — mudança inesperada de linha é sinal de erro de edição

## Commits
Convenção: `feat:`, `fix:`, `refactor:`, `perf:`, `docs:`, `style:`, `test:`, `chore:` (proposta original do ChatGPT, mantida).
