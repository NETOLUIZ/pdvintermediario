const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const prisma = new PrismaClient();

// GET /api/caixa/atual
router.get('/atual', auth, async (req, res) => {
  try {
    const caixa = await prisma.caixa.findFirst({
      where: { status: 'ABERTO' },
      include: {
        aberto_por: { select: { id: true, nome: true } },
        movimentacoes: { orderBy: { criado_em: 'desc' } },
      },
      orderBy: { data_abertura: 'desc' },
    });
    res.json(caixa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/caixa - Listar histórico
router.get('/', auth, async (req, res) => {
  try {
    const caixas = await prisma.caixa.findMany({
      include: {
        aberto_por: { select: { nome: true } },
        fechado_por: { select: { nome: true } },
      },
      orderBy: { data_abertura: 'desc' },
      take: 30,
    });
    res.json(caixas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/caixa/abrir
router.post('/abrir', auth, async (req, res) => {
  try {
    const { valor_inicial = 0 } = req.body;
    const caixaAberto = await prisma.caixa.findFirst({ where: { status: 'ABERTO' } });
    if (caixaAberto) {
      return res.status(400).json({ error: 'Já existe um caixa aberto. Feche-o antes de abrir um novo.' });
    }
    const caixa = await prisma.caixa.create({
      data: { valor_inicial: parseFloat(valor_inicial), aberto_por_id: req.usuario.id },
      include: { aberto_por: { select: { nome: true } } },
    });
    res.status(201).json(caixa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/caixa/:id/fechar
router.post('/:id/fechar', auth, async (req, res) => {
  try {
    const { valor_fechamento, observacao_fechamento } = req.body;
    const caixa = await prisma.caixa.findUnique({ where: { id: req.params.id } });
    if (!caixa || caixa.status !== 'ABERTO') {
      return res.status(400).json({ error: 'Caixa não encontrado ou já fechado' });
    }
    const caixaFechado = await prisma.caixa.update({
      where: { id: req.params.id },
      data: {
        status: 'FECHADO',
        data_fechamento: new Date(),
        valor_fechamento: valor_fechamento ? parseFloat(valor_fechamento) : null,
        fechado_por_id: req.usuario.id,
        observacao_fechamento,
      },
      include: { aberto_por: { select: { nome: true } }, fechado_por: { select: { nome: true } } },
    });
    res.json(caixaFechado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/caixa/:id/movimentacao
router.post('/:id/movimentacao', auth, async (req, res) => {
  try {
    const { tipo, descricao, valor } = req.body;
    if (!tipo || !descricao || !valor) {
      return res.status(400).json({ error: 'Tipo, descrição e valor são obrigatórios' });
    }
    const mov = await prisma.movimentacaoCaixa.create({
      data: { caixa_id: req.params.id, tipo, descricao, valor: parseFloat(valor) },
    });
    res.status(201).json(mov);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/caixa/:id/resumo
router.get('/:id/resumo', auth, async (req, res) => {
  try {
    const caixa = await prisma.caixa.findUnique({
      where: { id: req.params.id },
      include: { movimentacoes: true },
    });
    if (!caixa) return res.status(404).json({ error: 'Caixa não encontrado' });

    // Buscar pedidos no período do caixa
    const pedidos = await prisma.pedido.findMany({
      where: {
        criado_em: { gte: caixa.data_abertura, ...(caixa.data_fechamento ? { lte: caixa.data_fechamento } : {}) },
        status_pedido: { notIn: ['CANCELADO'] },
        status_pagamento: 'APROVADO',
      },
      select: { valor_total: true, forma_pagamento: true },
    });

    // Totais por forma de pagamento
    const totaisPorForma = {
      DINHEIRO: 0, PIX: 0, CARTAO_DEBITO: 0, CARTAO_CREDITO: 0,
    };
    let totalVendas = 0;
    pedidos.forEach((p) => {
      const val = parseFloat(p.valor_total);
      totaisPorForma[p.forma_pagamento] = (totaisPorForma[p.forma_pagamento] || 0) + val;
      totalVendas += val;
    });

    // Movimentações
    const totalEntradas = caixa.movimentacoes.filter(m => m.tipo === 'ENTRADA').reduce((s, m) => s + parseFloat(m.valor), 0);
    const totalSaidas = caixa.movimentacoes.filter(m => m.tipo === 'SAIDA').reduce((s, m) => s + parseFloat(m.valor), 0);

    res.json({
      caixa,
      resumo: {
        total_vendas: totalVendas,
        totais_por_forma: totaisPorForma,
        total_pedidos: pedidos.length,
        saldo_movimentacoes: totalEntradas - totalSaidas,
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        saldo_final: parseFloat(caixa.valor_inicial) + totalVendas + totalEntradas - totalSaidas,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
