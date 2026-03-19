import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BarChart3, Calendar, TrendingUp, ShoppingBag, DollarSign, Sparkles } from 'lucide-react';

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
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

  const FORMA_LABELS = { DINHEIRO: 'Dinheiro', PIX: 'Pix', CARTAO_DEBITO: 'Débito', CARTAO_CREDITO: 'Crédito' };
  const TIPO_LABELS = { PRESENCIAL: 'Presencial', BALCAO: 'Balcão', CONSUMO_LOCAL: 'Consumo Local', RETIRADA: 'Retirada', DELIVERY: 'Delivery' };

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(245,200,0,0.12),_transparent_24%),radial-gradient(circle_at_82%_18%,_rgba(139,63,190,0.16),_transparent_22%),linear-gradient(180deg,_#0b0b10_0%,_#11111a_100%)] p-5 lg:p-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="rounded-[28px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.94),rgba(17,17,25,0.94))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.34)] lg:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-orange-300">
                <Sparkles className="h-3.5 w-3.5" />
                Leitura comercial
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">Relatórios com a mesma assinatura visual do PDV</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
                Analise vendas, pagamentos e mix de atendimento com foco rápido em volume, valor e ritmo operacional.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-500">Data inicial</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="rounded-[18px] border border-purple-500/16 bg-[#1b1b28] px-4 py-3 text-sm text-white focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-gray-500">Data final</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="rounded-[18px] border border-purple-500/16 bg-[#1b1b28] px-4 py-3 text-sm text-white focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Hoje', fn: () => { const d = new Date().toISOString().split('T')[0]; setDataInicio(d); setDataFim(d); } },
                  { label: '7 dias', fn: () => { setDataInicio(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]); setDataFim(new Date().toISOString().split('T')[0]); } },
                  { label: '30 dias', fn: () => { setDataInicio(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]); setDataFim(new Date().toISOString().split('T')[0]); } },
                ].map(({ label, fn }) => (
                  <button
                    key={label}
                    onClick={fn}
                    className="rounded-[16px] border border-purple-500/14 bg-white/[0.03] px-4 py-3 text-xs font-bold text-gray-300 hover:border-orange-400/24 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={buscarRelatorio}
                disabled={loading}
                className="flex items-center gap-2 rounded-[18px] bg-orange-500 px-5 py-3.5 font-black text-[#241d00] shadow-[0_16px_34px_rgba(245,200,0,0.18)] hover:bg-orange-300 disabled:opacity-50"
              >
                <BarChart3 className="h-4 w-4" />
                Gerar relatório
              </button>
            </div>
          </div>
        </section>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-9 w-9 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Total de pedidos', value: data.total_pedidos, icon: ShoppingBag, color: 'bg-blue-500/12 text-blue-400' },
                { label: 'Total vendido', value: fmt(data.total_vendido), icon: DollarSign, color: 'bg-green-500/12 text-green-400' },
                { label: 'Ticket médio', value: fmt(data.ticket_medio), icon: TrendingUp, color: 'bg-orange-500/12 text-orange-400' },
                { label: 'Dias no período', value: data.vendas_por_dia?.length || 0, icon: Calendar, color: 'bg-purple-500/12 text-purple-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-[24px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.94),rgba(17,17,25,0.94))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.94),rgba(17,17,25,0.94))] p-6">
                <h3 className="mb-5 text-lg font-black text-white">Por forma de pagamento</h3>
                <div className="space-y-3">
                  {Object.entries(data.por_forma_pagamento || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between rounded-[18px] border border-purple-500/10 bg-white/[0.03] px-4 py-4">
                      <span className="text-sm font-semibold text-gray-300">{FORMA_LABELS[key] || key}</span>
                      <div className="text-right">
                        <p className="font-black text-white">{fmt(val.total)}</p>
                        <p className="text-xs text-gray-500">{val.quantidade} pedido(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.94),rgba(17,17,25,0.94))] p-6">
                <h3 className="mb-5 text-lg font-black text-white">Por tipo de atendimento</h3>
                <div className="space-y-3">
                  {Object.entries(data.por_tipo_atendimento || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between rounded-[18px] border border-purple-500/10 bg-white/[0.03] px-4 py-4">
                      <span className="text-sm font-semibold text-gray-300">{TIPO_LABELS[key] || key}</span>
                      <div className="text-right">
                        <p className="font-black text-white">{fmt(val.total)}</p>
                        <p className="text-xs text-gray-500">{val.quantidade} pedido(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.94),rgba(17,17,25,0.94))] p-6">
              <h3 className="mb-5 text-lg font-black text-white">Produtos mais vendidos</h3>
              <div className="space-y-4">
                {data.produtos_mais_vendidos?.map((p, i) => (
                  <div key={`${p.nome}-${i}`} className="flex items-center gap-4">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                      i === 0 ? 'bg-orange-500/16 text-orange-300' :
                      i === 1 ? 'bg-purple-500/14 text-purple-300' :
                      i === 2 ? 'bg-blue-500/14 text-blue-300' : 'bg-white/[0.05] text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white">{p.nome}</p>
                        <span className="text-sm text-gray-400">{p.quantidade}x</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#1b1b28]">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(90deg,#f5c800,#8b3fbe)]"
                          style={{ width: `${(p.quantidade / (data.produtos_mais_vendidos[0]?.quantidade || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-black text-orange-300">{fmt(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {data.vendas_por_dia?.length > 0 && (
              <div className="rounded-[28px] border border-purple-500/14 bg-[linear-gradient(180deg,rgba(22,22,31,0.94),rgba(17,17,25,0.94))] p-6">
                <h3 className="mb-5 text-lg font-black text-white">Vendas por dia</h3>
                <div className="space-y-3">
                  {data.vendas_por_dia.map((d) => (
                    <div key={d.data} className="flex items-center gap-4">
                      <span className="w-28 text-sm text-gray-400">
                        {new Date(`${d.data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-[#1b1b28]">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(90deg,#3b5ce6,#f5c800)]"
                          style={{ width: `${(d.total / Math.max(...data.vendas_por_dia.map((x) => x.total))) * 100}%` }}
                        />
                      </div>
                      <span className="w-28 text-right text-sm font-bold text-white">{fmt(d.total)}</span>
                      <span className="w-16 text-right text-xs text-gray-500">{d.quantidade}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
