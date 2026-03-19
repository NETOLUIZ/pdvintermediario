import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Table2, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  LIVRE: { color: 'border-green-500/40 bg-green-500/10', textColor: 'text-green-400', label: 'Livre', icon: '✓' },
  OCUPADA: { color: 'border-orange-500/40 bg-orange-500/10', textColor: 'text-orange-400', label: 'Ocupada', icon: '●' },
  RESERVADA: { color: 'border-blue-500/40 bg-blue-500/10', textColor: 'text-blue-400', label: 'Reservada', icon: '◆' },
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
    } catch { toast.error('Erro ao liberar mesa'); }
  };

  const livre = mesas.filter(m => m.status === 'LIVRE').length;
  const ocupada = mesas.filter(m => m.status === 'OCUPADA').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mesas</h1>
          <div className="flex items-center gap-4 text-sm mt-1">
            <span className="text-green-400">✓ {livre} livre(s)</span>
            <span className="text-orange-400">● {ocupada} ocupada(s)</span>
          </div>
        </div>
        <button onClick={fetchMesas}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {mesas.map(mesa => {
            const cfg = STATUS_CONFIG[mesa.status];
            const pedidoAtivo = mesa.pedidos?.[0];
            return (
              <div key={mesa.id}
                className={`border-2 rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 card-hover ${cfg.color}`}>
                <div className="text-2xl font-black text-white mb-1">{mesa.numero}</div>
                <div className={`text-xs font-semibold ${cfg.textColor} mb-2`}>{cfg.label}</div>
                {pedidoAtivo && (
                  <div className="text-xs text-gray-400">
                    <p className="text-orange-400 font-bold">R$ {parseFloat(pedidoAtivo.valor_total).toFixed(2)}</p>
                    <p className="truncate text-gray-500">#{pedidoAtivo.numero}</p>
                  </div>
                )}
                {mesa.status === 'OCUPADA' && (
                  <button onClick={() => liberarMesa(mesa.id)}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">
                    Liberar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 pt-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-md border-2 ${cfg.color}`} />
            <span className={`text-sm ${cfg.textColor}`}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
