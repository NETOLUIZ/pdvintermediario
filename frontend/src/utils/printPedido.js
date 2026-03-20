const APP_NAME = 'PDV Pizzaria';

function moeda(valor) {
  return `R$ ${parseFloat(valor || 0).toFixed(2)}`;
}

function normalizarLista(valor) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor.filter(Boolean);
  if (typeof valor === 'string') {
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return valor
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function nomeItem(item) {
  return item?.nome || item?.produto?.nome || 'Item';
}

function tipoAtendimentoLabel(tipo) {
  return (
    {
      PRESENCIAL: 'Presencial',
      BALCAO: 'Balcao',
      CONSUMO_LOCAL: 'Mesa',
      RETIRADA: 'Retirada',
      DELIVERY: 'Delivery',
    }[tipo] || tipo || '-'
  );
}

function formaPagamentoLabel(forma) {
  return (
    {
      DINHEIRO: 'Dinheiro',
      PIX: 'Pix',
      CARTAO_DEBITO: 'Cartao Debito',
      CARTAO_CREDITO: 'Cartao Credito',
    }[forma] || forma || '-'
  );
}

function abrirJanelaImpressao({ titulo, subtitulo, conteudo }) {
  const popup = window.open('', '_blank', 'width=420,height=720');
  if (!popup) throw new Error('Nao foi possivel abrir a janela de impressao');

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>${titulo}</title>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #fff; color: #000; font-family: "Courier New", monospace; }
          body { width: 80mm; padding: 8px; font-size: 12px; line-height: 1.35; }
          .header { text-align: center; margin-bottom: 8px; }
          .header h1 { margin: 0; font-size: 16px; text-transform: uppercase; }
          .header p { margin: 4px 0 0; font-size: 11px; }
          .separator { border-top: 1px dashed #000; margin: 8px 0; }
          .block { display: flex; flex-direction: column; gap: 6px; }
          .title { font-weight: 700; text-transform: uppercase; }
          .row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
          .row--top { align-items: flex-start; }
          .text-right { text-align: right; }
          .item { display: flex; flex-direction: column; gap: 3px; }
          .item__head { display: flex; justify-content: space-between; gap: 10px; }
          .muted { color: #111; font-size: 11px; }
          .total { font-size: 15px; margin-top: 3px; }
          .kitchen-item { padding: 4px 0; }
          .kitchen-item__head { font-size: 14px; }
          .kitchen-note { font-size: 12px; }
          .kitchen-note--strong { font-weight: 700; }
          @media print {
            @page { size: 80mm auto; margin: 4mm; }
            body { width: auto; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${APP_NAME}</h1>
          <p>${subtitulo}</p>
        </div>
        ${conteudo}
      </body>
    </html>
  `);

  popup.document.close();
  popup.focus();
  popup.onload = () => popup.print();
}

export function imprimirPedidoCliente(pedido) {
  const itens = (pedido.itens || [])
    .map((item) => {
      const sabores = normalizarLista(item.sabores);
      const adicionais = normalizarLista(item.adicionais);
      return `
        <div class="item">
          <div class="item__head">
            <strong>${item.quantidade}x ${nomeItem(item)}</strong>
            <strong>${moeda(item.preco_total ?? item.preco_unit * item.quantidade)}</strong>
          </div>
          ${item.tamanho ? `<div class="muted">Tamanho: ${item.tamanho}</div>` : ''}
          ${sabores.length ? `<div class="muted">Sabores: ${sabores.join(', ')}</div>` : ''}
          ${item.borda ? `<div class="muted">Borda: ${item.borda}</div>` : ''}
          ${adicionais.length ? `<div class="muted">Adicionais: ${adicionais.join(', ')}</div>` : ''}
          ${item.observacao ? `<div class="muted">Obs: ${item.observacao}</div>` : ''}
        </div>
      `;
    })
    .join('');

  abrirJanelaImpressao({
    titulo: `Cupom Pedido ${pedido.numero}`,
    subtitulo: 'Via do cliente',
    conteudo: `
      <div class="block">
        <div class="row"><span>Pedido</span><strong>#${pedido.numero}</strong></div>
        <div class="row"><span>Data</span><strong>${new Date(pedido.criado_em || Date.now()).toLocaleString('pt-BR')}</strong></div>
        <div class="row"><span>Atendimento</span><strong>${tipoAtendimentoLabel(pedido.tipo_atendimento)}</strong></div>
        <div class="row"><span>Pagamento</span><strong>${formaPagamentoLabel(pedido.forma_pagamento || pedido.pagamento?.forma)}</strong></div>
        ${pedido.cliente?.nome ? `<div class="row"><span>Cliente</span><strong>${pedido.cliente.nome}</strong></div>` : ''}
        ${pedido.cliente?.telefone ? `<div class="row"><span>Telefone</span><strong>${pedido.cliente.telefone}</strong></div>` : ''}
        ${pedido.mesa?.numero ? `<div class="row"><span>Mesa</span><strong>${pedido.mesa.numero}</strong></div>` : ''}
      </div>
      <div class="separator"></div>
      <div class="block">
        <div class="title">Itens</div>
        ${itens}
      </div>
      <div class="separator"></div>
      <div class="block">
        <div class="row"><span>Subtotal</span><strong>${moeda(pedido.subtotal)}</strong></div>
        ${parseFloat(pedido.taxa_entrega || 0) > 0 ? `<div class="row"><span>Taxa entrega</span><strong>${moeda(pedido.taxa_entrega)}</strong></div>` : ''}
        ${parseFloat(pedido.desconto || 0) > 0 ? `<div class="row"><span>Desconto</span><strong>- ${moeda(pedido.desconto)}</strong></div>` : ''}
        <div class="row total"><span>Total</span><strong>${moeda(pedido.valor_total)}</strong></div>
        ${pedido.pagamento?.valor_recebido ? `<div class="row"><span>Recebido</span><strong>${moeda(pedido.pagamento.valor_recebido)}</strong></div>` : ''}
        ${pedido.pagamento?.troco ? `<div class="row"><span>Troco</span><strong>${moeda(pedido.pagamento.troco)}</strong></div>` : ''}
      </div>
      ${pedido.observacao ? `<div class="separator"></div><div class="block"><div class="title">Observacao</div><div>${pedido.observacao}</div></div>` : ''}
    `,
  });
}

export function imprimirPedidoCozinha(pedido) {
  const itens = (pedido.itens || [])
    .map((item) => {
      const sabores = normalizarLista(item.sabores);
      const adicionais = normalizarLista(item.adicionais);
      return `
        <div class="item kitchen-item">
          <div class="item__head kitchen-item__head">
            <strong>${item.quantidade}x ${nomeItem(item)}</strong>
            ${item.tamanho ? `<strong>${item.tamanho}</strong>` : ''}
          </div>
          ${sabores.length ? `<div class="kitchen-note">Sabores: ${sabores.join(', ')}</div>` : ''}
          ${item.borda ? `<div class="kitchen-note">Borda: ${item.borda}</div>` : ''}
          ${adicionais.length ? `<div class="kitchen-note">Adicionais: ${adicionais.join(', ')}</div>` : ''}
          ${item.observacao ? `<div class="kitchen-note kitchen-note--strong">Obs: ${item.observacao}</div>` : ''}
        </div>
      `;
    })
    .join('');

  const endereco = [pedido.cliente?.endereco, pedido.cliente?.numero, pedido.cliente?.bairro]
    .filter(Boolean)
    .join(', ');

  abrirJanelaImpressao({
    titulo: `Producao Pedido ${pedido.numero}`,
    subtitulo: 'Via da cozinha',
    conteudo: `
      <div class="block">
        <div class="row"><span>Producao</span><strong>#${pedido.numero}</strong></div>
        <div class="row"><span>Canal</span><strong>${tipoAtendimentoLabel(pedido.tipo_atendimento)}</strong></div>
        ${pedido.mesa?.numero ? `<div class="row"><span>Mesa</span><strong>${pedido.mesa.numero}</strong></div>` : ''}
        ${pedido.cliente?.nome ? `<div class="row"><span>Cliente</span><strong>${pedido.cliente.nome}</strong></div>` : ''}
        ${endereco ? `<div class="row row--top"><span>Entrega</span><strong class="text-right">${endereco}</strong></div>` : ''}
      </div>
      <div class="separator"></div>
      <div class="block">
        <div class="title">Preparar</div>
        ${itens}
      </div>
      ${pedido.observacao ? `<div class="separator"></div><div class="block"><div class="title">Obs do pedido</div><div class="kitchen-note kitchen-note--strong">${pedido.observacao}</div></div>` : ''}
    `,
  });
}
