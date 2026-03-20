import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Phone, MapPin, Pencil, Trash2, X, Users, MapPinned, Contact } from 'lucide-react';
import './ClientesPage.css';

function Modal({ open, onClose, children, title }) {
  if (!open) return null;

  return (
    <div className="clientes-modal" role="dialog" aria-modal="true">
      <div className="clientes-modal__backdrop" onClick={onClose} />
      <div className="clientes-modal__panel">
        <div className="clientes-modal__header">
          <div>
            <p className="clientes-modal__eyebrow">Cadastro</p>
            <h3 className="clientes-modal__title">{title}</h3>
          </div>
          <button onClick={onClose} className="clientes-modal__close" type="button" aria-label="Fechar modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="clientes-modal__body">{children}</div>
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

  useEffect(() => {
    fetchClientes();
  }, [busca]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(EMPTY);
    setModal(true);
  };

  const abrirEditar = (cliente) => {
    setEditando(cliente);
    setForm(cliente);
    setModal(true);
  };

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
    } catch {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este cliente?')) return;

    try {
      await api.delete(`/clientes/${id}`);
      toast.success('Cliente excluído');
      fetchClientes();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const campo = (key, label, type = 'text', placeholder = '') => (
    <div className="clientes-form__field">
      <label>{label}</label>
      <input
        type={type}
        value={form[key] || ''}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  const clientesComTelefone = clientes.filter((cliente) => cliente.telefone).length;
  const clientesComEndereco = clientes.filter((cliente) => cliente.endereco || cliente.bairro).length;

  return (
    <div className="clientes-page animate-fade-in">
      <section className="clientes-page__hero">
        <div>
          <p className="clientes-page__eyebrow">Relacionamento operacional</p>
          <h1 className="clientes-page__title">Base de clientes e endereços de atendimento</h1>
          <p className="clientes-page__subtitle">
            Visual mais forte para consulta rápida de cadastro, telefone e localização, sem mudar o fluxo atual da tela.
          </p>
        </div>

        <button type="button" onClick={abrirNovo} className="clientes-page__primary-button">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </section>

      <section className="clientes-page__stats">
        <article className="clientes-page__stat-card">
          <div className="clientes-page__stat-icon">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="clientes-page__stat-label">Clientes cadastrados</p>
            <strong className="clientes-page__stat-value">{clientes.length}</strong>
          </div>
        </article>

        <article className="clientes-page__stat-card">
          <div className="clientes-page__stat-icon">
            <Contact className="w-5 h-5" />
          </div>
          <div>
            <p className="clientes-page__stat-label">Com telefone</p>
            <strong className="clientes-page__stat-value">{clientesComTelefone}</strong>
          </div>
        </article>

        <article className="clientes-page__stat-card">
          <div className="clientes-page__stat-icon">
            <MapPinned className="w-5 h-5" />
          </div>
          <div>
            <p className="clientes-page__stat-label">Com endereço</p>
            <strong className="clientes-page__stat-value">{clientesComEndereco}</strong>
          </div>
        </article>
      </section>

      <section className="clientes-page__search-shell">
        <div className="clientes-page__search">
          <Search className="w-5 h-5" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
          />
        </div>
      </section>

      {clientes.length > 0 ? (
        <section className="clientes-page__grid">
          {clientes.map((cliente) => (
            <article key={cliente.id} className="clientes-page__card">
              <div className="clientes-page__card-top">
                <div className="clientes-page__avatar">
                  <span>{cliente.nome.charAt(0).toUpperCase()}</span>
                </div>

                <div className="clientes-page__actions">
                  <button type="button" onClick={() => abrirEditar(cliente)} className="clientes-page__icon-button">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletar(cliente.id)}
                    className="clientes-page__icon-button is-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="clientes-page__card-content">
                <div>
                  <h2 className="clientes-page__card-title">{cliente.nome}</h2>

                  {cliente.telefone && (
                    <p className="clientes-page__line">
                      <Phone className="w-4 h-4" />
                      {cliente.telefone}
                    </p>
                  )}

                  {cliente.bairro && (
                    <p className="clientes-page__line">
                      <MapPin className="w-4 h-4" />
                      {[cliente.endereco, cliente.numero, cliente.bairro].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {cliente.referencia && (
                  <p className="clientes-page__reference">Ref: {cliente.referencia}</p>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="clientes-page__empty">
          <div className="clientes-page__empty-icon">
            <Users className="w-10 h-10" />
          </div>
          <h2>Nenhum cliente encontrado</h2>
          <p>Cadastre o primeiro cliente para começar a organizar o atendimento.</p>
          <button type="button" onClick={abrirNovo}>
            Cadastrar primeiro cliente
          </button>
        </section>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Cliente' : 'Novo Cliente'}>
        <div className="clientes-form">
          {campo('nome', 'Nome *')}
          {campo('telefone', 'Telefone', 'tel')}

          <div className="clientes-form__grid">
            <div className="clientes-form__span-2">{campo('endereco', 'Endereço')}</div>
            {campo('numero', 'Número')}
          </div>

          {campo('bairro', 'Bairro')}
          {campo('complemento', 'Complemento')}
          {campo('referencia', 'Ponto de referência')}

          <button type="button" onClick={handleSalvar} className="clientes-form__submit">
            {editando ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
