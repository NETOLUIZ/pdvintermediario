const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const prisma = new PrismaClient();

// GET /api/usuarios
router.get('/', auth, role('ADMIN'), async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, criado_em: true },
      orderBy: { nome: 'asc' },
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/usuarios
router.post('/', auth, role('ADMIN'), async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email já cadastrado' });
    const senha_hash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha_hash, perfil: perfil || 'ATENDENTE' },
      select: { id: true, nome: true, email: true, perfil: true, ativo: true },
    });
    res.status(201).json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', auth, role('ADMIN'), async (req, res) => {
  try {
    const { nome, email, senha, perfil, ativo } = req.body;
    const data = { nome, email, perfil, ativo };
    if (senha) data.senha_hash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data,
      select: { id: true, nome: true, email: true, perfil: true, ativo: true },
    });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', auth, role('ADMIN'), async (req, res) => {
  try {
    if (req.params.id === req.usuario.id) return res.status(400).json({ error: 'Não pode excluir o próprio usuário' });
    await prisma.usuario.update({ where: { id: req.params.id }, data: { ativo: false } });
    res.json({ message: 'Usuário desativado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
