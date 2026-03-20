import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Pizza, Eye, EyeOff, LogIn, ShieldCheck, WalletCards, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';
import './LoginPage.css';

const features = [
  { icon: WalletCards, line1: 'Caixa', line2: 'veloz' },
  { icon: Clock3, line1: 'Operacao', line2: 'continua' },
  { icon: ShieldCheck, line1: 'Controle', line2: 'seguro' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@pizzaria.com');
  const [senha, setSenha] = useState('admin123');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Bem-vindo!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__overlay" />
      <div className="login-page__container">
        <div className="login-page__grid">
          <section className="login-page__hero">
            <div className="login-page__brand-icon">
              <Pizza className="login-page__brand-icon-svg" strokeWidth={2.15} />
            </div>

            <h1 className="login-page__title">
              O caixa da pizzaria
              <br />
              com a mesma
              <br />
              atmosfera urbana
              <br />
              do Tem na Area.
            </h1>

            <p className="login-page__subtitle">
              Visual noturno, pulsacao comercial e operacao
              <br className="login-page__line-break" />
              rapida para pedido, atendimento e pagamento
              <br className="login-page__line-break" />
              acontecerem sem ruido.
            </p>

            <div className="login-page__features">
              {features.map(({ icon: Icon, line1, line2 }) => (
                <div key={line1} className="login-page__feature-card">
                  <div className="login-page__feature-icon">
                    <Icon className="login-page__feature-icon-svg" strokeWidth={2.1} />
                  </div>
                  <p className="login-page__feature-text">
                    {line1}
                    <br />
                    {line2}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="login-page__panel-wrap">
            <div className="login-page__panel">
              <div className="login-page__heading">
                <p className="login-page__eyebrow">ACESSO OPERACIONAL</p>
                <h2 className="login-page__panel-title">Entrar no sistema</h2>
              </div>

              <form onSubmit={handleSubmit} className="login-page__form">
                <div className="login-page__field">
                  <label className="login-page__label">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-page__input"
                  />
                </div>

                <div className="login-page__field">
                  <label className="login-page__label">Senha</label>
                  <div className="login-page__password-wrap">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      className="login-page__input login-page__input--password"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="login-page__password-toggle"
                    >
                      {mostrarSenha ? <EyeOff className="login-page__password-icon" /> : <Eye className="login-page__password-icon" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="login-page__submit">
                  {loading ? (
                    <div className="login-page__spinner" />
                  ) : (
                    <>
                      <LogIn className="login-page__submit-icon" />
                      Entrar
                    </>
                  )}
                </button>
              </form>

              <div className="login-page__access">
                <p className="login-page__access-title">ACESSOS PADRAO:</p>
                <p><strong>Admin:</strong> admin@pizzaria.com / admin123</p>
                <p><strong>Atendente:</strong> atendente@pizzaria.com / atend123</p>
                <p><strong>Caixa:</strong> caixa@pizzaria.com / caixa123</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
