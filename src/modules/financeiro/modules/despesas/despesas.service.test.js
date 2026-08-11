// despesas.service.test.js
// Sprint 6 (Testes). Roda com `node --test` (nativo do Node 22+, zero
// dependência de pacote externo — mesma filosofia "sem build step" do
// resto do projeto). Cobre as funções puras de cálculo (sem DOM, sem
// Supabase) — as mais críticas pra não quebrar silenciosamente.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calcularResumoCards, filtrarEOrdenarDespesas, atualizarStatusVencidas } from './despesas.service.js';

const hoje = () => '2026-08-10';

describe('calcularResumoCards', () => {
  test('soma corretamente despesas do mês, vencidas, a vencer e pagas', () => {
    const despesas = [
      { valor: 100, vencimento: '2026-08-15', status: 'pendente', dataPagamento: '' },  // do mês, a vencer (dentro de 30 dias)
      { valor: 50,  vencimento: '2026-07-20', status: 'vencido',  dataPagamento: '' },   // vencida
      { valor: 200, vencimento: '2026-08-05', status: 'pago',     dataPagamento: '2026-08-05' }, // paga, do mês
      { valor: 30,  vencimento: '2026-09-15', status: 'pendente', dataPagamento: '' }    // fora do mês e fora da janela de 30 dias
    ];
    const r = calcularResumoCards(despesas, hoje);
    assert.equal(r.totalVencidas, 50);
    assert.equal(r.qtdVencidas, 1);
    assert.equal(r.totalPagas, 200);
    assert.equal(r.qtdPagas, 1);
    // "do mês" conta só as com vencimento em agosto/2026 (item 1 e 3);
    // a de julho (item 2) e a de setembro (item 4) ficam de fora
    assert.equal(r.qtdMes, 2);
  });

  test('lista vazia não quebra e retorna zeros', () => {
    const r = calcularResumoCards([], hoje);
    assert.equal(r.totalMes, 0);
    assert.equal(r.totalVencidas, 0);
    assert.equal(r.totalAVencer, 0);
    assert.equal(r.totalPagas, 0);
  });

  test('janela de "a vencer" usa a data INJETADA (today), não o relógio real da máquina', () => {
    // Achado real (10/08/2026): a função usava `new Date()` direto em vez
    // do parâmetro `today` pra calcular a janela de 30 dias — quebrava o
    // determinismo. Este teste trava a correção: usando uma data injetada
    // bem no passado, a despesa não pode aparecer como "a vencer" nos
    // próximos 30 dias A PARTIR DESSA DATA, mesmo que o relógio real da
    // máquina esteja em outro lugar.
    const todayAntigo = () => '2020-01-01';
    const despesas = [{ valor: 99, vencimento: '2020-01-15', status: 'pendente', dataPagamento: '' }];
    const r = calcularResumoCards(despesas, todayAntigo);
    assert.equal(r.totalAVencer, 99, 'deveria contar como "a vencer" em relação a 2020-01-01, não à data real de hoje');
  });
});

describe('filtrarEOrdenarDespesas', () => {
  const despesas = [
    { valor: 10, vencimento: '2026-08-20', status: 'pendente', categoria: 'aluguel' },
    { valor: 20, vencimento: '2026-08-05', status: 'pago', categoria: 'internet' },
    { valor: 30, vencimento: '2026-08-15', status: 'pendente', categoria: 'aluguel' }
  ];

  test('filtra por status', () => {
    const r = filtrarEOrdenarDespesas(despesas, { status: 'pago', categoria: '', mes: '' });
    assert.equal(r.length, 1);
    assert.equal(r[0].categoria, 'internet');
  });

  test('filtra por categoria', () => {
    const r = filtrarEOrdenarDespesas(despesas, { status: '', categoria: 'aluguel', mes: '' });
    assert.equal(r.length, 2);
  });

  test('ordena por vencimento crescente, sem alterar o array original', () => {
    const r = filtrarEOrdenarDespesas(despesas, { status: '', categoria: '', mes: '' });
    assert.deepEqual(r.map(d => d.vencimento), ['2026-08-05', '2026-08-15', '2026-08-20']);
    // confirma que a função não muta a lista original (efeito colateral escondido seria bug grave)
    assert.equal(despesas[0].vencimento, '2026-08-20');
  });
});

describe('atualizarStatusVencidas', () => {
  test('marca como vencido só o que está pendente E com data passada', () => {
    const despesas = [
      { status: 'pendente', vencimento: '2026-08-01' }, // já passou
      { status: 'pendente', vencimento: '2026-08-20' }, // ainda não venceu
      { status: 'pago',     vencimento: '2026-08-01' }  // já pago, não deve virar "vencido"
    ];
    atualizarStatusVencidas(despesas, hoje);
    assert.equal(despesas[0].status, 'vencido');
    assert.equal(despesas[1].status, 'pendente');
    assert.equal(despesas[2].status, 'pago'); // nunca sobrescreve status pago
  });
});
