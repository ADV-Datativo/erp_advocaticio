// modules/configuracoes-gerais/configuracoes-gerais.controller.js
// Única camada que lê o DOM e escreve nele.
//
// ESCOPO: só a Identidade Visual (cores + logo + nome do escritório).
// getNomeEscritorio, setNomeEscritorio, getDadosEscritorio,
// getLogoInlineHtml e saveData() ficam de propósito no monólito — são
// usadas por vários outros domínios já migrados (Recebimentos, por
// exemplo), mexer nelas aqui seria risco sem ganho. Injetadas como
// dependência, como sempre.

import * as service from './configuracoes-gerais.service.js';
import * as state from './configuracoes-gerais.state.js';
import { corHexValida, validarNomeEscritorio, validarArquivoLogo, ValidationError } from './configuracoes-gerais.validation.js';
import { COR_PRIMARIA_PADRAO, COR_DESTAQUE_PADRAO } from './configuracoes-gerais.constants.js';

export function criarControllerConfiguracoesGerais(deps) {
  const { store, showToast, getNomeEscritorio, setNomeEscritorio, saveData } = deps;

  function aplicarVariaveisNoDom(primaria, destaque) {
    const { variaveis, topbarClara } = service.calcularVariaveisTema(primaria, destaque);
    const root = document.documentElement.style;
    for (const [nome, valor] of Object.entries(variaveis)) {
      root.setProperty(nome, valor);
    }
    document.body.classList.toggle('topbar-escura', !topbarClara);
  }

  function onAplicarAparencia() {
    const ap = store.aparencia || {};
    const defaults = window.DATATIVO_THEME_DEFAULTS || { corPrimaria: COR_PRIMARIA_PADRAO, corDestaque: COR_DESTAQUE_PADRAO };
    const { primaria, destaque } = service.resolverCoresEfetivas(ap, defaults);

    aplicarVariaveisNoDom(primaria, destaque);

    const nomeAtual = getNomeEscritorio();
    const nomeCustom = nomeAtual !== 'Novo Escritório' ? nomeAtual : null;

    const loginLogo = document.querySelector('.login-logo');
    if (loginLogo) {
      if (ap.logoBase64) {
        loginLogo.innerHTML = `<img src="${ap.logoBase64}" alt="Logo" style="width:46px;height:46px;object-fit:contain;border-radius:13px">` +
          `<div><div class="login-title">${nomeAtual}</div></div>`;
      } else {
        loginLogo.innerHTML = `<div class="login-logo-icon">DV</div><div><div class="login-title">${nomeAtual}</div>` +
          (nomeCustom ? '' : `<div class="login-sub">Advocacia &amp; Consultoria Jurídica</div>`) + `</div>`;
      }
    }

    const sidebarLogoMark = document.querySelector('.logo-mark');
    if (sidebarLogoMark) {
      if (ap.logoBase64) {
        sidebarLogoMark.innerHTML = `<img src="${ap.logoBase64}" alt="Logo" style="width:36px;height:36px;object-fit:contain;border-radius:10px">` +
          `<div><div class="logo-text">${nomeAtual}</div></div>`;
      } else {
        sidebarLogoMark.innerHTML = `<div class="logo-icon">DV</div><div><div class="logo-text">${nomeAtual}</div>` +
          (nomeCustom ? '' : `<div class="logo-sub">Advocacia &amp; Consultoria Jurídica</div>`) + `</div>`;
      }
    }

    document.title = nomeAtual + ' — Sistema de Gestão';
    const elNomeSistema = document.getElementById('opcoes-nome-sistema');
    if (elNomeSistema) elNomeSistema.textContent = nomeAtual;
  }

  function onAtualizarPreviewLogo(logoBase64) {
    const preview = document.getElementById('ap-logo-preview');
    if (!preview) return;
    preview.innerHTML = logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="width:100%;height:100%;object-fit:contain">` : 'DV';
  }

  function onCarregarFormAparencia() {
    onAplicarAparencia(); // garante que qualquer preview não salvo seja descartado
    const ap = store.aparencia || {};
    const primaria = ap.corPrimaria || COR_PRIMARIA_PADRAO;
    const destaque = ap.corDestaque || COR_DESTAQUE_PADRAO;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('ap-cor-primaria', primaria);
    set('ap-cor-primaria-hex', primaria.toUpperCase());
    set('ap-cor-destaque', destaque);
    set('ap-cor-destaque-hex', destaque.toUpperCase());
    set('ap-nome-escritorio', getNomeEscritorio());
    onAtualizarPreviewLogo(ap.logoBase64);
  }

  function onSincronizarCorHex(idColorInput, valorHex) {
    if (!corHexValida(valorHex)) return;
    const inp = document.getElementById(idColorInput);
    if (inp) inp.value = valorHex;
    onPreviewAparencia();
  }

  function onPreviewAparencia() {
    const primaria = document.getElementById('ap-cor-primaria-hex')?.value;
    const destaque = document.getElementById('ap-cor-destaque-hex')?.value;
    if (!corHexValida(primaria) || !corHexValida(destaque)) return;
    // Preview ao vivo, sem alterar o store real
    const apReal = store.aparencia;
    store.aparencia = Object.assign({}, apReal, { corPrimaria: primaria, corDestaque: destaque });
    onAplicarAparencia();
    store.aparencia = apReal;
  }

  function onHandleUploadLogo(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      validarArquivoLogo(file);
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      throw err;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      state.definirLogoTemp(e.target.result);
      onAtualizarPreviewLogo(state.obterLogoTemp());
    };
    reader.onerror = () => showToast('Erro ao ler a imagem.', 'error');
    reader.readAsDataURL(file);
  }

  function onRemoverLogoCustomizada() {
    state.definirLogoTemp(null);
    const input = document.getElementById('ap-logo-input');
    if (input) input.value = '';
    onAtualizarPreviewLogo(null);
  }

  async function onSalvarAparencia() {
    if (!store.aparencia) store.aparencia = {};
    const primariaInput = document.getElementById('ap-cor-primaria-hex')?.value || document.getElementById('ap-cor-primaria')?.value || COR_PRIMARIA_PADRAO;
    const destaqueInput = document.getElementById('ap-cor-destaque-hex')?.value || document.getElementById('ap-cor-destaque')?.value || COR_DESTAQUE_PADRAO;
    const nome = document.getElementById('ap-nome-escritorio')?.value.trim();

    try {
      validarNomeEscritorio(nome);
    } catch (err) {
      if (err instanceof ValidationError) { showToast(err.message, 'error'); return; }
      throw err;
    }

    store.aparencia.corPrimaria = corHexValida(primariaInput) ? primariaInput : COR_PRIMARIA_PADRAO;
    store.aparencia.corDestaque = corHexValida(destaqueInput) ? destaqueInput : COR_DESTAQUE_PADRAO;

    const nomeSalvo = await setNomeEscritorio(nome);
    if (!nomeSalvo) return; // erro já mostrado por setNomeEscritorio

    const logoTemp = state.obterLogoTemp();
    if (logoTemp !== undefined && logoTemp !== null) {
      store.aparencia.logoBase64 = logoTemp;
    } else if (logoTemp === null) {
      store.aparencia.logoBase64 = null;
    }
    state.limparLogoTemp();

    onAplicarAparencia();
    saveData();
    showToast('✅ Identidade Visual atualizada com sucesso!', 'success');
  }

  function onRestaurarAparenciaPadrao() {
    if (!confirm('Restaurar as cores e a logo padrão do sistema? A logo customizada será removida. O nome do escritório não será alterado.')) return;
    const nomeAtual = getNomeEscritorio();
    store.aparencia = { corPrimaria: COR_PRIMARIA_PADRAO, corDestaque: COR_DESTAQUE_PADRAO, logoBase64: null, nomeEscritorio: nomeAtual };
    state.limparLogoTemp();
    onAplicarAparencia();
    onCarregarFormAparencia();
    saveData();
    showToast('✅ Identidade Visual restaurada ao padrão.', 'success');
  }

  return {
    onAplicarAparencia,
    onCarregarFormAparencia,
    onSincronizarCorHex,
    onPreviewAparencia,
    onAtualizarPreviewLogo,
    onHandleUploadLogo,
    onRemoverLogoCustomizada,
    onSalvarAparencia,
    onRestaurarAparenciaPadrao
  };
}
