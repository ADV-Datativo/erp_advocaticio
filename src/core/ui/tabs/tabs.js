// core/ui/tabs/tabs.js
//
// Sexto componente da Component Library (Sprint 4, Onda 1). Mesma
// lógica já aplicada em Modal: switchTab(group, tab, btn) é um
// dispatcher que mistura o mecanismo genérico de troca de aba com
// lógica de negócio de vários domínios (proc, opt, fin, rel...) — não
// foi tocado. Este componente só gera o HTML da barra de abas,
// compatível com as classes CSS já existentes (.tabs-bar, .tab-btn,
// .tab-btn.active) e com switchTab() sem exigir nenhuma mudança nele.

/**
 * @param {{grupo: string, abas: Array<{id: string, label: string}>, ativaInicial?: string}} props
 * @returns {string} HTML da barra de abas, pronto pra inserir acima do
 *   conteúdo (cada aba de conteúdo continua sendo criada manualmente,
 *   com id="{grupo}-{aba.id}" e classe "tab-content").
 */
export function renderTabsBar({ grupo, abas, ativaInicial }) {
  const inicial = ativaInicial || abas[0]?.id;
  const botoes = abas.map((aba) => {
    const ativa = aba.id === inicial ? ' active' : '';
    return `<button class="tab-btn${ativa}" onclick="switchTab('${grupo}','${aba.id}',this)">${aba.label}</button>`;
  }).join('');
  return `<div class="tabs-bar">${botoes}</div>`;
}
