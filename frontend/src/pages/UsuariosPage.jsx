import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, Shield, ToggleRight, ToggleLeft, X } from 'lucide-react';

const PERFIS = [
  { value: 'ADMIN', label: 'Administrador', color: 'text-red-400 bg-red-500/10', desc: 'Acesso total, pode confirmar pagamentos' },
  { value: 'ATENDENTE', label: 'Atendente', color: 'text-blue-400 bg-blue-500/10', desc: 'Pode criar e gerenciar pedidos' },
  { value: 'OPERADOR_CAIXA', label: 'Op. Caixa', color: 'text-green-400 bg-green-500/10', desc: 'Acesso ao módulo de caixa' },
];

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const { usuario: eu } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'ATENDENTE' });

  const fetch = async () => {
    const res = await api.get('/usuarios');
    setUsuarios(res.data);
  };

  useEffect(() => { fetch(); }, []);

  const abrirNovo = () => { setEditando(null); setForm({ nome: '', email: '', senha: '', perfil: 'ATENDENTE' }); setModal(true); };
  const abrirEditar = (u) => { setEditando(u); setForm({ nome: u.nome, email: u.email, senha: '', perfil: u.perfil }); setModal(true); };

  const handleSalvar = async () => {
    if (!form.nome || !form.email) return toast.error('Nome e email são obrigatórios');
    if (!editando && !form.senha) return toast.error('Senha é obrigatória');
    try {
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, form);
        toast.success('Usuário atualizado!');
      } else {
        await api.post('/usuarios', form);
        toast.success('Usuário criado!');
      }
      setModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar'); }
  };

  const handleToggle = async (u) => {
    if (u.id === eu.id) return toast.error('Você não pode desativar seu próprio usuário');
    try {
      await api.delete(`/usuarios/${u.id}`);
      toast(u.ativo ? 'Usuário desativado' : 'Ação não permitida', { icon: '⚠️' });
      fetch();
    } catch { toast.error('Erro'); }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-gray-400 text-sm">{usuarios.length} usuário(s) cadastrado(s)</p>
        </div>
        <button onClick={abrirNovo}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Usuário', 'Email', 'Perfil', 'Status', 'Ações'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const perfil = PERFIS.find(p => p.value === u.perfil);
              return (
                <tr key={u.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="text-orange-400 font-bold">{u.nome.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-white font-medium">{u.nome}</span>
                      {u.id === eu.id && <span className="text-orange-400 text-xs">(você)</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${perfil?.color}`}>
                      <Shield className="w-3 h-3" /> {perfil?.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${u.ativo ? 'text-green-400' : 'text-red-400'}`}>
                      {u.ativo ? '● Ativo' : '○ Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(u)}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {u.id !== eu.id && (
                        <button onClick={() => handleToggle(u)}
                          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                          {u.ativo ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Perfis info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PERFIS.map(p => (
          <div key={p.value} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-2 ${p.color} text-sm font-semibold`}>
              <Shield className="w-4 h-4" /> {p.label}
            </div>
            <p className="text-gray-500 text-xs">{p.desc}</p>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Usuário' : 'Novo Usuário'}>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs block mb-1.5">Nome *</label>
            <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1.5">{editando ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
            <input type="password" value={form.senha} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-2">Perfil</label>
            <div className="space-y-2">
              {PERFIS.map(p => (
                <button key={p.value} onClick={() => setForm(prev => ({ ...prev, perfil: p.value }))}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    form.perfil === p.value ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-gray-600'
                  }`}>
                  <div className={`mt-0.5 p-1 rounded-lg ${p.color}`}><Shield className="w-3.5 h-3.5" /></div>
                  <div>
                    <p className={`text-sm font-medium ${form.perfil === p.value ? 'text-white' : 'text-gray-300'}`}>{p.label}</p>
                    <p className="text-gray-500 text-xs">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSalvar}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all">
            {editando ? 'Atualizar Usuário' : 'Criar Usuário'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
