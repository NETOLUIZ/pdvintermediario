import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  CalendarDays,
  CheckSquare,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Package2,
  ShoppingBag,
  Wallet,
  Clock3,
  Users2,
  CheckCircle2,
  Flame,
  Truck,
  Flag,
  XCircle,
} from 'lucide-react';
import './DashboardPage.css';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function ActionCard({ to, title, subtitle, icon: Icon, primary = false }) {
  return (
    <Link to={to} className={`dashboard-action-card ${primary ? 'dashboard-action-card--primary' : ''}`}>
      <div className="dashboard-action-card__icon">
        <Icon className="dashboard-action-card__icon-svg" />
      </div>
      <div>
        <h3 className="dashboard-action-card__title">{title}</h3>
        <p className="dashboard-action-card__subtitle">{subtitle}</p>
      </div>
    </Link>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <section className="dashboard-metric-card">
      <div className="dashboard-metric-card__head">
        <p className="dashboard-metric-card__label">{title}</p>
        <div className="dashboard-metric-card__icon">
          <Icon className="dashboard-metric-card__icon-svg" />
        </div>
      </div>
      <p className="dashboard-metric-card__value">{value}</p>
      <p className="dashboard-metric-card__subtitle">{subtitle}</p>
    </section>
  );
}

function StatusChip({ label, value, className = '' }) {
  return (
    <div className={`dashboard-status-chip ${className}`}>
      <span className="dashboard-status-chip__label">{label}</span>
      <strong className="dashboard-status-chip__value">{value}</strong>
    </div>
  );
}

function PaymentRow({ label, value, percent, colorClass }) {
  return (
    <div className="dashboard-payment-row">
      <div className="dashboard-payment-row__top">
        <div className="dashboard-payment-row__label-wrap">
          <span className={`dashboard-payment-row__dot ${colorClass}`} />
          <span className="dashboard-payment-row__label">{label}</span>
        </div>
        <span className="dashboard-payment-row__value">{formatCurrency(value)}</span>
      </div>
      <div className="dashboard-payment-row__bar">
        <div className={`dashboard-payment-row__fill ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (active) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page dashboard-page--loading">
        <div className="dashboard-page__spinner" />
      </div>
    );
  }

  const pagamentos = data?.por_forma_pagamento || {};
  const atendimentos = data?.por_atendimento || {};
  const status = data?.por_status || {};
  const totalPagamentos = Object.values(pagamentos).reduce((sum, value) => sum + value, 0);

  const paymentItems = [
    { label: 'Dinheiro', value: pagamentos.dinheiro || 0, colorClass: 'dashboard-tone--green' },
    { label: 'Pix', value: pagamentos.pix || 0, colorClass: 'dashboard-tone--blue' },
    { label: 'Cartão de Débito', value: pagamentos.cartao_debito || 0, colorClass: 'dashboard-tone--purple' },
  ].map((item) => ({
    ...item,
    percent: totalPagamentos > 0 ? (item.value / totalPagamentos) * 100 : 0,
  }));

  const attendanceMax = Math.max(
    atendimentos.presencial || 0,
    atendimentos.balcao || 0,
    atendimentos.consumo_local || 0,
    atendimentos.retirada || 0,
    atendimentos.delivery || 0,
    1
  );

  const attendanceItems = [
    { label: 'Presencial', value: atendimentos.presencial || 0 },
    { label: 'Balcão', value: atendimentos.balcao || 0 },
    { label: 'Consumo local', value: atendimentos.consumo_local || 0 },
    { label: 'Retirada', value: atendimentos.retirada || 0 },
    { label: 'Delivery', value: atendimentos.delivery || 0 },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__container">
        <header className="dashboard-page__header">
          <div className="dashboard-page__eyebrow-wrap">
            <p className="dashboard-page__eyebrow">VISÃO OPERACIONAL DO DIA</p>
            <CalendarDays className="dashboard-page__eyebrow-icon" />
          </div>
          <h1 className="dashboard-page__title">Dashboard de atendimento com foco no que precisa de ação agora</h1>
        </header>

        <section className="dashboard-page__actions">
          <ActionCard to="/pdv" title="Abrir PDV" subtitle="Iniciar um novo povido" icon={CheckSquare} primary />
          <ActionCard to="/pedidos" title="Painel de Pedidos" subtitle="Acompanhar fila e produção" icon={CalendarDays} />
          <ActionCard to="/caixa" title="Caixa" subtitle="Confeir monvimentação" icon={Wallet} />
        </section>

        <section className="dashboard-page__metrics">
          <MetricCard title="TOTAL DE PEDIDOS" value={data?.total_pedidos || 0} subtitle="Volume total registrado hoje" icon={CheckSquare} />
          <MetricCard title="TOTAL VENDIDO" value={formatCurrency(data?.total_vendido)} subtitle="Somente pagamentos aprovados" icon={DollarSign} />
          <MetricCard title="TICKET MÉDIO" value={formatCurrency(data?.ticket_medio)} subtitle="Media por pedido pago" icon={DollarSign} />
          <MetricCard title="PENDÊNCIA DE PAGAMENTO" value={formatCurrency(data?.total_aguardando_pagamento)} subtitle="Pedidos pagando confirmação" icon={Clock3} />
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <h2 className="dashboard-panel__title">Fila operacional</h2>
            <p className="dashboard-panel__subtitle">Distribuição dos pedidos por etapa do fluxo</p>
          </div>
          <div className="dashboard-status-grid">
            <StatusChip label="Novos" value={status.novo || 0} className="dashboard-status-chip--gold" />
            <StatusChip label="Em emparo" value={status.em_preparo || 0} className="dashboard-status-chip--purple" />
            <StatusChip label="Prontos" value={status.pronto || 0} className="dashboard-status-chip--green" />
            <StatusChip label="Saiu antagu" value={status.saiu_entrega || 0} className="dashboard-status-chip--blue" />
            <StatusChip label="Finalizados" value={status.finalizado || 0} className="dashboard-status-chip--slate" />
            <StatusChip label="Cancelados" value={status.cancelado || 0} className="dashboard-status-chip--red" />
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <div className="dashboard-panel">
            <div className="dashboard-panel__heading">
              <h2 className="dashboard-panel__title dashboard-panel__title--icon">
                <CreditCard className="dashboard-panel__title-icon" />
                Formas de pagamento
              </h2>
              <p className="dashboard-panel__subtitle">Participação o total de venvadas aprovadas</p>
            </div>

            <div className="dashboard-payments">
              {paymentItems.map((item) => (
                <PaymentRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  percent={item.percent}
                  colorClass={item.colorClass}
                />
              ))}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel__heading">
              <h2 className="dashboard-panel__title dashboard-panel__title--icon">
                <Users2 className="dashboard-panel__title-icon" />
                Tipos de atendimento
              </h2>
              <p className="dashboard-panel__subtitle">Como os pedidos do dia esto distribuidou no canal de venda</p>
            </div>

            <div className="dashboard-attendance-chart">
              {attendanceItems.map((item) => (
                <div key={item.label} className="dashboard-attendance-chart__item">
                  <div className="dashboard-attendance-chart__column">
                    <div
                      className="dashboard-attendance-chart__fill"
                      style={{ height: `${(item.value / attendanceMax) * 100}%` }}
                    />
                  </div>
                  <span className="dashboard-attendance-chart__label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav className="dashboard-mobile-nav">
          <Link to="/" className="dashboard-mobile-nav__item dashboard-mobile-nav__item--active">
            <LayoutDashboard className="dashboard-mobile-nav__icon" />
            <span>Dashboard</span>
          </Link>
          <Link to="/pdv" className="dashboard-mobile-nav__item">
            <ShoppingBag className="dashboard-mobile-nav__icon" />
            <span>PDV</span>
          </Link>
          <Link to="/pedidos" className="dashboard-mobile-nav__item">
            <Package2 className="dashboard-mobile-nav__icon" />
            <span>Pedidos</span>
          </Link>
          <Link to="/mesas" className="dashboard-mobile-nav__item">
            <CalendarDays className="dashboard-mobile-nav__icon" />
            <span>Mesas</span>
          </Link>
          <span className="dashboard-mobile-nav__item">
            <Flag className="dashboard-mobile-nav__icon" />
            <span>Mais</span>
          </span>
        </nav>
      </div>
    </div>
  );
}
