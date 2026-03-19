const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const prisma = new PrismaClient();

// GET /api/relatorios/vendas
router.get('/vendas', auth, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(data_inicio) : new Date(new Date().setDate(new Date().getDate() - 30));
    const fim = data_fim ? new Date(data_fim + 'T23:59:59') : new Date();

    const pedidos = await prisma.pedido.findMany({
      where: {
        criado_em: { gte: inicio, lte: fim },
        status_pedido: { notIn: ['CANCELADO'] },
        status_pagamento: 'APROVADO',
      },
      include: { cliente: true, itens: { include: { produto: true } } },
      orderBy: { criado_em: 'desc' },
    });

    const total = pedidos.reduce((s, p) => s + parseFloat(p.valor_total), 0);
    const ticketMedio = pedidos.length > 0 ? total / pedidos.length : 0;

    // Agrupado por forma
    const porForma = {};
    pedidos.forEach(p => {
      if (!porForma[p.forma_pagamento]) porForma[p.forma_pagamento] = { total: 0, quantidade: 0 };
      porForma[p.forma_pagamento].total += parseFloat(p.valor_total);
      porForma[p.forma_pagamento].quantidade++;
    });

    // Agrupado por tipo atendimento
    const porAtendimento = {};
    pedidos.forEach(p => {
      if (!porAtendimento[p.tipo_atendimento]) porAtendimento[p.tipo_atendimento] = { total: 0, quantidade: 0 };
      porAtendimento[p.tipo_atendimento].total += parseFloat(p.valor_total);
      porAtendimento[p.tipo_atendimento].quantidade++;
    });

    // Produtos mais vendidos
    const produtosMap = {};
    pedidos.forEach(p => {
      p.itens.forEach(item => {
        const key = item.produto_id;
        if (!produtosMap[key]) {
          produtosMap[key] = { nome: item.produto?.nome || 'Desconhecido', quantidade: 0, total: 0 };
        }
        produtosMap[key].quantidade += item.quantidade;
        produtosMap[key].total += parseFloat(item.preco_total);
      });
    });
    const produtosMaisVendidos = Object.values(produtosMap)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    // Agrupado por dia
    const porDia = {};
    pedidos.forEach(p => {
      const dia = p.criado_em.toISOString().split('T')[0];
      if (!porDia[dia]) porDia[dia] = { data: dia, total: 0, quantidade: 0 };
      porDia[dia].total += parseFloat(p.valor_total);
      porDia[dia].quantidade++;
    });

    res.json({
      periodo: { inicio, fim },
      total_pedidos: pedidos.length,
      total_vendido: total,
      ticket_medio: ticketMedio,
      por_forma_pagamento: porForma,
      por_tipo_atendimento: porAtendimento,
      produtos_mais_vendidos: produtosMaisVendidos,
      vendas_por_dia: Object.values(porDia).sort((a, b) => a.data.localeCompare(b.data)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/relatorios/cancelamentos
router.get('/cancelamentos', auth, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    const inicio = data_inicio ? new Date(data_inicio) : new Date(new Date().setDate(new Date().getDate() - 30));
    const fim = data_fim ? new Date(data_fim + 'T23:59:59') : new Date();

    const pedidos = await prisma.pedido.findMany({
      where: {
        criado_em: { gte: inicio, lte: fim },
        status_pedido: 'CANCELADO',
      },
      include: { cliente: true, operador: { select: { nome: true } } },
      orderBy: { criado_em: 'desc' },
    });

    res.json({
      total: pedidos.length,
      valor_perdido: pedidos.reduce((s, p) => s + parseFloat(p.valor_total), 0),
      pedidos,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
