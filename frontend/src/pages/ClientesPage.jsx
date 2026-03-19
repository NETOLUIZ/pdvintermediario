import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Phone, MapPin, Pencil, Trash2, X } from 'lucide-react';

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const EMPTY = { nome: '', telefone: '', endereco: '', numero: '', bairro: '', complemento: '', referencia: '' };

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const fetchClientes = async () => {
    const res = await api.get(`/clientes${busca ? `?busca=${busca}` : ''}`);
    setClientes(res.data);
  };

  useEffect(() => { fetchClientes(); }, [busca]);

  const abrirNovo = () => { setEditando(null); setForm(EMPTY); setModal(true); };
  const abrirEditar = (c) => { setEditando(c); setForm(c); setModal(true); };

  const handleSalvar = async () => {
    if (!form.nome) return toast.error('Nome é obrigatório');
    try {
      if (editando) {
        await api.put(`/clientes/${editando.id}`, form);
        toast.success('Cliente atualizado!');
      } else {
        await api.post('/clientes', form);
        toast.success('Cliente cadastrado!');
      }
      setModal(false);
      fetchClientes();
    } catch { toast.error('Erro ao salvar cliente'); }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      toast.success('Cliente excluído');
      fetchClientes();
    } catch { toast.error('Erro ao excluir'); }
  };

  const campo = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="text-gray-400 text-xs block mb-1">{label}</label>
      <input type={type} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 text-sm">{clientes.length} cliente(s)</p>
        </div>
        <button onClick={abrirNovo}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map(c => (
          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400 font-bold">{c.nome.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => abrirEditar(c)} className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDeletar(c.id)} className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-white font-semibold">{c.nome}</p>
            {c.telefone && <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5" />{c.telefone}</p>}
            {c.bairro && (
              <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {[c.endereco, c.numero, c.bairro].filter(Boolean).join(', ')}
              </p>
            )}
            {c.referencia && <p className="text-gray-600 text-xs mt-1 italic">Ref: {c.referencia}</p>}
          </div>
        ))}
      </div>

      {clientes.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-2">Nenhum cliente encontrado</p>
          <button onClick={abrirNovo} className="text-orange-400 text-sm hover:text-orange-300">Cadastrar primeiro cliente →</button>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Cliente' : 'Novo Cliente'}>
        <div className="space-y-3">
          {campo('nome', 'Nome *')}
          {campo('telefone', 'Telefone', 'tel')}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">{campo('endereco', 'Endereço')}</div>
            {campo('numero', 'Número')}
          </div>
          {campo('bairro', 'Bairro')}
          {campo('complemento', 'Complemento')}
          {campo('referencia', 'Ponto de referência')}
          <button onClick={handleSalvar}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all mt-2">
            {editando ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
