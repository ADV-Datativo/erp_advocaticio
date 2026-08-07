// modules/diario-oficial/diario-oficial.constants.js

/** Mapa de status -> aparência visual da publicação. */
export const STATUS_PUBLICACAO = Object.freeze({
  nova:          { icon: '🆕', cor: '#185FA5', bg: '#E6F1FB', label: 'Nova' },
  lida:          { icon: '👁', cor: '#8a6d00', bg: '#FFF6DD', label: 'Lida' },
  providenciada: { icon: '⚙️', cor: '#7c3aed', bg: '#F1E9FE', label: 'Providenciada' },
  concluida:     { icon: '✅', cor: '#0B7B45', bg: '#E2F5EC', label: 'Concluída' }
});

export const STATUS_PADRAO = 'nova';
export const LIMITE_CARACTERES_TRECHO = 220;
export const ORIGEM_MANUAL = 'manual';
