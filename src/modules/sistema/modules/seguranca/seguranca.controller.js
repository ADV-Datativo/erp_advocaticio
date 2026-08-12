// modules/seguranca/seguranca.controller.js
// Única camada que lê o DOM e dispara efeito de UI.

import * as service from './seguranca.service.js';
import { ValidationError } from './seguranca.validation.js';
import { RepositoryError } from './seguranca.repository.js';

export function criarControllerSeguranca(deps) {
  const { showToast, getSessao } = deps;

  function onAvaliarForcaSenha(v) {
    const wrap = document.getElementById('forca-wrap');
    const lbl = document.getElementById('forca-label');
    const bars = [1, 2, 3, 4].map((i) => document.getElementById('forca-b' + i));

    const forca = service.calcularForcaSenha(v);
    if (!forca) { wrap.style.display = 'none'; return; }

    wrap.style.display = 'block';
    bars.forEach((b, i) => { b.style.background = i < forca.score ? forca.cor : 'var(--border)'; });
    lbl.style.color = forca.cor;
    lbl.textContent = 'Força: ' + forca.label;
  }

  async function onAlterarSenha() {
    const atual = document.getElementById('opcoes-senha-atual').value;
    const nova = document.getElementById('opcoes-senha-nova').value;
    const confirmar = document.getElementById('opcoes-senha-confirmar').value;
    const errEl = document.getElementById('opcoes-senha-error');
    const sucEl = document.getElementById('opcoes-senha-success');
    errEl.style.display = 'none';
    sucEl.style.display = 'none';

    try {
      const sessao = getSessao();
      await service.alterarSenha({ atual, nova, confirmar, email: sessao.email });

      sucEl.textContent = '✅ Senha alterada com sucesso!';
      sucEl.style.display = 'block';
      ['opcoes-senha-atual', 'opcoes-senha-nova', 'opcoes-senha-confirmar'].forEach((id) => { document.getElementById(id).value = ''; });
      document.getElementById('forca-wrap').style.display = 'none';
      showToast('Senha alterada com sucesso!', 'success');
    } catch (err) {
      if (err instanceof ValidationError) {
        errEl.textContent = '❌ ' + err.message;
        errEl.style.display = 'block';
        return;
      }
      if (err instanceof RepositoryError) {
        errEl.textContent = '❌ ' + err.message;
        errEl.style.display = 'block';
        return;
      }
      throw err;
    }
  }

  return { onAvaliarForcaSenha, onAlterarSenha };
}
