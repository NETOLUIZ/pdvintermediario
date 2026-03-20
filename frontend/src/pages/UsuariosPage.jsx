import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Pencil, Shield, ToggleRight, ToggleLeft, X, Users, LockKeyhole, BadgeCheck } from 'lucide-react';
import './UsuariosPage.css';

const PERFIS = [
  { value: 'ADMIN', label: 'Administrador', desc: 'Acesso total, pode confirmar pagamentos', tone: 'danger' },
  { value: 'ATENDENTE', label: 'Atendente', desc: 'Pode criar e gerenciar pedidos', tone: 'info' },
  { value: 'OPERADOR_CAIXA', label: 'Op. Caixa', desc: 'Acesso ao módulo de caixa', tone: 'success' },
];

function Modal({ open, onClose, children, title }) {
  if (!open) return null;

  return (
    <div className="usuarios-modal" role="dialog" aria-modal="true">
      <div className="usuarios-modal__backdrop" onClick={onClose} />
      <div className="usuarios-modal__panel">
        <div className="usuarios-modal__header">
          <div>
            <p className="usuarios-modal__eyebrow">Administração</p>
            <h3 className="usuarios-modal__title">{title}</h3>
          </div>
          <button onClick={onClose} className="usuarios-modal__close" type="button" aria-label="Fechar modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="usuarios-modal__body">{children}</div>
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

  useEffect(() => {
    fetch();
  }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: '', email: '', senha: '', perfil: 'ATENDENTE' });
    setModal(true);
  };

  const abrirEditar = (usuario) => {
    setEditando(usuario);
    setForm({ nome: usuario.nome, email: usuario.email, senha: '', perfil: usuario.perfil });
    setModal(true);
  };

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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    }
  };

  const handleToggle = async (usuario) => {
    if (usuario.id === eu.id) return toast.error('Você não pode desativar seu próprio usuário');

    try {
      await api.delete(`/usuarios/${usuario.id}`);
      toast(usuario.ativo ? 'Usuário desativado' : 'Ação não permitida', { icon: '⚠️' });
      fetch();
    } catch {
      toast.error('Erro');
    }
  };

  const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo).length;
  const administradores = usuarios.filter((usuario) => usuario.perfil === 'ADMIN').length;

  return (
    <div className="usuarios-page animate-fade-in">
      <section className="usuarios-page__hero">
        <div>
          <p className="usuarios-page__eyebrow">Controle de acesso</p>
          <h1 className="usuarios-page__title">Usuários, perfis e permissões operacionais</h1>
          <p className="usuarios-page__subtitle">
            Administração visualmente alinhada ao resto do sistema, sem mudar a estrutura da tabela, modal e ações.
          </p>
        </div>

        <button type="button" onClick={abrirNovo} className="usuarios-page__primary-button">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </section>

      <section className="usuarios-page__stats">
        <article className="usuarios-page__stat-card">
          <div className="usuarios-page__stat-icon">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="usuarios-page__stat-label">Usuários cadastrados</p>
            <strong className="usuarios-page__stat-value">{usuarios.length}</strong>
          </div>
        </article>

        <article className="usuarios-page__stat-card">
          <div className="usuarios-page__stat-icon">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="usuarios-page__stat-label">Usuários ativos</p>
            <strong className="usuarios-page__stat-value">{usuariosAtivos}</strong>
          </div>
        </article>

        <article className="usuarios-page__stat-card">
          <div className="usuarios-page__stat-icon">
            <LockKeyhole className="w-5 h-5" />
          </div>
          <div>
            <p className="usuarios-page__stat-label">Administradores</p>
            <strong className="usuarios-page__stat-value">{administradores}</strong>
          </div>
        </article>
      </section>

      <section className="usuarios-page__table-shell">
        <div className="usuarios-page__table-header">
          <div>
            <p className="usuarios-page__table-eyebrow">Painel administrativo</p>
            <h2 className="usuarios-page__table-title">Lista de usuários</h2>
          </div>
        </div>

        <div className="usuarios-page__table-scroll">
          <table className="usuarios-page__table">
            <thead>
              <tr>
                {['Usuário', 'Email', 'Perfil', 'Status', 'Ações'].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const perfil = PERFIS.find((item) => item.value === usuario.perfil);
                return (
                  <tr key={usuario.id}>
                    <td>
                      <div className="usuarios-page__user-cell">
                        <div className="usuarios-page__avatar">
                          <span>{usuario.nome.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <strong>{usuario.nome}</strong>
                          {usuario.id === eu.id && <span className="usuarios-page__self-tag">você</span>}
                        </div>
                      </div>
                    </td>
                    <td className="usuarios-page__muted">{usuario.email}</td>
                    <td>
                      <span className={`usuarios-page__role-badge tone-${perfil?.tone}`}>
                        <Shield className="w-3.5 h-3.5" />
                        {perfil?.label}
                      </span>
                    </td>
                    <td>
                      <span className={`usuarios-page__status ${usuario.ativo ? 'is-active' : 'is-inactive'}`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="usuarios-page__actions">
                        <button type="button" onClick={() => abrirEditar(usuario)} className="usuarios-page__icon-button">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {usuario.id !== eu.id && (
                          <button type="button" onClick={() => handleToggle(usuario)} className="usuarios-page__icon-button">
                            {usuario.ativo ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500" />
                            )}
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
      </section>

      <section className="usuarios-page__profiles">
        {PERFIS.map((perfil) => (
          <article key={perfil.value} className={`usuarios-page__profile-card tone-${perfil.tone}`}>
            <div className="usuarios-page__profile-icon">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3>{perfil.label}</h3>
              <p>{perfil.desc}</p>
            </div>
          </article>
        ))}
      </section>

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Usuário' : 'Novo Usuário'}>
        <div className="usuarios-form">
          <div className="usuarios-form__field">
            <label>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))} />
          </div>

          <div className="usuarios-form__field">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="usuarios-form__field">
            <label>{editando ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
            />
          </div>

          <div className="usuarios-form__profiles">
            <label>Perfil</label>
            <div className="usuarios-form__profiles-list">
              {PERFIS.map((perfil) => (
                <button
                  key={perfil.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, perfil: perfil.value }))}
                  className={`usuarios-form__profile-option ${form.perfil === perfil.value ? 'is-active' : ''}`}
                >
                  <div className={`usuarios-form__profile-badge tone-${perfil.tone}`}>
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong>{perfil.label}</strong>
                    <p>{perfil.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleSalvar} className="usuarios-form__submit">
            {editando ? 'Atualizar Usuário' : 'Criar Usuário'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
