# Proposta de Design Tokens — Datativo UI (para aprovação)

> Gerado a partir da cor oficial (`#227056`) e da identidade visual
> enviada (logo com adaptação clara/escura já prevista). Nada aqui foi
> implementado em código ainda — é proposta para revisão de Renan +
> ChatGPT, conforme combinado.

---

## 1. Cor — Escala do Primário (derivada de #227056)

`#227056` é um verde esmeralda escuro e dessaturado — combina bem com
os atributos de marca já definidos (Premium, Corporativo, Confiável,
sem ser chamativo). Gerei uma escala de 10 tons ao redor dele, seguindo
o mesmo padrão de nomenclatura `theme.colors.primary[600]` que vocês já
definiram, com `600` sendo o próprio `#227056`:

| Tom | Hex | Uso sugerido |
|---|---|---|
| `primary.50` | `#EAF5F0` | Fundo sutil (badge de status, hover leve) |
| `primary.100` | `#CCE8DC` | Fundo de destaque suave |
| `primary.200` | `#9AD1B9` | Borda de elemento em destaque |
| `primary.300` | `#68B996` | Ícone secundário sobre fundo claro |
| `primary.400` | `#3F9C77` | Elementos interativos secundários |
| `primary.500` | `#2B8560` | Hover de botão primário |
| **`primary.600`** | **`#227056`** | **Cor de marca — botão primário, links, foco** |
| `primary.700` | `#1B5B45` | Estado pressionado/ativo |
| `primary.800` | `#154635` | Texto sobre fundo claro em contexto de marca |
| `primary.900` | `#0F3226` | Uso raro, ênfase máxima |

## 2. Cor — Neutros (já definidos por vocês, mantidos)
Os 5 neutros que já apareceram nos dois boards (`#0F172A`, `#111827`,
`#1E293B`, `#E5E7EB`, `#FFFFFF`) formam uma escala consistente — não
precisei inventar nada aqui, só nomear pro padrão de token:

| Token | Hex |
|---|---|
| `neutral.900` (texto principal, modo claro) | `#0F172A` |
| `neutral.800` | `#111827` |
| `neutral.700` | `#1E293B` |
| `neutral.200` (borda, divisor) | `#E5E7EB` |
| `neutral.0` (fundo base, modo claro) | `#FFFFFF` |

## 3. Cor — Semânticos (novos, não estavam no brand kit)
O brand kit não define cores de feedback (sucesso/erro/aviso/info) —
proponho estas, escolhidas para não colidir visualmente com o verde de
marca (sucesso *não* reusa `primary`, de propósito: numa tela onde botão
primário e mensagem de sucesso aparecem juntos, precisam ser
distinguíveis um do outro, mesmo sendo ambos "verdes" conceitualmente):

| Token | Hex sugerido | Uso |
|---|---|---|
| `success.600` | `#16A34A` | Confirmação, pago, concluído |
| `warning.600` | `#D97706` | Alerta, atenção, vencendo |
| `danger.600` | `#DC2626` | Erro, exclusão, vencido |
| `info.600` | `#2563EB` | Informativo neutro |

Cada um também precisa da escala 50-900 igual ao primary — gero completa
na hora da implementação, só validando a cor-base 600 agora.

## 4. Modo escuro — mapeamento automático
A lógica que vocês já pensaram no brand kit (mark adapta sozinho:
verde constante, texto/fundo invertem) vira a base do Theme Engine:

| Token semântico | Modo claro | Modo escuro |
|---|---|---|
| `background.base` | `neutral.0` (#FFFFFF) | `neutral.900` (#0F172A) |
| `background.elevated` | `#FAFAFA` (novo, sugerido) | `neutral.800` (#111827) |
| `text.primary` | `neutral.900` | `neutral.0` |
| `text.secondary` | `neutral.700` | `neutral.200` |
| `border.default` | `neutral.200` | `neutral.700` |
| `primary.600` | `#227056` | `#227056` (constante — igual ao logo) |

O sistema **já tem um toggle de modo escuro implementado**
(`lexpro_dark_mode`, achado da nossa auditoria de Sistema) — o Theme
Engine vai se conectar nesse mecanismo existente, não recriar do zero.

## 5. Logo — troca automática por tema
Confirmando meu entendimento do que vocês pediram: a logo tem 2
variantes (fundo claro: texto preto + "LABS" verde; fundo escuro: texto
branco + "LABS" verde). Proponho: `<img>` com `src` trocado via a mesma
lógica de tema que já decide `background.base` — quando o sistema
estiver em modo escuro, carrega a variante de logo pra fundo escuro, e
vice-versa. Preciso que você me envie os arquivos de logo como PNG/SVG
separados (as duas variantes) quando formos implementar de fato — as
imagens que você mandou agora são pranchas de apresentação, não os
arquivos de uso isolado.

## 6. Tipografia
- **Datativo Neo** (fonte principal da marca): fonte de exibição/logo.
  Preciso confirmar — essa é uma fonte customizada de vocês (arquivo
  `.woff`/`.ttf` próprio) ou foi só sugerida visualmente na prancha sem
  arquivo real ainda? Se não existir arquivo, proponho usá-la só na
  logo/wordmark (que já é imagem, não depende de fonte carregada) e
  **Inter** (fonte de apoio já definida por vocês, gratuita, real, leve)
  como a fonte de toda a interface — títulos inclusive. Datativo Neo
  reservada pra materiais de marca (cartão, apresentação), não pra UI
  do sistema.
- Escala de tamanho sugerida (baseada em razão 1.25, comum para UI densa
  de sistema de gestão): `xs` 12px, `sm` 13px, `base` 14px, `lg` 16px,
  `xl` 18px, `2xl` 22px, `3xl` 28px — mantém o corpo em 14px, que já é o
  mínimo definido em `05-accessibility.md`

## 7. Espaçamento
Escala de base 4px (padrão amplamente usado, múltiplo simples de
calcular): `1` = 4px, `2` = 8px, `3` = 12px, `4` = 16px, `6` = 24px, `8`
= 32px, `12` = 48px, `16` = 64px.

## 8. Border Radius
Coerente com o estilo geométrico da logo (linhas retas com poucos
cantos arredondados no ícone da marca, mas o wordmark tem cantos
levemente suaves): `sm` 4px (badge, input), `md` 8px (card, botão), `lg`
12px (modal, painel), `full` 9999px (avatar, pill de status).

## 9. Sombra / Elevação
Sutil, coerente com "Premium sem ostentação" (`01-brand-principles.md`):
`sm` (hover leve), `md` (card padrão), `lg` (modal/dropdown) — todas
com opacidade baixa (8-16%), nunca sombra dramática.

---

## O que preciso de vocês antes de eu implementar em código
1. **Confirmar `#227056` como primary.600** (ou apontar se era pra ser
   `#22C55E` — a discrepância entre os dois boards)
2. **Confirmar as 4 cores semânticas sugeridas** (sucesso/erro/
   aviso/info) ou ajustar
3. **Confirmar se "Datativo Neo" tem arquivo de fonte real** ou se Inter
   assume tipografia da interface inteira
4. **Enviar os arquivos de logo isolados** (light + dark, PNG ou SVG)
   quando aprovarem — as pranchas servem pra referência, não pra uso
   direto no código
5. Validar a escala de tipografia/espaçamento/raio/sombra, ou pedir
   ajuste
