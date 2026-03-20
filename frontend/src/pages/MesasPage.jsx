import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import './MesasPage.css';

const STATUS_CONFIG = {
  LIVRE: {
    toneClass: 'mesas-page__table-card--livre',
    pillClass: 'mesas-page__table-pill--livre',
    legendClass: 'mesas-page__legend-dot--livre',
    textClass: 'mesas-page__legend-text--livre',
    label: 'Livre',
  },
  OCUPADA: {
    toneClass: 'mesas-page__table-card--ocupada',
    pillClass: 'mesas-page__table-pill--ocupada',
    legendClass: 'mesas-page__legend-dot--ocupada',
    textClass: 'mesas-page__legend-text--ocupada',
    label: 'Ocupada',
  },
  RESERVADA: {
    toneClass: 'mesas-page__table-card--reservada',
    pillClass: 'mesas-page__table-pill--reservada',
    legendClass: 'mesas-page__legend-dot--reservada',
    textClass: 'mesas-page__legend-text--reservada',
    label: 'Reservada',
  },
};

export default function MesasPage() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMesas = async () => {
    try {
      const res = await api.get('/mesas');
      setMesas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesas();
    const i = setInterval(fetchMesas, 15000);
    return () => clearInterval(i);
  }, []);

  const liberarMesa = async (id) => {
    try {
      await api.put(`/mesas/${id}/liberar`);
      toast.success('Mesa liberada!');
      fetchMesas();
    } catch {
      toast.error('Erro ao liberar mesa');
    }
  };

  const livre = mesas.filter((m) => m.status === 'LIVRE').length;
  const ocupada = mesas.filter((m) => m.status === 'OCUPADA').length;

  return (
    <div className="mesas-page animate-fade-in">
      <div className="mesas-page__container">
        <header className="mesas-page__hero">
          <div className="mesas-page__hero-copy">
            <p className="mesas-page__eyebrow">Mapa de mesas e giro</p>
            <h1 className="mesas-page__title">Mesas</h1>
          </div>

          <button onClick={fetchMesas} className="mesas-page__refresh">
            <RefreshCw className="mesas-page__refresh-icon" />
            Atualizar
          </button>
        </header>

        <section className="mesas-page__summary">
          <div className="mesas-page__summary-badges">
            <span className="mesas-page__summary-item mesas-page__summary-item--livre">✓ {livre} livre(s)</span>
            <span className="mesas-page__summary-item mesas-page__summary-item--ocupada">● {ocupada} ocupada(s)</span>
          </div>

          <div className="mesas-page__legend">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="mesas-page__legend-item">
                <span className={`mesas-page__legend-dot ${cfg.legendClass}`} />
                <span className={`mesas-page__legend-text ${cfg.textClass}`}>{cfg.label}</span>
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="mesas-page__loading">
            <div className="mesas-page__spinner" />
          </div>
        ) : (
          <div className="mesas-page__grid">
            {mesas.map((mesa) => {
              const cfg = STATUS_CONFIG[mesa.status];
              const pedidoAtivo = mesa.pedidos?.[0];

              return (
                <div key={mesa.id} className={`mesas-page__table-card ${cfg.toneClass}`}>
                  <div className="mesas-page__table-number">{mesa.numero}</div>
                  <div className={`mesas-page__table-pill ${cfg.pillClass}`} />
                  <p className="mesas-page__table-status">{cfg.label}</p>

                  {pedidoAtivo && (
                    <div className="mesas-page__table-order">
                      <p className="mesas-page__table-total">R$ {parseFloat(pedidoAtivo.valor_total).toFixed(2)}</p>
                      <p className="mesas-page__table-order-number">#{pedidoAtivo.numero}</p>
                    </div>
                  )}

                  {mesa.status === 'OCUPADA' && (
                    <button onClick={() => liberarMesa(mesa.id)} className="mesas-page__release">
                      Liberar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
