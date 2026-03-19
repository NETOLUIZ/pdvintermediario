import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Minus, Trash2, ShoppingCart, Search, ChevronRight,
  X, Truck, User, Table2, Banknote, QrCode, CreditCard,
  AlertCircle, CheckCircle, Pizza
} from 'lucide-react';

// ── Componente Modal genérico ──────────────────────────────────
function Modal({ open, onClose, title, children, maxW = 'max-w-md' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#050507]/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full ${maxW} rounded-[28px] border border-purple-500/18 bg-[linear-gradient(180deg,rgba(22,22,31,0.98),rgba(15,15,23,0.96))] shadow-[0_28px_80px_rgba(0,0,0,0.48)] animate-fade-in`}>
        <div className="flex items-center justify-between border-b border-purple-500/12 px-6 py-4">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-orange-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Label de tipo de atendimento ─────────────────────────────
const TIPOS = [
  { value: 'BALCAO', label: '🍕 Balcão', color: 'bg-orange-500' },
  { value: 'PRESENCIAL', label: '🏪 Presencial', color: 'bg-blue-500' },
  { value: 'CONSUMO_LOCAL', label: '🪑 Mesa', color: 'bg-purple-500' },
  { value: 'RETIRADA', label: '🏃 Retirada', color: 'bg-yellow-500' },
  { value: 'DELIVERY', label: '🛵 Delivery', color: 'bg-red-500' },
];

const FORMAS = [
  { value: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, color: 'border-green-500 bg-green-500/10 text-green-400' },
  { value: 'PIX', label: 'Pix', icon: QrCode, color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
  { value: 'CARTAO_DEBITO', label: 'Débito', icon: CreditCard, color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
  { value: 'CARTAO_CREDITO', label: 'Crédito', icon: CreditCard, color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
];

export default function PDVPage() {
  const { usuario } = useAuth();
  const {
    itens, tipoAtendimento, setTipoAtendimento,
    clienteSelecionado, setClienteSelecionado,
    mesaSelecionada, setMesaSelecionada,
    taxaEntrega, setTaxaEntrega,
    desconto, setDesconto,
    observacaoPedido, setObservacaoPedido,
    adicionarItem, removerItem, atualizarQuantidade,
    limparCarrinho, subtotal, total,
  } = useCart();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [catAtiva, setCatAtiva] = useState(null);
  const [busca, setBusca] = useState('');

  // Modals
  const [modalPizza, setModalPizza] = useState(null); // produto selecionado
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalMesa, setModalMesa] = useState(false);

  // Configurações modal pizza
  const [tamSelecionado, setTamSelecionado] = useState(null);
  const [saboresSelecionados, setSaboresSelecionados] = useState([]);
  const [bordaSelecionada, setBordaSelecionada] = useState('');
  const [obsItem, setObsItem] = useState('');

  // Pagamento
  const [formaPag, setFormaPag] = useState('DINHEIRO');
  const [valorRecebido, setValorRecebido] = useState('');

  // Cliente
  const [clientes, setClientes] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteRapido, setClienteRapido] = useState({ nome: '', telefone: '' });

  // Mesas
  const [mesas, setMesas] = useState([]);
  
  // Bordas disponíveis
  const [bordas, setBordas] = useState([]);

  useEffect(() => {
    api.get('/categorias').then(r => {
      setCategorias(r.data);
      if (r.data.length) setCatAtiva(r.data[0].id);
    });
    api.get('/produtos?tipo=BORDA').then(r => setBordas(r.data));
    api.get('/mesas').then(r => setMesas(r.data));
  }, []);

  useEffect(() => {
    if (!catAtiva) return;
    const params = new URLSearchParams({ categoria_id: catAtiva, ativo: 'true' });
    if (busca) params.set('busca', busca);
    api.get(`/produtos?${params}`).then(r => setProdutos(r.data));
  }, [catAtiva, busca]);

  const buscarClientes = async (q) => {
    if (q.length < 2) return;
    const res = await api.get(`/clientes?busca=${q}`);
    setClientes(res.data);
  };

  const handleAbrirPizza = (produto) => {
    setModalPizza(produto);
    setTamSelecionado(produto.tamanhos?.[0] || null);
    setSaboresSelecionados([]);
    setBordaSelecionada('');
    setObsItem('');
  };

  const handleAdicionarPizza = () => {
    if (!tamSelecionado) return toast.error('Selecione o tamanho');
    if (!modalPizza) return;

    let preco = parseFloat(tamSelecionado.preco);

    // Adicionar preço da borda
    if (bordaSelecionada) {
      const bordaProd = bordas.find(b => b.nome === bordaSelecionada);
      if (bordaProd?.tamanhos?.[0]) preco += parseFloat(bordaProd.tamanhos[0].preco);
    }

    adicionarItem({
      produto_id: modalPizza.id,
      nome: modalPizza.nome,
      quantidade: 1,
      tamanho: tamSelecionado.tamanho,
      sabores: saboresSelecionados,
      borda: bordaSelecionada || null,
      preco_unit: preco,
      observacao: obsItem,
      adicionais: [],
    });

    setModalPizza(null);
    toast.success('Item adicionado!');
  };

  const handleAdicionarSimples = (produto) => {
    const tam = produto.tamanhos?.[0];
    if (!tam) return toast.error('Produto sem preço cadastrado');
    adicionarItem({
      produto_id: produto.id,
      nome: produto.nome,
      quantidade: 1,
      tamanho: tam.tamanho !== 'Único' ? tam.tamanho : null,
      sabores: [],
      borda: null,
      preco_unit: parseFloat(tam.preco),
      observacao: '',
      adicionais: [],
    });
    toast.success(`${produto.nome} adicionado!`);
  };

  const handleFinalizarPedido = async () => {
    if (itens.length === 0) return toast.error('Carrinho vazio');
    if (tipoAtendimento === 'DELIVERY' && !clienteSelecionado) return toast.error('Selecione um cliente para delivery');

    try {
      const pedidoData = {
        tipo_atendimento: tipoAtendimento,
        cliente_id: clienteSelecionado?.id || null,
        mesa_id: mesaSelecionada?.id || null,
        forma_pagamento: formaPag,
        taxa_entrega: tipoAtendimento === 'DELIVERY' ? parseFloat(taxaEntrega || 0) : 0,
        desconto: parseFloat(desconto || 0),
        observacao: observacaoPedido,
        valor_recebido: formaPag === 'DINHEIRO' && valorRecebido ? parseFloat(valorRecebido) : null,
        itens: itens.map(i => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          tamanho: i.tamanho,
          sabores: i.sabores,
          borda: i.borda,
          preco_unit: i.preco_unit,
          observacao: i.observacao,
          adicionais: i.adicionais,
        })),
      };

      const res = await api.post('/pedidos', pedidoData);
      setModalPagamento(false);
      limparCarrinho();

      if (['PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO'].includes(formaPag)) {
        toast('⏳ Pedido criado! Aguardando confirmação de pagamento.', { duration: 5000, icon: '🔔' });
      } else {
        toast.success('✅ Pedido criado com sucesso!');
      }

      navigate(`/pedidos/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar pedido');
    }
  };

  const troco = formaPag === 'DINHEIRO' && valorRecebido
    ? parseFloat(valorRecebido) - total : 0;

  const tipoAtual = TIPOS.find(t => t.value === tipoAtendimento);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── ESQUERDA: Produtos ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(245,200,0,0.08),transparent_18%),radial-gradient(circle_at_top_right,rgba(139,63,190,0.12),transparent_20%),linear-gradient(180deg,#0b0b10_0%,#11111a_100%)]">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-purple-500/12 px-6 py-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-300">Tem na Área</p>
            <h1 className="text-xl font-black text-white whitespace-nowrap">PDV / Caixa</h1>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full rounded-[18px] border border-purple-500/16 bg-[#1b1b28] pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
        </div>

        {/* Tipo de atendimento */}
        <div className="flex gap-2 overflow-x-auto border-b border-purple-500/12 px-6 py-3">
          {TIPOS.map(t => (
            <button
              key={t.value}
              onClick={() => setTipoAtendimento(t.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tipoAtendimento === t.value
                  ? `${t.color} text-white shadow-lg`
                  : 'border border-purple-500/12 bg-[#1c1c29] text-gray-400 hover:text-white hover:border-orange-400/20'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto border-b border-purple-500/12 px-6 py-3">
          {categorias.map(c => (
            <button
              key={c.id}
              onClick={() => { setCatAtiva(c.id); setBusca(''); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                catAtiva === c.id
                  ? 'bg-orange-500 text-[#241d00] shadow-[0_10px_24px_rgba(245,200,0,0.14)]'
                  : 'border border-purple-500/12 bg-[#1c1c29] text-gray-400 hover:text-white hover:border-orange-400/20'
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>

        {/* Produtos grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {produtos.map(p => (
              <button
                key={p.id}
                onClick={() => p.tipo === 'PIZZA' ? handleAbrirPizza(p) : handleAdicionarSimples(p)}
                className="card-hover group rounded-[20px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.96),rgba(30,30,43,0.92))] p-4 text-left transition-all duration-200 hover:border-orange-400/28 hover:bg-[#222231]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(245,200,0,0.16),rgba(139,63,190,0.18))] transition-colors group-hover:bg-[linear-gradient(135deg,rgba(245,200,0,0.2),rgba(139,63,190,0.26))]">
                  <Pizza className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-white text-sm font-semibold leading-tight mb-1">{p.nome}</p>
                {p.descricao && <p className="text-gray-500 text-xs leading-tight mb-2 line-clamp-2">{p.descricao}</p>}
                <p className="text-orange-400 font-bold text-sm">
                  {p.tamanhos?.length > 1
                    ? `A partir de R$ ${Math.min(...p.tamanhos.map(t => parseFloat(t.preco))).toFixed(2)}`
                    : p.tamanhos?.[0] ? `R$ ${parseFloat(p.tamanhos[0].preco).toFixed(2)}` : 'Sem preço'
                  }
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── DIREITA: Carrinho ────────────────────────────────── */}
      <div className="flex w-80 flex-shrink-0 flex-col border-l border-purple-500/14 bg-[linear-gradient(180deg,rgba(17,17,25,0.98),rgba(14,14,21,0.98))]">
        {/* Carrinho header */}
        <div className="flex items-center justify-between border-b border-purple-500/12 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-400" />
            <span className="text-white font-semibold">Carrinho</span>
            {itens.length > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-black text-[#241d00]">{itens.length}</span>
            )}
          </div>
          {itens.length > 0 && (
            <button onClick={limparCarrinho} className="text-gray-500 hover:text-red-400 text-xs transition-colors">
              Limpar
            </button>
          )}
        </div>

        {/* Info pedido */}
        <div className="space-y-2 border-b border-purple-500/12 px-5 py-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${tipoAtual?.color} text-white`}>
            {tipoAtual?.label}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalCliente(true)}
              className="flex-1 flex items-center gap-1.5 rounded-[14px] border border-purple-500/12 bg-[#1c1c29] px-3 py-2 text-xs text-gray-400 transition-colors hover:border-orange-400/20 hover:text-white"
            >
              <User className="w-3.5 h-3.5" />
              {clienteSelecionado ? clienteSelecionado.nome.split(' ')[0] : 'Cliente'}
            </button>
            {['CONSUMO_LOCAL', 'PRESENCIAL'].includes(tipoAtendimento) && (
              <button
                onClick={() => setModalMesa(true)}
                className="flex-1 flex items-center gap-1.5 rounded-[14px] border border-purple-500/12 bg-[#1c1c29] px-3 py-2 text-xs text-gray-400 transition-colors hover:border-orange-400/20 hover:text-white"
              >
                <Table2 className="w-3.5 h-3.5" />
                {mesaSelecionada ? `Mesa ${mesaSelecionada.numero}` : 'Mesa'}
              </button>
            )}
          </div>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto">
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 py-12">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm">Carrinho vazio</p>
              <p className="text-xs mt-1">Selecione produtos ao lado</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {itens.map(item => (
                <div key={item._cartId} className="rounded-[18px] border border-purple-500/12 bg-[#1c1c29] p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium leading-tight">{item.nome}</p>
                      {item.tamanho && <p className="text-gray-500 text-xs">{item.tamanho}</p>}
                      {item.sabores?.length > 0 && <p className="text-gray-500 text-xs truncate">{item.sabores.join(', ')}</p>}
                      {item.borda && <p className="text-orange-400 text-xs">🍕 {item.borda}</p>}
                    </div>
                    <button onClick={() => removerItem(item._cartId)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => atualizarQuantidade(item._cartId, item.quantidade - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/12 bg-[#262637] transition-colors hover:border-orange-400/20 hover:bg-[#313146]"
                      >
                        <Minus className="w-3 h-3 text-white" />
                      </button>
                      <span className="text-white text-sm font-medium w-5 text-center">{item.quantidade}</span>
                      <button
                        onClick={() => atualizarQuantidade(item._cartId, item.quantidade + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/12 bg-[#262637] transition-colors hover:border-orange-400/20 hover:bg-[#313146]"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <p className="text-orange-400 font-bold text-sm">R$ {(item.preco_unit * item.quantidade).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totais + finalizar */}
        <div className="space-y-3 border-t border-purple-500/12 p-5">
          {tipoAtendimento === 'DELIVERY' && (
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-xs flex-1">Taxa entrega:</label>
              <input
                type="number"
                value={taxaEntrega}
                onChange={e => setTaxaEntrega(e.target.value)}
                className="w-24 rounded-lg border border-purple-500/16 bg-[#1b1b28] px-3 py-1.5 text-right text-sm text-white focus:border-orange-400 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-xs flex-1">Desconto:</label>
            <input
              type="number"
              value={desconto}
              onChange={e => setDesconto(e.target.value)}
              className="w-24 rounded-lg border border-purple-500/16 bg-[#1b1b28] px-3 py-1.5 text-right text-sm text-white focus:border-orange-400 focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1 border-t border-purple-500/12 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-gray-300">R$ {subtotal.toFixed(2)}</span>
            </div>
            {parseFloat(taxaEntrega) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Taxa entrega</span>
                <span className="text-gray-300">R$ {parseFloat(taxaEntrega).toFixed(2)}</span>
              </div>
            )}
            {parseFloat(desconto) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Desconto</span>
                <span className="text-red-400">- R$ {parseFloat(desconto).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-1">
              <span className="text-white">TOTAL</span>
              <span className="text-orange-400">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => setModalPagamento(true)}
            disabled={itens.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-orange-500 py-4 font-black text-[#241d00] shadow-[0_18px_34px_rgba(245,200,0,0.16)] transition-all duration-200 hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
            Finalizar Pedido
          </button>
        </div>
      </div>

      {/* ── MODAL: Configurar pizza ───────────────────────────── */}
      <Modal open={!!modalPizza} onClose={() => setModalPizza(null)} title={modalPizza?.nome} maxW="max-w-lg">
        {modalPizza && (
          <div className="space-y-5">
            {/* Tamanhos */}
            <div>
              <p className="text-gray-400 text-sm font-medium mb-3">Tamanho</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {modalPizza.tamanhos?.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTamSelecionado(t)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      tamSelecionado?.id === t.id
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                        : 'border-gray-700 hover:border-gray-600 text-gray-400'
                    }`}
                  >
                    <p className="font-semibold text-sm">{t.tamanho}</p>
                    <p className="text-xs mt-0.5">R$ {parseFloat(t.preco).toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sabores */}
            {modalPizza.sabores?.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm font-medium mb-3">Sabores (selecione até 2)</p>
                <div className="grid grid-cols-2 gap-2">
                  {modalPizza.sabores.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSaboresSelecionados(prev =>
                          prev.includes(s.nome)
                            ? prev.filter(x => x !== s.nome)
                            : prev.length >= 2 ? prev : [...prev, s.nome]
                        );
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                        saboresSelecionados.includes(s.nome)
                          ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                          : 'border-gray-700 hover:border-gray-600 text-gray-400'
                      }`}
                    >
                      {s.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Borda recheada */}
            {bordas.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm font-medium mb-3">Borda recheada</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBordaSelecionada('')}
                    className={`px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      !bordaSelecionada ? 'border-gray-500 bg-gray-800 text-white' : 'border-gray-700 text-gray-500'
                    }`}
                  >
                    Sem borda
                  </button>
                  {bordas.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setBordaSelecionada(b.nome)}
                      className={`px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                        bordaSelecionada === b.nome
                          ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                          : 'border-gray-700 hover:border-gray-600 text-gray-400'
                      }`}
                    >
                      <span className="block text-xs font-medium">{b.nome}</span>
                      <span className="text-xs">{b.tamanhos?.[0] ? `+ R$ ${parseFloat(b.tamanhos[0].preco).toFixed(2)}` : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Observação */}
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Observação</p>
              <textarea
                value={obsItem}
                onChange={e => setObsItem(e.target.value)}
                rows={2}
                placeholder="Ex: Sem cebola, bem assada..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Total e botão */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <div>
                <p className="text-gray-500 text-xs">Total do item</p>
                <p className="text-orange-400 font-bold text-xl">
                  R$ {(tamSelecionado ? parseFloat(tamSelecionado.preco) + (bordaSelecionada ? parseFloat(bordas.find(b=>b.nome===bordaSelecionada)?.tamanhos?.[0]?.preco||0) : 0) : 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleAdicionarPizza}
                disabled={!tamSelecionado}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: Forma de pagamento ─────────────────────────── */}
      <Modal open={modalPagamento} onClose={() => setModalPagamento(false)} title="Finalizar Pedido">
        <div className="space-y-5">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-3">Forma de pagamento</p>
            <div className="grid grid-cols-2 gap-2">
              {FORMAS.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFormaPag(f.value)}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border-2 font-medium text-sm transition-all ${
                      formaPag === f.value ? f.color : 'border-gray-700 text-gray-500 hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" /> {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dinheiro: valor recebido */}
          {formaPag === 'DINHEIRO' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
              <p className="text-green-400 text-sm font-medium">💵 Pagamento em dinheiro</p>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Valor recebido</label>
                <input
                  type="number"
                  value={valorRecebido}
                  onChange={e => setValorRecebido(e.target.value)}
                  placeholder={total.toFixed(2)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-green-500"
                />
              </div>
              {valorRecebido && troco >= 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Troco:</span>
                  <span className="text-green-400 font-bold text-lg">R$ {troco.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* Pix/Cartão: aviso */}
          {['PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO'].includes(formaPag) && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-semibold mb-1">Confirmação manual necessária</p>
                <p className="text-yellow-300/70 text-xs">
                  O pedido ficará em <strong>"Aguardando confirmação de pagamento"</strong>.
                  Um administrador precisará confirmar o pagamento antes do pedido ir para preparo.
                </p>
              </div>
            </div>
          )}

          {/* Observação do pedido */}
          <div>
            <label className="text-gray-400 text-xs block mb-1.5">Observação do pedido</label>
            <textarea
              value={observacaoPedido}
              onChange={e => setObservacaoPedido(e.target.value)}
              rows={2}
              placeholder="Observações gerais..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Total */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total do pedido</span>
              <span className="text-orange-400 font-bold text-2xl">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleFinalizarPedido}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
          >
            <CheckCircle className="w-5 h-5" /> Confirmar Pedido
          </button>
        </div>
      </Modal>

      {/* ── MODAL: Selecionar cliente ─────────────────────────── */}
      <Modal open={modalCliente} onClose={() => setModalCliente(false)} title="Selecionar Cliente">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={buscaCliente}
              onChange={e => { setBuscaCliente(e.target.value); buscarClientes(e.target.value); }}
              placeholder="Buscar por nome ou telefone..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          {clientes.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {clientes.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setClienteSelecionado(c); setModalCliente(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-orange-400 text-sm font-bold">{c.nome.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{c.nome}</p>
                    <p className="text-gray-500 text-xs">{c.telefone} · {c.bairro}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-xs mb-3">Cadastro rápido</p>
            <div className="space-y-2">
              <input
                value={clienteRapido.nome}
                onChange={e => setClienteRapido(p => ({ ...p, nome: e.target.value }))}
                placeholder="Nome do cliente"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <input
                value={clienteRapido.telefone}
                onChange={e => setClienteRapido(p => ({ ...p, telefone: e.target.value }))}
                placeholder="Telefone"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={async () => {
                  if (!clienteRapido.nome) return;
                  try {
                    const res = await api.post('/clientes', clienteRapido);
                    setClienteSelecionado(res.data);
                    setModalCliente(false);
                    toast.success('Cliente cadastrado!');
                  } catch { toast.error('Erro ao cadastrar cliente'); }
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
              >
                Cadastrar e selecionar
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Selecionar mesa ────────────────────────────── */}
      <Modal open={modalMesa} onClose={() => setModalMesa(false)} title="Selecionar Mesa">
        <div className="grid grid-cols-4 gap-2">
          {mesas.filter(m => m.status === 'LIVRE').map(m => (
            <button
              key={m.id}
              onClick={() => { setMesaSelecionada(m); setModalMesa(false); }}
              className="bg-gray-800 hover:bg-green-500/20 hover:border-green-500/50 border border-gray-700 rounded-xl p-3 text-center transition-all"
            >
              <p className="text-white font-bold">{m.numero}</p>
              <p className="text-gray-500 text-xs">Livre</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
