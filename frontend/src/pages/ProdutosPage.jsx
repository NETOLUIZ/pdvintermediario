import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, X, Package, ToggleLeft, ToggleRight } from 'lucide-react';

const TIPOS = ['PIZZA', 'BEBIDA', 'SOBREMESA', 'COMBO', 'ADICIONAL', 'BORDA'];
const TIPO_EMOJI = { PIZZA: '🍕', BEBIDA: '🥤', SOBREMESA: '🍰', COMBO: '📦', ADICIONAL: '➕', BORDA: '🔄' };

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function ProdutosPage() {
  const { isAdmin } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [catFiltro, setCatFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '', tipo: 'PIZZA', categoria_id: '', tamanhos: [{ tamanho: 'M', preco: '' }] });

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      api.get(`/produtos${catFiltro ? `?categoria_id=${catFiltro}` : ''}`),
      api.get('/categorias'),
    ]);
    setProdutos(p.data);
    setCategorias(c.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [catFiltro]);

  const handleSalvar = async () => {
    if (!form.nome || !form.tipo || !form.categoria_id) return toast.error('Preencha todos os campos obrigatórios');
    try {
      await api.post('/produtos', { ...form, tamanhos: form.tamanhos.filter(t => t.preco) });
      toast.success('Produto criado!');
      setModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  const handleToggle = async (id, ativo) => {
    try {
      await api.put(`/produtos/${id}`, { ativo: !ativo });
      toast.success(ativo ? 'Produto desativado' : 'Produto ativado');
      fetchData();
    } catch { toast.error('Erro ao atualizar produto'); }
  };

  const tamSizes = ['Broto', 'P', 'M', 'G', 'GG', 'Família', 'Único'];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="text-gray-400 text-sm">{produtos.length} produto(s)</p>
        </div>
        {isAdmin() && (
          <button onClick={() => { setForm({ nome: '', descricao: '', tipo: 'PIZZA', categoria_id: '', tamanhos: [{ tamanho: 'M', preco: '' }] }); setModal(true); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        )}
      </div>

      {/* Filtro categorias */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setCatFiltro('')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${!catFiltro ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
          Todos
        </button>
        {categorias.map(c => (
          <button key={c.id} onClick={() => setCatFiltro(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${catFiltro === c.id ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
            {TIPO_EMOJI[c.tipo]} {c.nome}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {produtos.map(p => (
            <div key={p.id} className={`bg-gray-900 border rounded-2xl p-4 card-hover ${!p.ativo ? 'opacity-50 border-gray-800' : 'border-gray-800'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                  {TIPO_EMOJI[p.tipo]}
                </div>
                {isAdmin() && (
                  <button onClick={() => handleToggle(p.id, p.ativo)} className="text-gray-500 hover:text-orange-400 transition-colors">
                    {p.ativo ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                )}
              </div>
              <p className="text-white font-semibold text-sm mb-1">{p.nome}</p>
              {p.descricao && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{p.descricao}</p>}
              <div className="space-y-1">
                {p.tamanhos?.slice(0, 3).map(t => (
                  <div key={t.id} className="flex justify-between text-xs">
                    <span className="text-gray-500">{t.tamanho}</span>
                    <span className="text-orange-400 font-medium">R$ {parseFloat(t.preco).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{p.categoria?.nome}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal novo produto */}
      <Modal open={modal} onClose={() => setModal(false)} title="Novo Produto">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Nome *</label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Tipo *</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Categoria *</label>
            <select value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
              <option value="">Selecione...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400 text-xs">Tamanhos e preços</label>
              <button onClick={() => setForm(p => ({ ...p, tamanhos: [...p.tamanhos, { tamanho: 'M', preco: '' }] }))}
                className="text-orange-400 text-xs hover:text-orange-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> adicionar
              </button>
            </div>
            {form.tamanhos.map((t, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={t.tamanho} onChange={e => setForm(p => ({ ...p, tamanhos: p.tamanhos.map((x, j) => j === i ? { ...x, tamanho: e.target.value } : x) }))}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                  {tamSizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="number" placeholder="Preço" value={t.preco}
                  onChange={e => setForm(p => ({ ...p, tamanhos: p.tamanhos.map((x, j) => j === i ? { ...x, preco: e.target.value } : x) }))}
                  className="w-28 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
                {form.tamanhos.length > 1 && (
                  <button onClick={() => setForm(p => ({ ...p, tamanhos: p.tamanhos.filter((_, j) => j !== i) }))}
                    className="text-gray-600 hover:text-red-400"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleSalvar} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all">
            Salvar Produto
          </button>
        </div>
      </Modal>
    </div>
  );
}
