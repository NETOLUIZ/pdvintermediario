import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Wallet, Plus, Minus, Lock, Unlock, DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

export default function CaixaPage() {
  const [caixa, setCaixa] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valorInicial, setValorInicial] = useState('');
  const [movForm, setMovForm] = useState({ tipo: 'ENTRADA', descricao: '', valor: '' });

  const fetchCaixa = async () => {
    try {
      const res = await api.get('/caixa/atual');
      setCaixa(res.data);
      if (res.data?.id) {
        const r = await api.get(`/caixa/${res.data.id}/resumo`);
        setResumo(r.data.resumo);
      }
    } catch { setCaixa(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCaixa(); }, []);

  const abrirCaixa = async () => {
    try {
      await api.post('/caixa/abrir', { valor_inicial: parseFloat(valorInicial || 0) });
      toast.success('Caixa aberto!');
      fetchCaixa();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao abrir caixa'); }
  };

  const fecharCaixa = async () => {
    if (!window.confirm('Fechar o caixa?')) return;
    try {
      await api.post(`/caixa/${caixa.id}/fechar`, { valor_fechamento: resumo?.saldo_final });
      toast.success('Caixa fechado com sucesso!');
      fetchCaixa();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao fechar caixa'); }
  };

  const adicionarMovimentacao = async () => {
    if (!movForm.descricao || !movForm.valor) return toast.error('Preencha descrição e valor');
    try {
      await api.post(`/caixa/${caixa.id}/movimentacao`, movForm);
      toast.success('Movimentação adicionada!');
      setMovForm({ tipo: 'ENTRADA', descricao: '', valor: '' });
      fetchCaixa();
    } catch { toast.error('Erro ao adicionar movimentação'); }
  };

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2)}`;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Caixa fechado
  if (!caixa) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-orange-400" />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Caixa Fechado</h2>
        <p className="text-gray-400 text-sm mb-6">Abra o caixa para iniciar o atendimento</p>
        <div className="mb-4">
          <label className="text-gray-400 text-xs block mb-2">Valor inicial (troco/fundo)</label>
          <input type="number" value={valorInicial} onChange={e => setValorInicial(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-orange-500"
          />
        </div>
        <button onClick={abrirCaixa}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20">
          <Unlock className="w-5 h-5" /> Abrir Caixa
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Caixa</h1>
          <p className="text-gray-400 text-sm">
            Aberto em: {new Date(caixa.data_abertura).toLocaleString('pt-BR')}
            {' '}· {caixa.aberto_por?.nome}
          </p>
        </div>
        <button onClick={fecharCaixa}
          className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
          <Lock className="w-4 h-4" /> Fechar Caixa
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de vendas', value: fmt(resumo?.total_vendas), icon: TrendingUp, color: 'text-green-400 bg-green-500/10' },
          { label: 'Valor inicial', value: fmt(caixa.valor_inicial), icon: Wallet, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Entradas extras', value: fmt(resumo?.total_entradas), icon: Plus, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Saídas', value: fmt(resumo?.total_saidas), icon: Minus, color: 'text-red-400 bg-red-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por forma de pagamento */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Receipt className="w-5 h-5 text-orange-400" /> Por forma de pagamento</h3>
          <div className="space-y-3">
            {[
              { label: '💵 Dinheiro', key: 'DINHEIRO' },
              { label: '📱 Pix', key: 'PIX' },
              { label: '💳 Débito', key: 'CARTAO_DEBITO' },
              { label: '💳 Crédito', key: 'CARTAO_CREDITO' },
            ].map(({ label, key }) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className="text-white font-semibold">{fmt(resumo?.totais_por_forma?.[key])}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
            <span className="text-white font-bold">Saldo final</span>
            <span className="text-orange-400 font-bold text-lg">{fmt(resumo?.saldo_final)}</span>
          </div>
        </div>

        {/* Movimentações */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Movimentações manuais</h3>

          {/* Form */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              {['ENTRADA', 'SAIDA'].map(t => (
                <button key={t} onClick={() => setMovForm(p => ({ ...p, tipo: t }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    movForm.tipo === t
                      ? t === 'ENTRADA' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
                      : 'bg-gray-800 border border-gray-700 text-gray-500'
                  }`}>
                  {t === 'ENTRADA' ? '+ Entrada' : '- Saída'}
                </button>
              ))}
            </div>
            <input value={movForm.descricao} onChange={e => setMovForm(p => ({ ...p, descricao: e.target.value }))}
              placeholder="Descrição"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
            <div className="flex gap-2">
              <input type="number" value={movForm.valor} onChange={e => setMovForm(p => ({ ...p, valor: e.target.value }))}
                placeholder="Valor" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
              <button onClick={adicionarMovimentacao}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista movimentações */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {caixa.movimentacoes?.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">Nenhuma movimentação</p>
            ) : (
              [...(caixa.movimentacoes || [])].reverse().map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-white text-sm">{m.descricao}</p>
                    <p className="text-gray-500 text-xs">{new Date(m.criado_em).toLocaleTimeString('pt-BR')}</p>
                  </div>
                  <span className={`font-semibold ${m.tipo === 'ENTRADA' ? 'text-green-400' : 'text-red-400'}`}>
                    {m.tipo === 'ENTRADA' ? '+' : '-'} {fmt(m.valor)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
