import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus,
  X,
  Package,
  ToggleLeft,
  ToggleRight,
  Layers3,
  Search,
  Sparkles,
} from 'lucide-react';
import './ProdutosPage.css';

const TIPOS = ['PIZZA', 'BEBIDA', 'SOBREMESA', 'COMBO', 'ADICIONAL', 'BORDA'];
const TIPO_EMOJI = {
  PIZZA: '🍕',
  BEBIDA: '🥤',
  SOBREMESA: '🍰',
  COMBO: '📦',
  ADICIONAL: '➕',
  BORDA: '🔄',
};

function Modal({ open, onClose, children, title }) {
  if (!open) return null;

  return (
    <div className="produtos-modal" role="dialog" aria-modal="true">
      <div className="produtos-modal__backdrop" onClick={onClose} />
      <div className="produtos-modal__panel">
        <div className="produtos-modal__header">
          <div>
            <p className="produtos-modal__eyebrow">Cadastro</p>
            <h3 className="produtos-modal__title">{title}</h3>
          </div>
          <button onClick={onClose} className="produtos-modal__close" type="button" aria-label="Fechar modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="produtos-modal__body">{children}</div>
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
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    tipo: 'PIZZA',
    categoria_id: '',
    tamanhos: [{ tamanho: 'M', preco: '' }],
  });

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      api.get(`/produtos${catFiltro ? `?categoria_id=${catFiltro}` : ''}`),
      api.get('/categorias'),
    ]);
    setProdutos(p.data);
    setCategorias(c.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [catFiltro]);

  const handleSalvar = async () => {
    if (!form.nome || !form.tipo || !form.categoria_id) {
      return toast.error('Preencha todos os campos obrigatórios');
    }

    try {
      await api.post('/produtos', {
        ...form,
        tamanhos: form.tamanhos.filter((t) => t.preco),
      });
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
    } catch {
      toast.error('Erro ao atualizar produto');
    }
  };

  const tamSizes = ['Broto', 'P', 'M', 'G', 'GG', 'Família', 'Único'];
  const ativos = produtos.filter((produto) => produto.ativo).length;

  return (
    <div className="produtos-page animate-fade-in">
      <section className="produtos-page__hero">
        <div>
          <p className="produtos-page__eyebrow">Catálogo operacional</p>
          <h1 className="produtos-page__title">Produtos e categorias do cardápio</h1>
          <p className="produtos-page__subtitle">
            Gerencie itens vendidos no balcão, mesa e delivery com a mesma linguagem visual do restante do sistema.
          </p>
        </div>

        {isAdmin() && (
          <button
            type="button"
            onClick={() => {
              setForm({
                nome: '',
                descricao: '',
                tipo: 'PIZZA',
                categoria_id: '',
                tamanhos: [{ tamanho: 'M', preco: '' }],
              });
              setModal(true);
            }}
            className="produtos-page__primary-button"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        )}
      </section>

      <section className="produtos-page__stats">
        <article className="produtos-page__stat-card">
          <div className="produtos-page__stat-icon">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="produtos-page__stat-label">Total de produtos</p>
            <strong className="produtos-page__stat-value">{produtos.length}</strong>
          </div>
        </article>

        <article className="produtos-page__stat-card">
          <div className="produtos-page__stat-icon">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="produtos-page__stat-label">Produtos ativos</p>
            <strong className="produtos-page__stat-value">{ativos}</strong>
          </div>
        </article>

        <article className="produtos-page__stat-card">
          <div className="produtos-page__stat-icon">
            <Layers3 className="w-5 h-5" />
          </div>
          <div>
            <p className="produtos-page__stat-label">Categorias</p>
            <strong className="produtos-page__stat-value">{categorias.length}</strong>
          </div>
        </article>
      </section>

      <section className="produtos-page__filters">
        <div className="produtos-page__search">
          <Search className="w-5 h-5" />
          <span>Filtre por categoria para focar no cardápio ativo</span>
        </div>

        <div className="produtos-page__chips">
          <button
            type="button"
            onClick={() => setCatFiltro('')}
            className={`produtos-page__chip ${!catFiltro ? 'is-active' : ''}`}
          >
            Todos
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => setCatFiltro(categoria.id)}
              className={`produtos-page__chip ${catFiltro === categoria.id ? 'is-active' : ''}`}
            >
              <span>{TIPO_EMOJI[categoria.tipo]}</span>
              {categoria.nome}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="produtos-page__loading">
          <div className="produtos-page__spinner" />
        </div>
      ) : (
        <section className="produtos-page__grid">
          {produtos.map((produto) => (
            <article
              key={produto.id}
              className={`produtos-page__card ${!produto.ativo ? 'is-inactive' : ''}`}
            >
              <div className="produtos-page__card-top">
                <div className="produtos-page__card-badge">{TIPO_EMOJI[produto.tipo]}</div>
                {isAdmin() && (
                  <button
                    type="button"
                    onClick={() => handleToggle(produto.id, produto.ativo)}
                    className="produtos-page__toggle"
                    aria-label={produto.ativo ? 'Desativar produto' : 'Ativar produto'}
                  >
                    {produto.ativo ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-500" />
                    )}
                  </button>
                )}
              </div>

              <div className="produtos-page__card-content">
                <div>
                  <h2 className="produtos-page__card-title">{produto.nome}</h2>
                  {produto.descricao && (
                    <p className="produtos-page__card-description">{produto.descricao}</p>
                  )}
                </div>

                <div className="produtos-page__prices">
                  {produto.tamanhos?.slice(0, 3).map((tamanho) => (
                    <div key={tamanho.id} className="produtos-page__price-row">
                      <span>{tamanho.tamanho}</span>
                      <strong>R$ {parseFloat(tamanho.preco).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div className="produtos-page__footer">
                  <span className="produtos-page__category">{produto.categoria?.nome}</span>
                  <span className={`produtos-page__status ${produto.ativo ? 'is-active' : 'is-inactive'}`}>
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Novo Produto">
        <div className="produtos-form">
          <div className="produtos-form__grid">
            <div className="produtos-form__field">
              <label>Nome *</label>
              <input
                value={form.nome}
                onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
              />
            </div>

            <div className="produtos-form__field">
              <label>Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="produtos-form__field">
            <label>Categoria *</label>
            <select
              value={form.categoria_id}
              onChange={(e) => setForm((prev) => ({ ...prev, categoria_id: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="produtos-form__field">
            <label>Descrição</label>
            <textarea
              value={form.descricao}
              rows={2}
              onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
            />
          </div>

          <div className="produtos-form__sizes">
            <div className="produtos-form__sizes-header">
              <label>Tamanhos e preços</label>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    tamanhos: [...prev.tamanhos, { tamanho: 'M', preco: '' }],
                  }))
                }
              >
                <Plus className="w-3 h-3" />
                adicionar
              </button>
            </div>

            {form.tamanhos.map((tamanho, index) => (
              <div key={`${tamanho.tamanho}-${index}`} className="produtos-form__size-row">
                <select
                  value={tamanho.tamanho}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tamanhos: prev.tamanhos.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, tamanho: e.target.value } : item,
                      ),
                    }))
                  }
                >
                  {tamSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Preço"
                  value={tamanho.preco}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      tamanhos: prev.tamanhos.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, preco: e.target.value } : item,
                      ),
                    }))
                  }
                />

                {form.tamanhos.length > 1 && (
                  <button
                    type="button"
                    className="produtos-form__remove"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        tamanhos: prev.tamanhos.filter((_, itemIndex) => itemIndex !== index),
                      }))
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={handleSalvar} className="produtos-form__submit">
            Salvar Produto
          </button>
        </div>
      </Modal>
    </div>
  );
}
