import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [tipoAtendimento, setTipoAtendimento] = useState('BALCAO');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mesaSelecionada, setMesaSelecionada] = useState(null);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [observacaoPedido, setObservacaoPedido] = useState('');

  const adicionarItem = (item) => {
    const id = `${item.produto_id}-${item.tamanho || 'unico'}-${Date.now()}`;
    setItens(prev => [...prev, { ...item, _cartId: id }]);
  };

  const removerItem = (cartId) => {
    setItens(prev => prev.filter(i => i._cartId !== cartId));
  };

  const atualizarQuantidade = (cartId, quantidade) => {
    if (quantidade <= 0) return removerItem(cartId);
    setItens(prev => prev.map(i => i._cartId === cartId
      ? { ...i, quantidade, preco_total: i.preco_unit * quantidade }
      : i
    ));
  };

  const limparCarrinho = () => {
    setItens([]);
    setClienteSelecionado(null);
    setMesaSelecionada(null);
    setTaxaEntrega(0);
    setDesconto(0);
    setObservacaoPedido('');
    setTipoAtendimento('BALCAO');
  };

  const subtotal = itens.reduce((s, i) => s + i.preco_unit * i.quantidade, 0);
  const total = subtotal + parseFloat(taxaEntrega || 0) - parseFloat(desconto || 0);

  return (
    <CartContext.Provider value={{
      itens, tipoAtendimento, setTipoAtendimento,
      clienteSelecionado, setClienteSelecionado,
      mesaSelecionada, setMesaSelecionada,
      taxaEntrega, setTaxaEntrega,
      desconto, setDesconto,
      observacaoPedido, setObservacaoPedido,
      adicionarItem, removerItem, atualizarQuantidade,
      limparCarrinho, subtotal, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
