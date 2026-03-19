const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const prisma = new PrismaClient();

// GET /api/categorias
router.get('/', auth, async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      include: { _count: { select: { produtos: true } } },
      orderBy: { ordem: 'asc' },
    });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categorias
router.post('/', auth, role('ADMIN'), async (req, res) => {
  try {
    const { nome, tipo, ordem } = req.body;
    if (!nome || !tipo) return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
    const cat = await prisma.categoria.create({ data: { nome, tipo, ordem: ordem || 0 } });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categorias/:id
router.put('/:id', auth, role('ADMIN'), async (req, res) => {
  try {
    const cat = await prisma.categoria.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
