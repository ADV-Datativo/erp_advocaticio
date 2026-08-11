// badge.test.js — Sprint 6.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderBadge } from './badge.js';

describe('renderBadge', () => {
  test('usa a cor de marca correta (verde Datativo) para variant=success', () => {
    const html = renderBadge({ label: 'Pago', variant: 'success' });
    assert.match(html, /#DCFCE7/); // success[100], fundo
    assert.match(html, /#15803D/); // success[700], texto
  });

  test('variant desconhecida cai pra "neutral" sem quebrar', () => {
    const html = renderBadge({ label: 'X', variant: 'cor-que-nao-existe' });
    assert.match(html, />X<\/span>/);
    assert.doesNotThrow(() => renderBadge({ label: 'X', variant: 'cor-que-nao-existe' }));
  });

  test('ícone é omitido quando não informado (sem espaço sobrando)', () => {
    const html = renderBadge({ label: 'Sem ícone' });
    assert.match(html, />Sem ícone</);
  });

  test('label sempre aparece no HTML final', () => {
    const html = renderBadge({ label: 'Vencido', variant: 'danger', icon: '⚠️' });
    assert.match(html, /Vencido/);
    assert.match(html, /⚠️/);
  });
});
