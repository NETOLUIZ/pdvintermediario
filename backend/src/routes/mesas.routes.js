const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const prisma = new PrismaClient();

// GET /api/mesas
router.get('/', auth, async (req, res) => {
  try {
    const mesas = await prisma.mesa.findMany({
      include: {
        pedidos: {
          where: { status_pedido: { notIn: ['FINALIZADO', 'CANCELADO'] } },
          select: { id: true, numero: true, status_pedido: true, valor_total: true },
        },
      },
      orderBy: { numero: 'asc' },
    });
    res.json(mesas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mesas
router.post('/', auth, async (req, res) => {
  try {
    const { numero, nome, capacidade } = req.body;
    const mesa = await prisma.mesa.create({ data: { numero, nome, capacidade } });
    res.status(201).json(mesa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/mesas/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const mesa = await prisma.mesa.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(mesa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/mesas/:id/liberar
router.put('/:id/liberar', auth, async (req, res) => {
  try {
    const mesa = await prisma.mesa.update({
      where: { id: req.params.id },
      data: { status: 'LIVRE' },
    });
    res.json(mesa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
