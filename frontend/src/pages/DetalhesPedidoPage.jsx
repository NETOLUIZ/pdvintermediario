import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CheckCircle, AlertCircle, Clock, Truck,
  Package, XCircle, User, Table2, CreditCard, Banknote, QrCode,
  ShieldCheck, ChevronRight, History
} from 'lucide-react';

const STATUS_COLORS = {
  NOVO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  AGUARDANDO_PAGAMENTO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAGAMENTO_APROVADO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  EM_PREPARO: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  PRONTO: 'bg-green-500/20 text-green-400 border-green-500/30',
  SAIU_ENTREGA: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  ENTREGUE: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  FINALIZADO: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  CANCELADO: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS = {
  NOVO: 'Novo', AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
  PAGAMENTO_APROVADO: 'Pagamento Aprovado', EM_PREPARO: 'Em Preparo',
  PRONTO: 'Pronto', SAIU_ENTREGA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue', FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado',
};

export default function DetalhesPedidoPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAcao, setLoadingAcao] = useState(false);

  const fetchPedido = async () => {
    try {
      const res = await api.get(`/pedidos/${id}`);
      setPedido(res.data);
    } catch {
      toast.error('Pedido não encontrado');
      navigate('/pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPedido(); }, [id]);

  const mudarStatus = async (novoStatus) => {
    setLoadingAcao(true);
    try {
      await api.put(`/pedidos/${id}/status`, { status: novoStatus });
      toast.success(`Status atualizado: ${STATUS_LABELS[novoStatus]}`);
      fetchPedido();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar status');
    } finally {
      setLoadingAcao(false);
    }
  };

  const confirmarPagamento = async () => {
    setLoadingAcao(true);
    try {
      await api.post(`/pagamentos/${id}/confirmar`);
      toast.success('✅ Pagamento confirmado! O pedido pode ir para preparo.');
      fetchPedido();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao confirmar pagamento');
    } finally {
      setLoadingAcao(false);
    }
  };

  const recusarPagamento = async () => {
    if (!window.confirm('Tem certeza que deseja recusar o pagamento? O pedido será cancelado.')) return;
    setLoadingAcao(true);
    try {
      await api.post(`/pagamentos/${id}/recusar`, { motivo: 'Pagamento não confirmado' });
      toast('Pagamento recusado. Pedido cancelado.', { icon: '❌' });
      fetchPedido();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao recusar pagamento');
    } finally {
      setLoadingAcao(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!pedido) return null;

  const aguardandoConfirmacao = pedido.status_pagamento === 'AGUARDANDO_CONFIRMACAO';
  const pagamentoAprovado = pedido.status_pagamento === 'APROVADO';
  const isPix = pedido.forma_pagamento === 'PIX';
  const isCartao = ['CARTAO_DEBITO', 'CARTAO_CREDITO'].includes(pedido.forma_pagamento);

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/pedidos" className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Pedido #{pedido.numero}</h1>
          <p className="text-gray-400 text-sm">{new Date(pedido.criado_em).toLocaleString('pt-BR')}</p>
        </div>
        <span className={`ml-auto px-4 py-1.5 rounded-full text-sm font-semibold border ${STATUS_COLORS[pedido.status_pedido]}`}>
          {STATUS_LABELS[pedido.status_pedido]}
        </span>
      </div>

      {/* Alerta de pagamento pendente */}
      {aguardandoConfirmacao && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-5 mb-6 animate-pulse-glow">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 font-semibold text-lg mb-1">
                ⏳ Aguardando confirmação de pagamento
              </p>
              <p className="text-yellow-300/70 text-sm">
                O pagamento em {isPix ? 'Pix' : 'cartão'} precisa ser confirmado manualmente por um administrador
                antes de enviar para preparo.
              </p>
            </div>
            {isAdmin() && (
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={confirmarPagamento}
                  disabled={loadingAcao}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isPix ? 'Confirmar Pix' : 'Confirmar Cartão'}
                </button>
                <button
                  onClick={recusarPagamento}
                  disabled={loadingAcao}
                  className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium px-4 py-2.5 rounded-xl text-sm transition-all border border-red-500/30"
                >
                  <XCircle className="w-4 h-4" /> Recusar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Itens */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-400" /> Itens do Pedido
            </h2>
            <div className="space-y-3">
              {pedido.itens?.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-3">
                  <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {item.quantidade}x
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{item.produto?.nome}</p>
                    {item.tamanho && <p className="text-gray-500 text-xs">{item.tamanho}</p>}
                    {item.sabores?.length > 0 && <p className="text-gray-500 text-xs">Sabores: {item.sabores.join(', ')}</p>}
                    {item.borda && <p className="text-orange-400 text-xs">Borda: {item.borda}</p>}
                    {item.observacao && <p className="text-gray-600 text-xs italic">"{item.observacao}"</p>}
                  </div>
                  <p className="text-orange-400 font-semibold text-sm">R$ {parseFloat(item.preco_total).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span><span>R$ {parseFloat(pedido.subtotal).toFixed(2)}</span>
              </div>
              {parseFloat(pedido.taxa_entrega) > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Taxa de entrega</span><span>R$ {parseFloat(pedido.taxa_entrega).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(pedido.desconto) > 0 && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>Desconto</span><span>- R$ {parseFloat(pedido.desconto).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-1">
                <span className="text-white">Total</span>
                <span className="text-orange-400">R$ {parseFloat(pedido.valor_total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" /> Histórico
            </h2>
            <div className="space-y-3">
              {pedido.historico?.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm">
                      {h.status_anterior ? `${h.status_anterior} → ` : ''}<strong>{h.status_novo}</strong>
                    </p>
                    <p className="text-gray-500 text-xs">
                      {h.usuario?.nome} · {new Date(h.criado_em).toLocaleString('pt-BR')}
                    </p>
                    {h.observacao && <p className="text-gray-600 text-xs italic">{h.observacao}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar direita */}
        <div className="space-y-5">
          {/* Info geral */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold">Informações</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span className="text-lg">{
                    { PRESENCIAL: '🏪', BALCAO: '🍕', CONSUMO_LOCAL: '🪑', RETIRADA: '🏃', DELIVERY: '🛵' }[pedido.tipo_atendimento]
                  }</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Tipo</p>
                  <p className="text-white text-sm font-medium">{pedido.tipo_atendimento.replace('_', ' ')}</p>
                </div>
              </div>

              {pedido.cliente && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Cliente</p>
                    <p className="text-white text-sm font-medium">{pedido.cliente.nome}</p>
                    {pedido.cliente.telefone && <p className="text-gray-500 text-xs">{pedido.cliente.telefone}</p>}
                    {pedido.cliente.bairro && (
                      <p className="text-gray-500 text-xs">{pedido.cliente.endereco}, {pedido.cliente.numero} - {pedido.cliente.bairro}</p>
                    )}
                    {pedido.cliente.referencia && <p className="text-gray-600 text-xs">Ref: {pedido.cliente.referencia}</p>}
                  </div>
                </div>
              )}

              {pedido.mesa && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Table2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Mesa</p>
                    <p className="text-white text-sm font-medium">Mesa {pedido.mesa.numero}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  {pedido.forma_pagamento === 'DINHEIRO' ? <Banknote className="w-4 h-4 text-green-400" /> :
                   pedido.forma_pagamento === 'PIX' ? <QrCode className="w-4 h-4 text-blue-400" /> :
                   <CreditCard className="w-4 h-4 text-purple-400" />}
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Pagamento</p>
                  <p className="text-white text-sm font-medium">{pedido.forma_pagamento?.replace('_', ' ')}</p>
                  <span className={`text-xs font-semibold ${
                    pedido.status_pagamento === 'APROVADO' ? 'text-green-400' :
                    pedido.status_pagamento === 'AGUARDANDO_CONFIRMACAO' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {pedido.status_pagamento === 'APROVADO' ? '✓ Aprovado' :
                     pedido.status_pagamento === 'AGUARDANDO_CONFIRMACAO' ? '⏳ Aguardando' :
                     pedido.status_pagamento}
                  </span>
                </div>
              </div>

              {pedido.pagamento?.troco > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">Valor recebido: R$ {parseFloat(pedido.pagamento.valor_recebido).toFixed(2)}</p>
                  <p className="text-green-400 font-semibold">Troco: R$ {parseFloat(pedido.pagamento.troco).toFixed(2)}</p>
                </div>
              )}

              {pedido.pagamento?.confirmado_por && (
                <div className="text-xs text-gray-500">
                  Confirmado por: {pedido.pagamento.confirmado_por.nome} <br />
                  {new Date(pedido.pagamento.confirmado_em).toLocaleString('pt-BR')}
                </div>
              )}

              {pedido.observacao && (
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Observação</p>
                  <p className="text-white text-sm">{pedido.observacao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Ações</h2>
            <div className="space-y-2">
              {pagamentoAprovado && pedido.status_pedido === 'PAGAMENTO_APROVADO' && (
                <button onClick={() => mudarStatus('EM_PREPARO')} disabled={loadingAcao}
                  className="w-full flex items-center justify-between px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-medium transition-all">
                  <span className="flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Enviar para preparo</span>
                </button>
              )}
              {pedido.status_pedido === 'EM_PREPARO' && (
                <button onClick={() => mudarStatus('PRONTO')} disabled={loadingAcao}
                  className="w-full flex items-center justify-between px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium transition-all">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Marcar como Pronto</span>
                </button>
              )}
              {pedido.status_pedido === 'PRONTO' && pedido.tipo_atendimento === 'DELIVERY' && (
                <button onClick={() => mudarStatus('SAIU_ENTREGA')} disabled={loadingAcao}
                  className="w-full flex items-center justify-between px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-medium transition-all">
                  <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Saiu para Entrega</span>
                </button>
              )}
              {pedido.status_pedido === 'PRONTO' && pedido.tipo_atendimento !== 'DELIVERY' && (
                <button onClick={() => mudarStatus('FINALIZADO')} disabled={loadingAcao}
                  className="w-full flex items-center justify-between px-4 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-medium transition-all">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Finalizar Pedido</span>
                </button>
              )}
              {pedido.status_pedido === 'SAIU_ENTREGA' && (
                <button onClick={() => mudarStatus('ENTREGUE')} disabled={loadingAcao}
                  className="w-full flex items-center justify-between px-4 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-medium transition-all">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Marcar como Entregue</span>
                </button>
              )}
              {pedido.status_pedido === 'ENTREGUE' && (
                <button onClick={() => mudarStatus('FINALIZADO')} disabled={loadingAcao}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 rounded-xl text-sm font-medium transition-all">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Finalizar</span>
                </button>
              )}
              {!['FINALIZADO', 'CANCELADO'].includes(pedido.status_pedido) && (
                <button
                  onClick={() => { if (window.confirm('Cancelar este pedido?')) mudarStatus('CANCELADO'); }}
                  disabled={loadingAcao}
                  className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-all"
                >
                  <span className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Cancelar Pedido</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
