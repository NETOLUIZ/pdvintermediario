import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Eye, Clock, AlertCircle, CheckCircle, Truck, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'NOVO', label: 'Novo' },
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguard. Pagamento' },
  { value: 'PAGAMENTO_APROVADO', label: 'Pagamento Aprovado' },
  { value: 'EM_PREPARO', label: 'Em Preparo' },
  { value: 'PRONTO', label: 'Pronto' },
  { value: 'SAIU_ENTREGA', label: 'Saiu p/ Entrega' },
  { value: 'ENTREGUE', label: 'Entregue' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const TIPO_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'BALCAO', label: 'Balcão' },
  { value: 'CONSUMO_LOCAL', label: 'Consumo Local' },
  { value: 'RETIRADA', label: 'Retirada' },
  { value: 'DELIVERY', label: 'Delivery' },
];

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
  NOVO: 'Novo', AGUARDANDO_PAGAMENTO: 'Aguard. Pagamento',
  PAGAMENTO_APROVADO: 'Pag. Aprovado', EM_PREPARO: 'Em Preparo',
  PRONTO: 'Pronto', SAIU_ENTREGA: 'Saiu p/Entrega',
  ENTREGUE: 'Entregue', FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado',
};

const TIPO_LABELS = {
  PRESENCIAL: '🏪', BALCAO: '🍕', CONSUMO_LOCAL: '🪑',
  RETIRADA: '🏃', DELIVERY: '🛵',
};

const FORMA_LABELS = { DINHEIRO: '💵', PIX: '📱', CARTAO_DEBITO: '💳', CARTAO_CREDITO: '💳' };

function diffMinutes(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

export default function PainelPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ status_pedido: '', tipo_atendimento: '', busca: '' });
  const [hoje] = useState(new Date().toISOString().split('T')[0]);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ data_inicio: hoje, data_fim: hoje, limit: 100 });
      if (filtros.status_pedido) params.set('status_pedido', filtros.status_pedido);
      if (filtros.tipo_atendimento) params.set('tipo_atendimento', filtros.tipo_atendimento);
      if (filtros.busca) params.set('busca', filtros.busca);
      const res = await api.get(`/pedidos?${params}`);
      setPedidos(res.data.pedidos);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const i = setInterval(fetchPedidos, 20000);
    return () => clearInterval(i);
  }, [filtros]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel de Pedidos</h1>
          <p className="text-gray-400 text-sm">{total} pedido(s) encontrado(s)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPedidos}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
          <Link to="/pdv" className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm text-white font-medium transition-colors">
            + Novo Pedido
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={filtros.busca}
            onChange={e => setFiltros(p => ({ ...p, busca: e.target.value }))}
            placeholder="Buscar cliente ou nº pedido..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={filtros.status_pedido}
          onChange={e => setFiltros(p => ({ ...p, status_pedido: e.target.value }))}
          className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filtros.tipo_atendimento}
          onChange={e => setFiltros(p => ({ ...p, tipo_atendimento: e.target.value }))}
          className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
        >
          {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Pedidos */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Clock className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(pedido => {
            const minutos = diffMinutes(pedido.criado_em);
            const atrasado = minutos > 45 && !['FINALIZADO', 'CANCELADO', 'ENTREGUE'].includes(pedido.status_pedido);
            const aguardPag = pedido.status_pedido === 'AGUARDANDO_PAGAMENTO';

            return (
              <Link
                key={pedido.id}
                to={`/pedidos/${pedido.id}`}
                className={`flex items-center gap-4 bg-gray-900 hover:bg-gray-800/80 border rounded-2xl p-4 transition-all duration-200 card-hover ${
                  aguardPag ? 'border-yellow-500/40' : atrasado ? 'border-red-500/40' : 'border-gray-800'
                }`}
              >
                {/* Número + tipo */}
                <div className="flex-shrink-0 text-center">
                  <p className="text-2xl">{TIPO_LABELS[pedido.tipo_atendimento]}</p>
                  <p className="text-white font-bold text-sm">#{pedido.numero}</p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium truncate">
                      {pedido.cliente?.nome || 'Sem nome'}
                    </p>
                    {pedido.mesa && <span className="text-gray-500 text-xs">· Mesa {pedido.mesa.numero}</span>}
                    {atrasado && <span className="text-red-400 text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Atrasado</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{FORMA_LABELS[pedido.forma_pagamento]} {pedido.forma_pagamento?.replace('_', ' ')}</span>
                    <span>·</span>
                    <span>{minutos < 60 ? `${minutos}min atrás` : `${Math.floor(minutos/60)}h atrás`}</span>
                    <span>·</span>
                    <span>{pedido.itens?.length} item(s)</span>
                  </div>
                </div>

                {/* Status + valor */}
                <div className="flex-shrink-0 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-1 ${STATUS_COLORS[pedido.status_pedido]}`}>
                    {STATUS_LABELS[pedido.status_pedido]}
                  </span>
                  <p className="text-orange-400 font-bold">R$ {parseFloat(pedido.valor_total).toFixed(2)}</p>
                </div>

                <Eye className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
