const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const prisma = new PrismaClient();

// GET /api/clientes
router.get('/', auth, async (req, res) => {
  try {
    const { busca } = req.query;
    const where = busca
      ? { OR: [{ nome: { contains: busca, mode: 'insensitive' } }, { telefone: { contains: busca } }] }
      : {};
    const clientes = await prisma.cliente.findMany({ where, orderBy: { nome: 'asc' } });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({ where: { id: req.params.id } });
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes
router.post('/', auth, async (req, res) => {
  try {
    const { nome, telefone, endereco, numero, bairro, complemento, referencia } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    const cliente = await prisma.cliente.create({
      data: { nome, telefone, endereco, numero, bairro, complemento, referencia },
    });
    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clientes/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { nome, telefone, endereco, numero, bairro, complemento, referencia } = req.body;
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: { nome, telefone, endereco, numero, bairro, complemento, referencia },
    });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cliente excluído' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
