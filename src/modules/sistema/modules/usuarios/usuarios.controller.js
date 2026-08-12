// modules/usuarios/usuarios.controller.js
// Única camada que lê o DOM e dispara efeito de UI.
//
// removerUsuario() já tinha checagem de RBAC real instrumentada na
// Sprint 8 (achado crítico da auditoria de segurança) — preservada
// aqui, agora via `import` direto do Core em vez da ponte por window
// que o monólito precisava usar.

import * as service from './usuarios.service.js';
import * as state from './usuarios.state.js';
import { ValidationError } from './usuarios.validation.js';
import { RepositoryError } from './usuarios.repository.js';
import { pode } from '../../../../core/permissions/index.js';

export function criarControllerUsuarios(deps) {
  const { showToast, registrarAuditoria, getSessao, getPerfilAtual, PERFIS, openModal, closeModal } = deps;

  function renderizarTabelaUsuarios() {
    const tb = document.getElementById('tbody-usuarios');
    if (!tb) return;
    const usuarios = state.listarUsuarios();
    const meuUserId = getSessao().userId;
    const isAdmin = getPerfilAtual() === 'admin';

    if (!usuarios.length) {
      tb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:28px">Nenhum usuário encontrado.</td></tr>';
      return;
    }
    tb.innerHTML = usuarios.map((u) => {
      const p = PERFIS[u.papel] || PERFIS.assistente;
      const sou = u.usuario_id === meuUserId;
      const dataCad = u.criado_em ? new Date(u.criado_em).toLocaleDateString('pt-BR') : '—';
      return `<tr>
        <td><strong>${sou ? 'Você' : (u.usuario_id || '').slice(0, 8) + '…'}</strong></td>
        <td style="color:var(--text-muted);font-size:12px">—</td>
        <td><span class="badge" style="background:${p.bg};color:${p.cor}">${p.label}</span></td>
        <td><span class="badge ${u.ativo ? 'badge-green' : 'badge-gray'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
        <td style="font-size:12px;color:var(--text-muted)">${dataCad}</td>
        <td style="white-space:nowrap">
          ${!sou && isAdmin ? `<button class="btn btn-danger btn-sm" onclick="removerUsuarioEscritorio('${u.id}')" title="Remover acesso">🗑</button>` : ''}
        </td>
      </tr>`;
    }).join('');
  }

  function renderizarTabelaConvites() {
    const tb = document.getElementById('tbody-convites');
    if (!tb) return;
    const convites = state.listarConvites();
    if (!convites.length) {
      tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">Nenhum convite pendente.</td></tr>';
      return;
    }
    tb.innerHTML = convites.map((c) => {
      const p = PERFIS[c.papel] || PERFIS.assistente;
      const enviado = c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '—';
      const expira = c.expira_em ? new Date(c.expira_em).toLocaleDateString('pt-BR') : '—';
      return `<tr>
        <td>${c.email}</td>
        <td><span class="badge" style="background:${p.bg};color:${p.cor}">${p.label}</span></td>
        <td style="font-size:12px;color:var(--text-muted)">${enviado}</td>
        <td style="font-size:12px;color:var(--text-muted)">${expira}</td>
        <td><button class="btn btn-outline btn-sm" onclick="cancelarConvite('${c.id}')">Cancelar</button></td>
      </tr>`;
    }).join('');
  }

  async function onRenderConvitesPendentes() {
    const tb = document.getElementById('tbody-convites');
    if (tb) tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">Carregando...</td></tr>';
    await service.carregarEArmazenarConvites();
    renderizarTabelaConvites();
  }

  async function onRenderUsuarios() {
    const tb = document.getElementById('tbody-usuarios');
    const restrito = document.getElementById('bloco-usuarios-restrito');
    const conteudo = document.getElementById('bloco-usuarios-conteudo');
    if (!tb) return;

    const isAdmin = getPerfilAtual() === 'admin';
    if (restrito) restrito.style.display = isAdmin ? 'none' : 'block';
    if (conteudo) conteudo.style.display = 'block';

    tb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:28px">Carregando...</td></tr>';
    await service.carregarEArmazenarUsuarios();
    renderizarTabelaUsuarios();
    await onRenderConvitesPendentes();
  }

  function onAbrirModalConvite() {
    document.getElementById('convite-email').value = '';
    document.getElementById('convite-papel').value = 'advogado';
    openModal('modal-convite', false);
  }

  async function onEnviarConvite() {
    const email = document.getElementById('convite-email').value.trim().toLowerCase();
    const papel = document.getElementById('convite-papel').value;
    const btn = document.getElementById('btn-enviar-convite');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      await service.enviarConvite({ email, papel });
      registrarAuditoria('criou', 'usuario', 'Convite enviado para ' + email, 'Papel: ' + papel);
      showToast('📨 Convite enviado para ' + email + '!', 'success');
      closeModal('modal-convite');
      renderizarTabelaConvites();
    } catch (err) {
      if (err instanceof ValidationError || err instanceof RepositoryError) {
        showToast(err.message, 'error');
        return;
      }
      throw err;
    } finally {
      btn.disabled = false;
      btn.textContent = '📨 Enviar Convite';
    }
  }

  async function onCancelarConvite(id) {
    if (!confirm('Cancelar este convite?')) return;
    const ok = await service.cancelarConvite(id);
    if (!ok) { showToast('Erro ao cancelar.', 'error'); return; }
    showToast('Convite cancelado.');
    renderizarTabelaConvites();
  }

  async function onRemoverUsuario(id) {
    if (!pode('sistema.usuarios.delete')) {
      showToast('Você não tem permissão para remover acesso de usuários.', 'error');
      return;
    }
    if (!confirm('Remover o acesso desta pessoa a este escritório?')) return;
    const ok = await service.removerUsuario(id);
    if (!ok) { showToast('Erro ao remover acesso.', 'error'); return; }
    registrarAuditoria('excluiu', 'usuario', 'Acesso removido', '');
    showToast('Acesso removido.');
    renderizarTabelaUsuarios();
  }

  return {
    onRenderUsuarios,
    onRenderConvitesPendentes,
    onAbrirModalConvite,
    onEnviarConvite,
    onCancelarConvite,
    onRemoverUsuario
  };
}
