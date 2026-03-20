import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Wallet,
  Plus,
  Minus,
  Lock,
  Unlock,
  TrendingUp,
  Receipt,
  Landmark,
  ArrowRightLeft,
} from 'lucide-react';
import './CaixaPage.css';

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
    } catch {
      setCaixa(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaixa();
  }, []);

  const abrirCaixa = async () => {
    try {
      await api.post('/caixa/abrir', { valor_inicial: parseFloat(valorInicial || 0) });
      toast.success('Caixa aberto!');
      fetchCaixa();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao abrir caixa');
    }
  };

  const fecharCaixa = async () => {
    if (!window.confirm('Fechar o caixa?')) return;
    try {
      await api.post(`/caixa/${caixa.id}/fechar`, { valor_fechamento: resumo?.saldo_final });
      toast.success('Caixa fechado com sucesso!');
      fetchCaixa();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao fechar caixa');
    }
  };

  const adicionarMovimentacao = async () => {
    if (!movForm.descricao || !movForm.valor) {
      return toast.error('Preencha descrição e valor');
    }

    try {
      await api.post(`/caixa/${caixa.id}/movimentacao`, movForm);
      toast.success('Movimentação adicionada!');
      setMovForm({ tipo: 'ENTRADA', descricao: '', valor: '' });
      fetchCaixa();
    } catch {
      toast.error('Erro ao adicionar movimentação');
    }
  };

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div className="caixa-page caixa-page--loading">
        <div className="caixa-page__spinner" />
      </div>
    );
  }

  if (!caixa) {
    return (
      <div className="caixa-page caixa-page--closed animate-fade-in">
        <section className="caixa-page__closed-card">
          <div className="caixa-page__closed-icon">
            <Lock className="w-8 h-8" />
          </div>

          <p className="caixa-page__eyebrow">Operação de caixa</p>
          <h1 className="caixa-page__closed-title">Caixa fechado</h1>
          <p className="caixa-page__closed-text">Abra o caixa para iniciar o atendimento e registrar as movimentações do turno.</p>

          <div className="caixa-page__open-form">
            <label>Valor inicial (troco/fundo)</label>
            <input
              type="number"
              value={valorInicial}
              onChange={(e) => setValorInicial(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <button type="button" onClick={abrirCaixa} className="caixa-page__primary-button">
            <Unlock className="w-5 h-5" />
            Abrir Caixa
          </button>
        </section>
      </div>
    );
  }

  const cardsResumo = [
    { label: 'Total de vendas', value: fmt(resumo?.total_vendas), icon: TrendingUp, tone: 'success' },
    { label: 'Valor inicial', value: fmt(caixa.valor_inicial), icon: Wallet, tone: 'info' },
    { label: 'Entradas extras', value: fmt(resumo?.total_entradas), icon: Plus, tone: 'neutral' },
    { label: 'Saídas', value: fmt(resumo?.total_saidas), icon: Minus, tone: 'danger' },
  ];

  const formasPagamento = [
    { label: 'Dinheiro', key: 'DINHEIRO' },
    { label: 'Pix', key: 'PIX' },
    { label: 'Cartão de Débito', key: 'CARTAO_DEBITO' },
    { label: 'Cartão de Crédito', key: 'CARTAO_CREDITO' },
  ];

  return (
    <div className="caixa-page animate-fade-in">
      <section className="caixa-page__hero">
        <div>
          <p className="caixa-page__eyebrow">Controle financeiro do turno</p>
          <h1 className="caixa-page__title">Caixa operacional e movimentações do dia</h1>
          <p className="caixa-page__subtitle">
            Abertura, saldo, formas de pagamento e registros manuais com a mesma linguagem visual do restante do sistema.
          </p>
        </div>

        <button type="button" onClick={fecharCaixa} className="caixa-page__danger-button">
          <Lock className="w-4 h-4" />
          Fechar Caixa
        </button>
      </section>

      <section className="caixa-page__status-row">
        <div className="caixa-page__status-card">
          <p className="caixa-page__status-label">Aberto em</p>
          <strong>{new Date(caixa.data_abertura).toLocaleString('pt-BR')}</strong>
        </div>
        <div className="caixa-page__status-card is-highlight">
          <p className="caixa-page__status-label">Operador</p>
          <strong>{caixa.aberto_por?.nome || 'Sem identificação'}</strong>
        </div>
      </section>

      <section className="caixa-page__stats">
        {cardsResumo.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className={`caixa-page__stat-card tone-${tone}`}>
            <div className="caixa-page__stat-icon">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="caixa-page__stat-label">{label}</p>
              <strong className="caixa-page__stat-value">{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="caixa-page__content">
        <article className="caixa-page__panel">
          <div className="caixa-page__panel-header">
            <div>
              <p className="caixa-page__panel-eyebrow">Resumo</p>
              <h2 className="caixa-page__panel-title">Por forma de pagamento</h2>
            </div>
            <div className="caixa-page__panel-icon">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="caixa-page__payment-list">
            {formasPagamento.map(({ label, key }) => (
              <div key={key} className="caixa-page__payment-row">
                <span>{label}</span>
                <strong>{fmt(resumo?.totais_por_forma?.[key])}</strong>
              </div>
            ))}
          </div>

          <div className="caixa-page__balance">
            <span>Saldo final</span>
            <strong>{fmt(resumo?.saldo_final)}</strong>
          </div>
        </article>

        <article className="caixa-page__panel">
          <div className="caixa-page__panel-header">
            <div>
              <p className="caixa-page__panel-eyebrow">Lançamentos</p>
              <h2 className="caixa-page__panel-title">Movimentações manuais</h2>
            </div>
            <div className="caixa-page__panel-icon">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="caixa-page__movement-form">
            <div className="caixa-page__movement-types">
              {['ENTRADA', 'SAIDA'].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setMovForm((prev) => ({ ...prev, tipo }))}
                  className={`caixa-page__movement-type ${movForm.tipo === tipo ? 'is-active' : ''} ${
                    tipo === 'SAIDA' ? 'is-danger' : 'is-success'
                  }`}
                >
                  {tipo === 'ENTRADA' ? '+ Entrada' : '- Saída'}
                </button>
              ))}
            </div>

            <input
              value={movForm.descricao}
              onChange={(e) => setMovForm((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição"
              className="caixa-page__input"
            />

            <div className="caixa-page__movement-row">
              <input
                type="number"
                value={movForm.valor}
                onChange={(e) => setMovForm((prev) => ({ ...prev, valor: e.target.value }))}
                placeholder="Valor"
                className="caixa-page__input"
              />

              <button type="button" onClick={adicionarMovimentacao} className="caixa-page__primary-button is-inline">
                Adicionar
              </button>
            </div>
          </div>

          <div className="caixa-page__movement-list">
            {caixa.movimentacoes?.length === 0 ? (
              <div className="caixa-page__movement-empty">
                <Landmark className="w-8 h-8" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            ) : (
              [...(caixa.movimentacoes || [])].reverse().map((movimentacao) => (
                <div key={movimentacao.id} className="caixa-page__movement-item">
                  <div>
                    <p className="caixa-page__movement-description">{movimentacao.descricao}</p>
                    <p className="caixa-page__movement-time">
                      {new Date(movimentacao.criado_em).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  <span className={`caixa-page__movement-value ${movimentacao.tipo === 'ENTRADA' ? 'is-positive' : 'is-negative'}`}>
                    {movimentacao.tipo === 'ENTRADA' ? '+' : '-'} {fmt(movimentacao.valor)}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
