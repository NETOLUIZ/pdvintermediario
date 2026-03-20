import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BarChart3, Calendar, TrendingUp, ShoppingBag, DollarSign, Sparkles } from 'lucide-react';
import './RelatoriosPage.css';

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarRelatorio = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/relatorios/vendas?data_inicio=${dataInicio}&data_fim=${dataFim}`);
      setData(res.data);
    } catch {
      toast.error('Erro ao buscar relatório');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2)}`;

  const FORMA_LABELS = {
    DINHEIRO: 'Dinheiro',
    PIX: 'Pix',
    CARTAO_DEBITO: 'Débito',
    CARTAO_CREDITO: 'Crédito',
  };

  const TIPO_LABELS = {
    PRESENCIAL: 'Presencial',
    BALCAO: 'Balcão',
    CONSUMO_LOCAL: 'Consumo Local',
    RETIRADA: 'Retirada',
    DELIVERY: 'Delivery',
  };

  const cardsResumo = data
    ? [
        { label: 'Total de pedidos', value: data.total_pedidos, icon: ShoppingBag, tone: 'info' },
        { label: 'Total vendido', value: fmt(data.total_vendido), icon: DollarSign, tone: 'success' },
        { label: 'Ticket médio', value: fmt(data.ticket_medio), icon: TrendingUp, tone: 'highlight' },
        { label: 'Dias no período', value: data.vendas_por_dia?.length || 0, icon: Calendar, tone: 'violet' },
      ]
    : [];

  return (
    <div className="relatorios-page">
      <section className="relatorios-page__hero">
        <div className="relatorios-page__hero-copy">
          <div className="relatorios-page__tag">
            <Sparkles className="w-4 h-4" />
            Leitura comercial
          </div>
          <h1 className="relatorios-page__title">Relatórios com a mesma assinatura visual do PDV</h1>
          <p className="relatorios-page__subtitle">
            Analise vendas, pagamentos e mix de atendimento com foco rápido em volume, valor e ritmo operacional.
          </p>
        </div>

        <div className="relatorios-page__filters">
          <div className="relatorios-page__date-field">
            <label>Data inicial</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>

          <div className="relatorios-page__date-field">
            <label>Data final</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>

          <div className="relatorios-page__quick-filters">
            {[
              {
                label: 'Hoje',
                fn: () => {
                  const hoje = new Date().toISOString().split('T')[0];
                  setDataInicio(hoje);
                  setDataFim(hoje);
                },
              },
              {
                label: '7 dias',
                fn: () => {
                  setDataInicio(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
                  setDataFim(new Date().toISOString().split('T')[0]);
                },
              },
              {
                label: '30 dias',
                fn: () => {
                  setDataInicio(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
                  setDataFim(new Date().toISOString().split('T')[0]);
                },
              },
            ].map(({ label, fn }) => (
              <button key={label} type="button" onClick={fn} className="relatorios-page__quick-button">
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={buscarRelatorio}
            disabled={loading}
            className="relatorios-page__primary-button"
          >
            <BarChart3 className="w-4 h-4" />
            Gerar relatório
          </button>
        </div>
      </section>

      {loading && (
        <div className="relatorios-page__loading">
          <div className="relatorios-page__spinner" />
        </div>
      )}

      {data && (
        <div className="relatorios-page__content animate-fade-in">
          <section className="relatorios-page__stats">
            {cardsResumo.map(({ label, value, icon: Icon, tone }) => (
              <article key={label} className="relatorios-page__stat-card">
                <div className={`relatorios-page__stat-icon tone-${tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="relatorios-page__stat-label">{label}</p>
                <strong className="relatorios-page__stat-value">{value}</strong>
              </article>
            ))}
          </section>

          <section className="relatorios-page__duo-grid">
            <article className="relatorios-page__panel">
              <h2 className="relatorios-page__panel-title">Por forma de pagamento</h2>
              <div className="relatorios-page__list">
                {Object.entries(data.por_forma_pagamento || {}).map(([key, val]) => (
                  <div key={key} className="relatorios-page__list-row">
                    <span>{FORMA_LABELS[key] || key}</span>
                    <div>
                      <strong>{fmt(val.total)}</strong>
                      <small>{val.quantidade} pedido(s)</small>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="relatorios-page__panel">
              <h2 className="relatorios-page__panel-title">Por tipo de atendimento</h2>
              <div className="relatorios-page__list">
                {Object.entries(data.por_tipo_atendimento || {}).map(([key, val]) => (
                  <div key={key} className="relatorios-page__list-row">
                    <span>{TIPO_LABELS[key] || key}</span>
                    <div>
                      <strong>{fmt(val.total)}</strong>
                      <small>{val.quantidade} pedido(s)</small>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="relatorios-page__panel">
            <h2 className="relatorios-page__panel-title">Produtos mais vendidos</h2>
            <div className="relatorios-page__ranking">
              {data.produtos_mais_vendidos?.map((produto, index) => (
                <div key={`${produto.nome}-${index}`} className="relatorios-page__ranking-row">
                  <span className={`relatorios-page__ranking-position rank-${Math.min(index + 1, 4)}`}>
                    {index + 1}
                  </span>

                  <div className="relatorios-page__ranking-body">
                    <div className="relatorios-page__ranking-head">
                      <p>{produto.nome}</p>
                      <span>{produto.quantidade}x</span>
                    </div>
                    <div className="relatorios-page__ranking-bar">
                      <div
                        className="relatorios-page__ranking-fill"
                        style={{
                          width: `${(produto.quantidade / (data.produtos_mais_vendidos[0]?.quantidade || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <strong className="relatorios-page__ranking-value">{fmt(produto.total)}</strong>
                </div>
              ))}
            </div>
          </section>

          {data.vendas_por_dia?.length > 0 && (
            <section className="relatorios-page__panel">
              <h2 className="relatorios-page__panel-title">Vendas por dia</h2>
              <div className="relatorios-page__daily-list">
                {data.vendas_por_dia.map((dia) => (
                  <div key={dia.data} className="relatorios-page__daily-row">
                    <span className="relatorios-page__daily-date">
                      {new Date(`${dia.data}T12:00:00`).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>

                    <div className="relatorios-page__daily-bar">
                      <div
                        className="relatorios-page__daily-fill"
                        style={{
                          width: `${(dia.total / Math.max(...data.vendas_por_dia.map((item) => item.total))) * 100}%`,
                        }}
                      />
                    </div>

                    <strong className="relatorios-page__daily-value">{fmt(dia.total)}</strong>
                    <small className="relatorios-page__daily-qty">{dia.quantidade}x</small>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
