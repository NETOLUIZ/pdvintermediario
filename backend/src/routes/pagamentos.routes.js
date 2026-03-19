const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const prisma = new PrismaClient();

/**
 * POST /api/pagamentos/:pedidoId/confirmar
 * Confirma pagamento Pix ou Cartão (SOMENTE ADMIN)
 * Regra crítica do sistema: nenhum pedido pago em Pix/Cartão pode avançar sem confirmação manual.
 */
router.post('/:pedidoId/confirmar', auth, role('ADMIN'), async (req, res) => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: req.params.pedidoId },
      include: { pagamento: true },
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (pedido.forma_pagamento === 'DINHEIRO') {
      return res.status(400).json({ error: 'Pagamento em dinheiro não requer confirmação manual' });
    }

    if (pedido.status_pagamento === 'APROVADO') {
      return res.status(400).json({ error: 'Pagamento já foi confirmado anteriormente' });
    }

    if (!['AGUARDANDO_CONFIRMACAO', 'PENDENTE'].includes(pedido.status_pagamento)) {
      return res.status(400).json({ error: 'Pagamento não está em estado que permita confirmação' });
    }

    // Confirmar em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar pagamento
      await tx.pagamento.update({
        where: { pedido_id: pedido.id },
        data: {
          status: 'APROVADO',
          confirmado: true,
          confirmado_por_id: req.usuario.id,
          confirmado_em: new Date(),
        },
      });

      // Atualizar status do pedido para PAGAMENTO_APROVADO
      const p = await tx.pedido.update({
        where: { id: pedido.id },
        data: {
          status_pagamento: 'APROVADO',
          status_pedido: 'PAGAMENTO_APROVADO',
        },
        include: { pagamento: true, cliente: true, itens: true },
      });

      // Registrar histórico
      await tx.historicoPedido.create({
        data: {
          pedido_id: pedido.id,
          status_anterior: pedido.status_pedido,
          status_novo: 'PAGAMENTO_APROVADO',
          usuario_id: req.usuario.id,
          observacao: `Pagamento ${pedido.forma_pagamento} confirmado manualmente pelo admin`,
        },
      });

      return p;
    });

    res.json({
      message: 'Pagamento confirmado com sucesso! O pedido pode agora ir para preparo.',
      pedido: resultado,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/pagamentos/:pedidoId/recusar
 * Recusa pagamento (SOMENTE ADMIN)
 */
router.post('/:pedidoId/recusar', auth, role('ADMIN'), async (req, res) => {
  try {
    const { motivo } = req.body;
    const pedido = await prisma.pedido.findUnique({
      where: { id: req.params.pedidoId },
      include: { pagamento: true },
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    await prisma.$transaction(async (tx) => {
      await tx.pagamento.update({
        where: { pedido_id: pedido.id },
        data: { status: 'RECUSADO' },
      });
      await tx.pedido.update({
        where: { id: pedido.id },
        data: { status_pagamento: 'RECUSADO', status_pedido: 'CANCELADO' },
      });
      await tx.historicoPedido.create({
        data: {
          pedido_id: pedido.id,
          status_anterior: pedido.status_pedido,
          status_novo: 'CANCELADO',
          usuario_id: req.usuario.id,
          observacao: `Pagamento recusado. Motivo: ${motivo || 'Não informado'}`,
        },
      });
    });

    res.json({ message: 'Pagamento recusado. Pedido cancelado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
