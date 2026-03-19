const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const prisma = new PrismaClient();

// ─── Funções auxiliares ────────────────────────────────────────

/**
 * Registra histórico de mudança de status do pedido
 */
async function registrarHistorico(pedidoId, statusAnterior, statusNovo, usuarioId, obs) {
  await prisma.historicoPedido.create({
    data: {
      pedido_id: pedidoId,
      status_anterior: statusAnterior,
      status_novo: statusNovo,
      usuario_id: usuarioId,
      observacao: obs || null,
    },
  });
}

/**
 * Define status inicial de pagamento por forma de pagamento.
 * Dinheiro → APROVADO (direto)
 * Pix/Cartão → AGUARDANDO_CONFIRMACAO
 */
function statusPagamentoInicial(forma) {
  return forma === 'DINHEIRO' ? 'APROVADO' : 'AGUARDANDO_CONFIRMACAO';
}

/**
 * Define status inicial do pedido por forma de pagamento.
 * Dinheiro → PAGAMENTO_APROVADO
 * Pix/Cartão → AGUARDANDO_PAGAMENTO
 */
function statusPedidoInicial(forma) {
  return forma === 'DINHEIRO' ? 'PAGAMENTO_APROVADO' : 'AGUARDANDO_PAGAMENTO';
}

// ─── TRANSIÇÕES PERMITIDAS DE STATUS ──────────────────────────
const transicoesPermitidas = {
  NOVO: ['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_APROVADO', 'CANCELADO'],
  AGUARDANDO_PAGAMENTO: ['PAGAMENTO_APROVADO', 'CANCELADO'],
  PAGAMENTO_APROVADO: ['EM_PREPARO', 'CANCELADO'],
  EM_PREPARO: ['PRONTO', 'CANCELADO'],
  PRONTO: ['SAIU_ENTREGA', 'ENTREGUE', 'FINALIZADO'],
  SAIU_ENTREGA: ['ENTREGUE'],
  ENTREGUE: ['FINALIZADO'],
  FINALIZADO: [],
  CANCELADO: [],
};

// ─── GET /api/pedidos ──────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { status_pedido, tipo_atendimento, forma_pagamento, status_pagamento, data_inicio, data_fim, busca, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status_pedido) where.status_pedido = status_pedido;
    if (tipo_atendimento) where.tipo_atendimento = tipo_atendimento;
    if (forma_pagamento) where.forma_pagamento = forma_pagamento;
    if (status_pagamento) where.status_pagamento = status_pagamento;
    if (data_inicio || data_fim) {
      where.criado_em = {};
      if (data_inicio) where.criado_em.gte = new Date(data_inicio);
      if (data_fim) where.criado_em.lte = new Date(data_fim + 'T23:59:59');
    }
    if (busca) {
      where.OR = [
        { cliente: { nome: { contains: busca, mode: 'insensitive' } } },
        { numero: isNaN(busca) ? undefined : parseInt(busca) },
      ].filter(Boolean);
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          cliente: true,
          mesa: true,
          operador: { select: { id: true, nome: true } },
          itens: { include: { produto: true } },
          pagamento: true,
        },
        orderBy: { criado_em: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.pedido.count({ where }),
    ]);

    res.json({ pedidos, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/pedidos/:id ──────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: req.params.id },
      include: {
        cliente: true,
        mesa: true,
        operador: { select: { id: true, nome: true } },
        itens: { include: { produto: { include: { categoria: true } } } },
        pagamento: {
          include: { confirmado_por: { select: { id: true, nome: true } } },
        },
        historico: {
          include: { usuario: { select: { id: true, nome: true } } },
          orderBy: { criado_em: 'asc' },
        },
      },
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/pedidos ─────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const {
      tipo_atendimento, cliente_id, mesa_id, forma_pagamento,
      taxa_entrega = 0, desconto = 0, observacao, itens,
      valor_recebido, // para dinheiro
    } = req.body;

    if (!tipo_atendimento) return res.status(400).json({ error: 'Tipo de atendimento é obrigatório' });
    if (!itens || itens.length === 0) return res.status(400).json({ error: 'Pedido deve ter pelo menos 1 item' });
    if (!forma_pagamento) return res.status(400).json({ error: 'Forma de pagamento é obrigatória' });

    // Calcular subtotal
    let subtotal = 0;
    const itensCalculados = itens.map((item) => {
      const precoTotal = parseFloat(item.preco_unit) * item.quantidade;
      subtotal += precoTotal;
      return { ...item, preco_total: precoTotal };
    });

    const valor_total = subtotal + parseFloat(taxa_entrega) - parseFloat(desconto);

    // Status iniciais baseados na forma de pagamento
    const statusPag = statusPagamentoInicial(forma_pagamento);
    const statusPed = statusPedidoInicial(forma_pagamento);

    // Troco (apenas para dinheiro)
    const troco = forma_pagamento === 'DINHEIRO' && valor_recebido
      ? parseFloat(valor_recebido) - valor_total
      : null;

    // Criar pedido com itens e pagamento em uma transação
    const pedido = await prisma.$transaction(async (tx) => {
      const ultimoPedido = await tx.pedido.aggregate({
        _max: { numero: true },
      });
      const proximoNumero = (ultimoPedido._max.numero || 0) + 1;

      const novoPedido = await tx.pedido.create({
        data: {
          numero: proximoNumero,
          tipo_atendimento,
          status_pedido: statusPed,
          status_pagamento: statusPag,
          forma_pagamento,
          subtotal,
          taxa_entrega: parseFloat(taxa_entrega),
          desconto: parseFloat(desconto),
          valor_total,
          observacao,
          cliente_id: cliente_id || null,
          mesa_id: mesa_id || null,
          operador_id: req.usuario.id,
          itens: {
            create: itensCalculados.map((item) => ({
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              tamanho: item.tamanho || null,
              sabores: item.sabores || [],
              borda: item.borda || null,
              preco_unit: parseFloat(item.preco_unit),
              preco_total: item.preco_total,
              observacao: item.observacao || null,
              adicionais: item.adicionais || [],
            })),
          },
          pagamento: {
            create: {
              forma: forma_pagamento,
              valor: valor_total,
              valor_recebido: valor_recebido ? parseFloat(valor_recebido) : null,
              troco: troco,
              status: statusPag,
              confirmado: forma_pagamento === 'DINHEIRO',
              confirmado_por_id: forma_pagamento === 'DINHEIRO' ? req.usuario.id : null,
              confirmado_em: forma_pagamento === 'DINHEIRO' ? new Date() : null,
            },
          },
        },
        include: { itens: true, pagamento: true, cliente: true, mesa: true },
      });

      // Registrar histórico inicial
      await tx.historicoPedido.create({
        data: {
          pedido_id: novoPedido.id,
          status_anterior: null,
          status_novo: statusPed,
          usuario_id: req.usuario.id,
          observacao: `Pedido criado - Pagamento: ${forma_pagamento}`,
        },
      });

      // Se mesa, marcar como ocupada
      if (mesa_id) {
        await tx.mesa.update({ where: { id: mesa_id }, data: { status: 'OCUPADA' } });
      }

      return novoPedido;
    });

    res.status(201).json(pedido);
  } catch (err) {
    console.error('[POST /pedidos]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/pedidos/:id/status ──────────────────────────────
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Novo status é obrigatório' });

    const pedido = await prisma.pedido.findUnique({
      where: { id: req.params.id },
      include: { pagamento: true, mesa: true },
    });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Verificar transição válida
    const permitidos = transicoesPermitidas[pedido.status_pedido] || [];
    if (!permitidos.includes(status)) {
      return res.status(400).json({
        error: `Não é possível mudar de "${pedido.status_pedido}" para "${status}"`,
        statusAtual: pedido.status_pedido,
        permitidos,
      });
    }

    // ══════════════════════════════════════════════════════════
    // REGRA CRÍTICA: Bloqueio de avanço sem pagamento confirmado
    // Pix e Cartão NÃO podem avançar para EM_PREPARO sem confirmação
    // ══════════════════════════════════════════════════════════
    const statusQueExigemPagamento = ['EM_PREPARO', 'PRONTO', 'SAIU_ENTREGA', 'ENTREGUE', 'FINALIZADO'];
    if (statusQueExigemPagamento.includes(status) && pedido.status_pagamento !== 'APROVADO') {
      return res.status(403).json({
        error: 'Pagamento não confirmado. Este pedido não pode avançar para produção ou entrega sem que o pagamento seja confirmado por um administrador.',
        status_pagamento: pedido.status_pagamento,
        forma_pagamento: pedido.forma_pagamento,
      });
    }

    const statusAnterior = pedido.status_pedido;
    const updatedPedido = await prisma.$transaction(async (tx) => {
      const p = await tx.pedido.update({
        where: { id: req.params.id },
        data: { status_pedido: status },
      });

      // Liberar mesa se finalizado/cancelado
      if (['FINALIZADO', 'CANCELADO'].includes(status) && pedido.mesa_id) {
        await tx.mesa.update({ where: { id: pedido.mesa_id }, data: { status: 'LIVRE' } });
      }

      await tx.historicoPedido.create({
        data: {
          pedido_id: req.params.id,
          status_anterior: statusAnterior,
          status_novo: status,
          usuario_id: req.usuario.id,
        },
      });

      return p;
    });

    res.json(updatedPedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/pedidos/:id/observacao ──────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const { observacao, desconto, taxa_entrega } = req.body;
    const pedido = await prisma.pedido.update({
      where: { id: req.params.id },
      data: { observacao, desconto, taxa_entrega },
    });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
