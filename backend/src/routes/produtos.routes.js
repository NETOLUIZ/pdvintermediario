const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const prisma = new PrismaClient();

// GET /api/produtos
router.get('/', auth, async (req, res) => {
  try {
    const { categoria_id, tipo, ativo, busca } = req.query;
    const where = {};
    if (categoria_id) where.categoria_id = categoria_id;
    if (tipo) where.tipo = tipo;
    if (ativo !== undefined) where.ativo = ativo === 'true';
    if (busca) where.nome = { contains: busca, mode: 'insensitive' };
    const produtos = await prisma.produto.findMany({
      where,
      include: { categoria: true, tamanhos: { where: { ativo: true } }, sabores: { where: { ativo: true } } },
      orderBy: { nome: 'asc' },
    });
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/produtos/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: req.params.id },
      include: { categoria: true, tamanhos: true, sabores: true },
    });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/produtos
router.post('/', auth, role('ADMIN'), async (req, res) => {
  try {
    const { nome, descricao, imagem_url, tipo, categoria_id, tamanhos, sabores } = req.body;
    if (!nome || !tipo || !categoria_id) return res.status(400).json({ error: 'Nome, tipo e categoria são obrigatórios' });
    const produto = await prisma.produto.create({
      data: {
        nome, descricao, imagem_url, tipo, categoria_id,
        tamanhos: tamanhos ? { create: tamanhos } : undefined,
        sabores: sabores ? { create: sabores } : undefined,
      },
      include: { tamanhos: true, sabores: true, categoria: true },
    });
    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/produtos/:id
router.put('/:id', auth, role('ADMIN'), async (req, res) => {
  try {
    const { nome, descricao, imagem_url, ativo, categoria_id } = req.body;
    const produto = await prisma.produto.update({
      where: { id: req.params.id },
      data: { nome, descricao, imagem_url, ativo, categoria_id },
      include: { tamanhos: true, sabores: true, categoria: true },
    });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/produtos/:id
router.delete('/:id', auth, role('ADMIN'), async (req, res) => {
  try {
    await prisma.produto.update({ where: { id: req.params.id }, data: { ativo: false } });
    res.json({ message: 'Produto desativado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/produtos/:id/tamanhos
router.post('/:id/tamanhos', auth, role('ADMIN'), async (req, res) => {
  try {
    const { tamanho, preco } = req.body;
    const tam = await prisma.tamanhoProduto.create({
      data: { produto_id: req.params.id, tamanho, preco },
    });
    res.status(201).json(tam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/produtos/:id/sabores
router.post('/:id/sabores', auth, role('ADMIN'), async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const sabor = await prisma.sabor.create({
      data: { produto_id: req.params.id, nome, descricao },
    });
    res.status(201).json(sabor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
