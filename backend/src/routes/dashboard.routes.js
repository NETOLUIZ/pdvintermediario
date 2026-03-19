const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth.middleware');
const prisma = new PrismaClient();

// GET /api/dashboard
router.get('/', auth, async (req, res) => {
  try {
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

    const where = { criado_em: { gte: inicioDia, lte: fimDia } };

    // Buscar todos pedidos do dia
    const pedidosDia = await prisma.pedido.findMany({
      where,
      select: {
        id: true, status_pedido: true, status_pagamento: true,
        forma_pagamento: true, valor_total: true, tipo_atendimento: true,
      },
    });

    const total = pedidosDia.length;
    const totalVendido = pedidosDia
      .filter(p => !['CANCELADO'].includes(p.status_pedido) && p.status_pagamento === 'APROVADO')
      .reduce((s, p) => s + parseFloat(p.valor_total), 0);

    const totalAguardandoPagamento = pedidosDia
      .filter(p => !['CANCELADO'].includes(p.status_pedido) && p.status_pagamento !== 'APROVADO')
      .reduce((s, p) => s + parseFloat(p.valor_total), 0);

    const countStatus = (status) => pedidosDia.filter(p => p.status_pedido === status).length;
    const totalPorForma = (forma) => pedidosDia
      .filter(p => p.forma_pagamento === forma && p.status_pagamento === 'APROVADO')
      .reduce((s, p) => s + parseFloat(p.valor_total), 0);

    const ticketMedio = total > 0 ? totalVendido / (pedidosDia.filter(p => p.status_pagamento === 'APROVADO').length || 1) : 0;

    res.json({
      total_pedidos: total,
      total_vendido: totalVendido,
      total_aguardando_pagamento: totalAguardandoPagamento,
      ticket_medio: ticketMedio,
      por_status: {
        novo: countStatus('NOVO'),
        aguardando_pagamento: countStatus('AGUARDANDO_PAGAMENTO'),
        pagamento_aprovado: countStatus('PAGAMENTO_APROVADO'),
        em_preparo: countStatus('EM_PREPARO'),
        pronto: countStatus('PRONTO'),
        saiu_entrega: countStatus('SAIU_ENTREGA'),
        entregue: countStatus('ENTREGUE'),
        finalizado: countStatus('FINALIZADO'),
        cancelado: countStatus('CANCELADO'),
      },
      por_atendimento: {
        presencial: pedidosDia.filter(p => p.tipo_atendimento === 'PRESENCIAL').length,
        balcao: pedidosDia.filter(p => p.tipo_atendimento === 'BALCAO').length,
        consumo_local: pedidosDia.filter(p => p.tipo_atendimento === 'CONSUMO_LOCAL').length,
        retirada: pedidosDia.filter(p => p.tipo_atendimento === 'RETIRADA').length,
        delivery: pedidosDia.filter(p => p.tipo_atendimento === 'DELIVERY').length,
      },
      por_forma_pagamento: {
        dinheiro: totalPorForma('DINHEIRO'),
        pix: totalPorForma('PIX'),
        cartao_debito: totalPorForma('CARTAO_DEBITO'),
        cartao_credito: totalPorForma('CARTAO_CREDITO'),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
