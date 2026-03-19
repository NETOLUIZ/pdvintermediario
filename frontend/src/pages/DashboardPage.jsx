import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Flag,
  Flame,
  Package2,
  Pizza,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Users2,
  Wallet,
  XCircle,
} from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function Surface({ children, className = '' }) {
  return (
    <section className={`rounded-[30px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.94),rgba(17,17,25,0.94))] shadow-[0_24px_70px_rgba(0,0,0,0.36)] ${className}`}>
      {children}
    </section>
  );
}

function ActionButton({ to, label, hint, icon: Icon, primary = false }) {
  return (
    <Link
      to={to}
      className={`group flex min-h-[92px] items-center justify-between rounded-[22px] border px-5 py-5 transition-all duration-200 ${
        primary
          ? 'border-orange-400/30 bg-orange-500 text-[#241d00] shadow-[0_18px_34px_rgba(245,200,0,0.18)] hover:bg-orange-300'
          : 'border-purple-500/14 bg-white/[0.03] text-white hover:border-purple-400/24 hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${primary ? 'bg-white/16' : 'bg-white/[0.05]'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className={`text-sm ${primary ? 'text-[#4f3f00]' : 'text-zinc-400'}`}>{hint}</p>
        </div>
      </div>
      <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${primary ? 'text-[#241d00]' : 'text-zinc-500'}`} />
    </Link>
  );
}

function MetricCard({ label, value, support, icon: Icon, accentClass, panelClass }) {
  return (
    <Surface className={`min-h-[168px] p-6 ${panelClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          <p className="mt-2 text-sm text-zinc-400">{support}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Surface>
  );
}

function StatusPill({ label, value, icon: Icon, iconClass, ringClass }) {
  return (
    <div className={`min-w-0 rounded-[22px] border ${ringClass} bg-white/[0.03] px-5 py-5`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-400">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PaymentBar({ label, value, percentage, colorClass }) {
  return (
    <div className="space-y-3 rounded-[22px] border border-white/6 bg-white/[0.025] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
          <span className="text-sm text-zinc-300">{label}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{formatCurrency(value)}</p>
          <p className="text-xs text-zinc-500">{formatPercent(percentage)}</p>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-900">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function AttendanceItem({ label, value, colorClass }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-white/6 bg-white/[0.03] px-5 py-4.5">
      <div className="flex items-center gap-3">
        <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <span className="text-sm text-zinc-300">{label}</span>
      </div>
      <span className="rounded-xl bg-black/20 px-3 py-1.5 text-sm font-semibold text-white">{value}</span>
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
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const pagamentos = data?.por_forma_pagamento || {};
  const atendimentos = data?.por_atendimento || {};
  const status = data?.por_status || {};

  const totalPagamentos = Object.values(pagamentos).reduce((sum, value) => sum + value, 0);
  const pedidosAtivos =
    (status.novo || 0) +
    (status.aguardando_pagamento || 0) +
    (status.pagamento_aprovado || 0) +
    (status.em_preparo || 0) +
    (status.pronto || 0) +
    (status.saiu_entrega || 0);

  const paymentItems = [
    { label: 'Dinheiro', value: pagamentos.dinheiro || 0, colorClass: 'bg-emerald-500' },
    { label: 'Pix', value: pagamentos.pix || 0, colorClass: 'bg-sky-500' },
    { label: 'Cartão de Débito', value: pagamentos.cartao_debito || 0, colorClass: 'bg-indigo-500' },
    { label: 'Cartão de Crédito', value: pagamentos.cartao_credito || 0, colorClass: 'bg-amber-500' },
  ].map((item) => ({
    ...item,
    percentage: totalPagamentos > 0 ? (item.value / totalPagamentos) * 100 : 0,
  }));

  const attendanceItems = [
    { label: 'Presencial', value: atendimentos.presencial || 0, colorClass: 'bg-orange-500' },
    { label: 'Balcão', value: atendimentos.balcao || 0, colorClass: 'bg-blue-500' },
    { label: 'Consumo local', value: atendimentos.consumo_local || 0, colorClass: 'bg-violet-500' },
    { label: 'Retirada', value: atendimentos.retirada || 0, colorClass: 'bg-yellow-500' },
    { label: 'Delivery', value: atendimentos.delivery || 0, colorClass: 'bg-teal-500' },
  ];

  const dateMain = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(245,200,0,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(139,63,190,0.16),_transparent_20%),linear-gradient(180deg,_#09090c_0%,_#11111a_100%)] px-5 py-5 lg:px-8 lg:py-7 xl:px-10">
      <div className="mx-auto max-w-[1520px] space-y-7">
        <Surface className="relative overflow-hidden p-7 lg:p-9 xl:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,63,190,0.16),_transparent_28%)]" />
          <div className="relative grid gap-6 lg:gap-7 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,420px)]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-orange-300">
                    <Pizza className="h-3.5 w-3.5" />
                    Operação do Dia
                  </div>
                  <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white xl:text-[3.2rem]">
                    Dashboard de atendimento com foco no que precisa de ação agora
                  </h1>
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-400">
                    Acompanhe pedidos ativos, receita aprovada e distribuição do atendimento sem mudar o fluxo do caixa, PDV e pedidos.
                  </p>
                </div>

                <div className="rounded-[24px] border border-purple-500/14 bg-white/[0.03] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Hoje</p>
                      <p className="text-sm font-semibold capitalize text-white">{dateMain}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <ActionButton to="/pdv" label="Abrir PDV" hint="Iniciar um novo pedido" icon={ShoppingBag} primary />
                <ActionButton to="/pedidos" label="Painel de Pedidos" hint="Acompanhar fila e produção" icon={Package2} />
                <ActionButton to="/caixa" label="Caixa" hint="Conferir movimentação" icon={Wallet} />
              </div>
            </div>

            <div className="grid content-start gap-4 sm:grid-cols-2 2xl:grid-cols-1">
              <div className="min-h-[164px] rounded-[26px] border border-orange-400/14 bg-[linear-gradient(145deg,rgba(245,200,0,0.12),rgba(255,122,0,0.05),rgba(139,63,190,0.08))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Pedidos em andamento</p>
                <p className="mt-3 text-4xl font-bold text-white">{pedidosAtivos}</p>
                <p className="mt-2 text-sm text-zinc-300">
                  {status.em_preparo || 0} em preparo, {status.pronto || 0} prontos e {status.saiu_entrega || 0} em rota.
                </p>
              </div>

              <div className="min-h-[164px] rounded-[26px] border border-purple-500/14 bg-white/[0.03] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Resumo financeiro</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm text-zinc-400">Receita aprovada</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(data?.total_vendido)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-[20px] bg-black/20 p-4">
                      <p className="text-zinc-500">Ticket médio</p>
                      <p className="mt-1 font-semibold text-white">{formatCurrency(data?.ticket_medio)}</p>
                    </div>
                    <div className="rounded-[20px] bg-black/20 p-4">
                      <p className="text-zinc-500">Aguardando</p>
                      <p className="mt-1 font-semibold text-white">{formatCurrency(data?.total_aguardando_pagamento)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Surface>

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            label="Total de pedidos"
            value={data?.total_pedidos || 0}
            support="Volume total registrado hoje"
            icon={ShoppingBag}
            accentClass="bg-orange-500/10 text-orange-400"
            panelClass="bg-[linear-gradient(180deg,rgba(22,22,31,0.96),rgba(18,18,27,0.92))]"
          />
          <MetricCard
            label="Total vendido"
            value={formatCurrency(data?.total_vendido)}
            support="Somente pagamentos aprovados"
            icon={DollarSign}
            accentClass="bg-emerald-500/10 text-emerald-400"
            panelClass="bg-[linear-gradient(180deg,rgba(22,22,31,0.96),rgba(18,18,27,0.92))]"
          />
          <MetricCard
            label="Ticket médio"
            value={formatCurrency(data?.ticket_medio)}
            support="Média por pedido pago"
            icon={TrendingUp}
            accentClass="bg-sky-500/10 text-sky-400"
            panelClass="bg-[linear-gradient(180deg,rgba(22,22,31,0.96),rgba(18,18,27,0.92))]"
          />
          <MetricCard
            label="Pendência de pagamento"
            value={formatCurrency(data?.total_aguardando_pagamento)}
            support="Pedidos aguardando confirmação"
            icon={Clock3}
            accentClass="bg-amber-500/10 text-amber-400"
            panelClass="bg-[linear-gradient(180deg,rgba(22,22,31,0.96),rgba(18,18,27,0.92))]"
          />
        </div>

        <Surface className="p-6 lg:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Fila operacional</h2>
              <p className="text-sm text-zinc-400">Distribuição dos pedidos por etapa do fluxo</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatusPill label="Novos" value={status.novo || 0} icon={Sparkles} iconClass="bg-blue-500/10 text-blue-400" ringClass="border-blue-500/16" />
            <StatusPill label="Em preparo" value={status.em_preparo || 0} icon={Flame} iconClass="bg-violet-500/10 text-violet-400" ringClass="border-violet-500/16" />
            <StatusPill label="Prontos" value={status.pronto || 0} icon={CheckCircle2} iconClass="bg-emerald-500/10 text-emerald-400" ringClass="border-emerald-500/16" />
            <StatusPill label="Saiu entrega" value={status.saiu_entrega || 0} icon={Truck} iconClass="bg-teal-500/10 text-teal-400" ringClass="border-teal-500/16" />
            <StatusPill label="Finalizados" value={status.finalizado || 0} icon={Flag} iconClass="bg-zinc-500/10 text-zinc-300" ringClass="border-white/8" />
            <StatusPill label="Cancelados" value={status.cancelado || 0} icon={XCircle} iconClass="bg-red-500/10 text-red-400" ringClass="border-red-500/16" />
          </div>
        </Surface>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <Surface className="p-7 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <CreditCard className="h-5 w-5 text-orange-400" />
                  Formas de pagamento
                </h2>
                <p className="text-sm text-zinc-400">Participação sobre o total de vendas aprovadas</p>
              </div>
              <div className="rounded-[22px] bg-white/[0.03] px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(totalPagamentos)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {paymentItems.map((item) => (
                <PaymentBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  percentage={item.percentage}
                  colorClass={item.colorClass}
                />
              ))}
            </div>
          </Surface>

          <Surface className="p-7 lg:p-8">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Users2 className="h-5 w-5 text-orange-400" />
                Tipos de atendimento
              </h2>
              <p className="text-sm text-zinc-400">Como os pedidos do dia estão distribuídos no canal de venda</p>
            </div>

            <div className="space-y-4">
              {attendanceItems.map((item) => (
                <AttendanceItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  colorClass={item.colorClass}
                />
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
