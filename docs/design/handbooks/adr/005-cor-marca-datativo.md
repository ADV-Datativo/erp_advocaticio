# ADR-005: Verde Datativo (#227056) como padrão, sobrescrevível por escritório

**Data:** 07/08/2026 | **Status:** Aceito

## Contexto
Identidade visual da Datativo Labs definida (verde `#227056` + logo com
variantes claro/escuro). Sistema antigo tinha azul-marinho/dourado
(`#1A2E45`/`#C4A96B`) hardcoded como tema, tanto no padrão global quanto
em templates de documento (recibo, orçamento, ficha).

## Decisão
Arquitetura de 2 camadas: (1) todo escritório novo nasce com o padrão
Datativo; (2) cada escritório pode sobrescrever via Opções → Aparência
(mecanismo que já existia, só teve o *padrão* trocado, não o
mecanismo). As 64 ocorrências hardcoded de navy/dourado no monólito
foram trocadas contextualmente (não substituição cega — texto sobre
fundo escuro vira branco, texto sobre fundo claro vira verde).

## Consequências
- `#227056` é `primary.600` na escala de token; dourado não tem
  substituto direto — vira branco (fundo escuro) ou verde (fundo claro),
  dependendo do contexto
- Um erro real cometido e corrigido no processo: `--white`/`--card-bg`/
  `--modal-bg` do modo escuro quase viraram verde vibrante sólido (fundo
  de todo card do sistema) — corrigido pra um verde bem mais escuro
  (`#0F3226`) antes de publicar
- Cores/logo de Aparência **ainda só persistem em `localStorage`**, não
  sincronizam entre dispositivos do mesmo escritório — achado registrado,
  não corrigido nesta etapa
