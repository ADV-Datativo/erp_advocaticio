// modules/auditoria/auditoria.constants.js

export const AUDIT_MAX = 500; // máximo de registros carregados por vez

export const AUDIT_ICONES = Object.freeze({
  criou: '✅', editou: '✏️', excluiu: '🗑', pagou: '💰',
  login: '🔐', logout: '🚪', importou: '📥', exportou: '📤'
});

export const AUDIT_CORES = Object.freeze({
  criou: { cor: '#0B7B45', bg: '#E2F5EC' },
  editou: { cor: '#185FA5', bg: '#E6F1FB' },
  excluiu: { cor: '#B91C1C', bg: '#FEE2E2' },
  pagou: { cor: '#0B7B45', bg: '#E2F5EC' },
  login: { cor: '#7C3AED', bg: '#EDE9FE' },
  logout: { cor: '#475569', bg: '#F1F5F9' },
  importou: { cor: '#92400E', bg: '#FEF3C7' },
  exportou: { cor: '#92400E', bg: '#FEF3C7' }
});

export const AUDIT_MODULOS = Object.freeze({
  cliente: '👤', processo: '⚖️', financeiro: '💰', despesa: '📤',
  usuario: '👥', documento: '📁', sistema: '⚙️', contrato: '📄', agenda: '📅'
});

export const ICONE_ACAO_PADRAO = '📝';
export const COR_ACAO_PADRAO = Object.freeze({ cor: '#475569', bg: '#F1F5F9' });
export const ICONE_MODULO_PADRAO = '📋';
