// core/supabase-client.js
// Único ponto de criação/acesso ao client do Supabase.
// Nenhum outro arquivo do sistema deve chamar `window.supabase.createClient` diretamente.
//
// ATENÇÃO (achado de 06/08/2026): a versão anterior deste arquivo, registrada
// como "resolvida" na documentação do projeto, incluía garantirSessaoValida()
// (revalidação de sessão a cada 2 min + listener de visibilitychange) para
// evitar o bug recorrente de RLS por sessão expirada. Essa proteção NÃO
// estava presente no index.html publicado no momento desta migração — foi
// perdida em algum ponto entre sessões. Reimplementada aqui como parte da
// extração do módulo Financeiro, já que o repository depende de getSB().

const SB_URL = 'https://voufezlvxnihfazimjqe.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdWZlemx2eG5paGZhemltanFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDAwOTcsImV4cCI6MjA5NzM3NjA5N30.AWWNngX-7nK0I9ZgbcJWiC6zNY2dfsBBxC1zaqMWH7s';

export { SB_URL };

let _sb = null;
let _sessaoTimer = null;

/**
 * Retorna o client do Supabase, criando-o (e aguardando o SDK carregar) na
 * primeira chamada. Chamadas seguintes reaproveitam a mesma instância.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient|null>}
 */
export async function getSB() {
  if (_sb) return _sb;
  for (let i = 0; i < 50; i++) {
    if (window.supabase) {
      _sb = window.supabase.createClient(SB_URL, SB_ANON);
      iniciarChecagemDeSessao();
      return _sb;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  console.warn('SDK Supabase não carregou');
  return null;
}

/**
 * Confirma que a sessão ainda é válida no servidor; tenta refresh se preciso;
 * força logout limpo se nem isso funcionar. Chamada a cada 2 min e sempre
 * que a aba volta a ficar visível — mitiga o bug recorrente de RLS "vazio"
 * causado por sessão expirada em segundo plano.
 */
export async function garantirSessaoValida() {
  const sb = await getSB();
  if (!sb) return false;
  const { data: { user }, error } = await sb.auth.getUser();
  if (user && !error) return true;

  const { data: refreshed, error: refreshError } = await sb.auth.refreshSession();
  if (refreshed?.session && !refreshError) return true;

  console.warn('Sessão inválida e não renovável — efetuando logout.');
  await sb.auth.signOut();
  return false;
}

function iniciarChecagemDeSessao() {
  if (_sessaoTimer) return;
  _sessaoTimer = setInterval(garantirSessaoValida, 2 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') garantirSessaoValida();
  });
}
