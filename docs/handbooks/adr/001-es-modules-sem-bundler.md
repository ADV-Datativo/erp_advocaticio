# ADR-001: ES Modules nativos, sem bundler

**Data:** 06/08/2026 | **Status:** Aceito

## Contexto
O ADV Easy é hospedado em GitHub Pages, como um `index.html` monolítico
de ~15.650 linhas. A proposta original de arquitetura (ChatGPT) previa
`src/core/`, `src/modules/` com Controller/Service/Repository — formato
que normalmente pressupõe um bundler (Vite, Webpack).

## Decisão
Usar **ES Modules nativos do navegador** (`<script type="module">` +
`import`/`export`), sem bundler, sem build step. GitHub Pages continua
sendo o hosting.

## Consequências
- Sem transpilação, sem TypeScript real (JSDoc no lugar)
- Cada módulo é uma requisição HTTP separada (sem code-splitting/bundling)
- Caminhos de import devem ser **relativos**, nunca absolutos com `/`
  no início — GitHub Pages de projeto serve num subpath, não na raiz do
  domínio. Isso causou um bug real (módulos nunca carregavam) até ser
  descoberto e corrigido
- Simplicidade de deploy mantida: só subir arquivo, sem pipeline de build
