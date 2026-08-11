// recebimentos.service.test.js — Sprint 6.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getStatusParcela, calcularNovoValor, calcularResumoFinanceiro } from './recebimentos.service.js';

const isVencidoStub = (data) => data < '2026-08-10'; // stub simples, mesma assinatura do real

describe('getStatusParcela', () => {
  test('parcela paga é sempre "pago", mesmo com vencimento no passado', () => {
    assert.equal(getStatusParcela({ status: 'pago', vencimento: '2020-01-01' }, isVencidoStub), 'pago');
  });
  test('parcela não paga com vencimento passado é "vencido"', () => {
    assert.equal(getStatusParcela({ status: 'pendente', vencimento: '2026-07-01' }, isVencidoStub), 'vencido');
  });
  test('parcela não paga com vencimento futuro é "pendente"', () => {
    assert.equal(getStatusParcela({ status: 'pendente', vencimento: '2026-09-01' }, isVencidoStub), 'pendente');
  });
});

describe('calcularNovoValor (desconto/acréscimo/juros)', () => {
  test('desconto percentual', () => {
    const r = calcularNovoValor(1000, { tipo: 'desconto', modalidade: 'percentual', input: 10 });
    assert.equal(r, 900);
  });
  test('desconto em valor fixo', () => {
    const r = calcularNovoValor(1000, { tipo: 'desconto', modalidade: 'fixo', input: 150 });
    assert.equal(r, 850);
  });
  test('acréscimo percentual', () => {
    const r = calcularNovoValor(1000, { tipo: 'acrescimo', modalidade: 'percentual', input: 5 });
    assert.equal(r, 1050);
  });
  test('desconto nunca deixa o valor negativo (trava em zero)', () => {
    const r = calcularNovoValor(100, { tipo: 'desconto', modalidade: 'fixo', input: 500 });
    assert.equal(r, 0);
  });
  test('sem input válido (0 ou negativo), retorna o valor original sem alterar', () => {
    const r = calcularNovoValor(1000, { tipo: 'desconto', modalidade: 'percentual', input: 0 });
    assert.equal(r, 1000);
  });
});

describe('calcularResumoFinanceiro', () => {
  test('separa corretamente pago, vencido e a receber', () => {
    const parcelas = [
      { valor: 100, status: 'pago', vencimento: '2026-01-01' },
      { valor: 50,  status: 'pendente', vencimento: '2026-07-01' }, // vencida (passado)
      { valor: 30,  status: 'pendente', vencimento: '2026-09-01' }  // a receber (futuro)
    ];
    const r = calcularResumoFinanceiro(parcelas, isVencidoStub);
    assert.equal(r.totalRecebido, 100);
    assert.equal(r.totalVencido, 50);
    assert.equal(r.totalAReceber, 30);
    assert.equal(r.totalContratado, 180);
  });
});
