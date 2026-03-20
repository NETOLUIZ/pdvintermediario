import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Eye, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import './PainelPedidosPage.css';

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
  NOVO: 'Novo',
  AGUARDANDO_PAGAMENTO: 'Aguard. Pagamento',
  PAGAMENTO_APROVADO: 'Pag. Aprovado',
  EM_PREPARO: 'Em Preparo',
  PRONTO: 'Pronto',
  SAIU_ENTREGA: 'Saiu p/Entrega',
  ENTREGUE: 'Entregue',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

const TIPO_LABELS = {
  PRESENCIAL: '🏪',
  BALCAO: '🍕',
  CONSUMO_LOCAL: '🪑',
  RETIRADA: '🏃',
  DELIVERY: '🛵',
};

const FORMA_LABELS = {
  DINHEIRO: '💵',
  PIX: '📱',
  CARTAO_DEBITO: '💳',
  CARTAO_CREDITO: '💳',
};

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
    <div className="painel-pedidos-page animate-fade-in">
      <div className="painel-pedidos-page__container">
        <header className="painel-pedidos-page__hero">
          <div className="painel-pedidos-page__hero-copy">
            <p className="painel-pedidos-page__eyebrow">Fila ativa de atendimento</p>
            <h1 className="painel-pedidos-page__title">Painel de Pedidos</h1>
            <p className="painel-pedidos-page__count">{total} pedido(s) encontrado(s)</p>
          </div>

          <div className="painel-pedidos-page__hero-actions">
            <button onClick={fetchPedidos} className="painel-pedidos-page__refresh">
              <RefreshCw className="painel-pedidos-page__refresh-icon" />
              Atualizar
            </button>
            <Link to="/pdv" className="painel-pedidos-page__new-order">
              + Novo Pedido
            </Link>
          </div>
        </header>

        <section className="painel-pedidos-page__filters">
          <div className="painel-pedidos-page__search">
            <Search className="painel-pedidos-page__search-icon" />
            <input
              value={filtros.busca}
              onChange={(e) => setFiltros((p) => ({ ...p, busca: e.target.value }))}
              placeholder="Buscar cliente ou n° pedido..."
              className="painel-pedidos-page__search-input"
            />
          </div>

          <div className="painel-pedidos-page__selects">
            <select
              value={filtros.status_pedido}
              onChange={(e) => setFiltros((p) => ({ ...p, status_pedido: e.target.value }))}
              className="painel-pedidos-page__select"
            >
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={filtros.tipo_atendimento}
              onChange={(e) => setFiltros((p) => ({ ...p, tipo_atendimento: e.target.value }))}
              className="painel-pedidos-page__select"
            >
              {TIPO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="painel-pedidos-page__loading">
            <div className="painel-pedidos-page__spinner" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="painel-pedidos-page__empty">
            <Clock className="painel-pedidos-page__empty-icon" />
            <p className="painel-pedidos-page__empty-text">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="painel-pedidos-page__list">
            {pedidos.map((pedido) => {
              const minutos = diffMinutes(pedido.criado_em);
              const atrasado = minutos > 45 && !['FINALIZADO', 'CANCELADO', 'ENTREGUE'].includes(pedido.status_pedido);
              const aguardPag = pedido.status_pedido === 'AGUARDANDO_PAGAMENTO';

              return (
                <Link
                  key={pedido.id}
                  to={`/pedidos/${pedido.id}`}
                  className={`painel-pedidos-page__item ${aguardPag ? 'painel-pedidos-page__item--payment' : atrasado ? 'painel-pedidos-page__item--late' : ''}`}
                >
                  <div className="painel-pedidos-page__item-type">
                    <p className="painel-pedidos-page__item-emoji">{TIPO_LABELS[pedido.tipo_atendimento]}</p>
                    <p className="painel-pedidos-page__item-number">#{pedido.numero}</p>
                  </div>

                  <div className="painel-pedidos-page__item-main">
                    <div className="painel-pedidos-page__item-head">
                      <p className="painel-pedidos-page__item-customer">{pedido.cliente?.nome || 'Sem nome'}</p>
                      {pedido.mesa && <span className="painel-pedidos-page__item-meta">· Mesa {pedido.mesa.numero}</span>}
                      {atrasado && (
                        <span className="painel-pedidos-page__item-alert">
                          <AlertCircle className="painel-pedidos-page__item-alert-icon" />
                          Atrasado
                        </span>
                      )}
                    </div>

                    <div className="painel-pedidos-page__item-info">
                      <span>{FORMA_LABELS[pedido.forma_pagamento]} {pedido.forma_pagamento?.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{minutos < 60 ? `${minutos}min atrás` : `${Math.floor(minutos / 60)}h atrás`}</span>
                      <span>·</span>
                      <span>{pedido.itens?.length} item(s)</span>
                    </div>
                  </div>

                  <div className="painel-pedidos-page__item-side">
                    <span className={`painel-pedidos-page__status ${STATUS_COLORS[pedido.status_pedido]}`}>
                      {STATUS_LABELS[pedido.status_pedido]}
                    </span>
                    <p className="painel-pedidos-page__item-total">R$ {parseFloat(pedido.valor_total).toFixed(2)}</p>
                  </div>

                  <Eye className="painel-pedidos-page__item-view" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
