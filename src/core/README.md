# Datativo Core

Infraestrutura compartilhada do ADV Easy — usada por qualquer domínio
(Financeiro, Operacional, e os que vierem depois). Nada aqui contém
regra de negócio de nenhum domínio específico.

## O que existe hoje

| Pasta | O que tem | Status de uso |
|---|---|---|
| `errors/` | `AppError`, `RepositoryError`, `ValidationError`, `BusinessRuleError`, `AuthorizationError` | `RepositoryError` **em uso** (Despesas, Recebimentos). Os outros 4, prontos, não religados ainda |
| `logger/` | `logger.info/warn/error/audit()` | criado, não religado em nenhum módulo ainda |
| `events/` | `eventBus` (emit/on/off/once) | criado, não religado ainda |
| `registry/` | Registry de módulos (granularidade grossa) | criado, não religado ainda |
| `permissions/` | `pode()`/`exigirPermissao()` — sem regra real | criado, sempre retorna `true` |
| `config/` | `obterConfig()`/`definirConfig()` | criado, vazio |
| `utils/` | — | vazio de propósito, ver nota abaixo |
| `constants/` | — | vazio de propósito, ver nota abaixo |
| `services/` | — | vazio de propósito, ver nota abaixo |

## Por que `utils/`, `constants/` e `services/` estão vazios

Não movi `fmtMoney`, `fmtDate`, `diffDays`, `isVencido` etc. do monólito
pra cá. Auditar cada regra de formatação já existente para garantir zero
mudança de comportamento é um trabalho à parte — fazer isso apressado
arrisca introduzir exatamente o tipo de bug sutil que a arquitetura toda
está tentando evitar. O padrão correto, usado em todos os módulos já
migrados, é **injetar** essas funções do monólito como dependência (ver
`recebimentos/index.js`, `despesas/index.js`) em vez de duplicá-las.

## Os três níveis de Registry — não confundir

```
core/registry           → todos os MÓDULOS da aplicação (Financeiro, Operacional, ...)
financeiro.registry.js  → só os SUBMÓDULOS de Financeiro (Recebimentos, Despesas, Relatórios)
operacional.registry.js → só os SUBMÓDULOS de Operacional (Diário Oficial, ...)
```

Um domínio se registra no `core/registry` uma vez (como módulo); os
submódulos dele se registram no registry do próprio domínio. Nenhum
domínio existente foi religado ao `core/registry` nesta etapa — é
infraestrutura pronta, migração de fato é passo seguinte.

## Os dois EventBus — não confundir

`core/events` é para comunicação **entre domínios** (ex: Financeiro avisa
Processos). `financeiro.events.js` é para comunicação **entre submódulos
do mesmo domínio** (ex: Despesas avisa Relatórios). Um domínio pode usar
o `eventBus` do Core internamente para repassar pra fora um evento que
recebeu do seu próprio barramento interno — mas isso ainda não está
religado em nenhum lugar.

## Como um módulo deve usar o Core

```javascript
// Erros
import { RepositoryError, ValidationError } from '../../../core/errors/index.js';

// Logger (em vez de console.log/warn/error)
import { logger } from '../../../core/errors/index.js';
logger.warn('Erro ao carregar X', 'meu-modulo.repository');

// EventBus (comunicação cross-domain)
import { eventBus } from '../../../core/events/index.js';
eventBus.emit('financeiro:parcela-paga', parcela);
// em outro domínio:
eventBus.on('financeiro:parcela-paga', (parcela) => { ... });

// Registry de módulo (não de submódulo — isso é o registry do domínio)
import { registrar } from '../../../core/registry/index.js';
registrar({ id: 'financeiro', nome: 'Financeiro', status: 'em-migracao', owner: 'Renan' });
```

## O que foi migrado nesta etapa

Só `RepositoryError`. `despesas.repository.js` e `recebimentos.repository.js`
não têm mais sua própria classe `RepositoryError` local — importam do
Core e re-exportam com o mesmo nome, então nenhum `import` em nenhum
`controller.js` precisou mudar. Comportamento idêntico: mesmo `name`,
mesma `message`, mesma `cause`.

`ValidationError` **não foi tocada** nesta etapa — continua com sua
implementação local em cada submódulo, apesar de existir uma versão no
Core agora. Migrar isso é decisão para uma próxima etapa, não incluída
aqui por instrução explícita.

## Próximos passos sugeridos (não feitos nesta etapa)
1. Migrar `ValidationError` dos submódulos Financeiro para o Core (mesma
   mecânica que `RepositoryError` já usou)
2. Religar os domínios Financeiro e Operacional ao `core/registry`
3. Trocar `console.warn`/`console.error` remanescentes nos repositories
   por `logger.warn`/`logger.error`
4. Avaliar se o barramento interno de Financeiro (`financeiro.events.js`)
   deveria usar o `eventBus` do Core por baixo, para eventos que
   precisam sair do domínio
