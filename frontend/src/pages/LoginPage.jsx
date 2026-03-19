import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Pizza, Eye, EyeOff, LogIn, Sparkles, ShieldCheck, WalletCards, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';

const features = [
  { icon: WalletCards, label: 'Caixa veloz', detail: 'Totais, pagamento e status em destaque' },
  { icon: Clock3, label: 'Operação contínua', detail: 'Fluxo pensado para balcão, mesa e delivery' },
  { icon: ShieldCheck, label: 'Controle seguro', detail: 'Perfis, pedidos e caixa na mesma linguagem' },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(245,200,0,0.12),transparent_22%),radial-gradient(circle_at_78%_12%,rgba(139,63,190,0.18),transparent_24%),linear-gradient(180deg,#09090c_0%,#0d0d12_55%,#14141d_100%)] px-5 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1500px] overflow-hidden rounded-[30px] border border-purple-500/18 bg-[#0f0f15]/94 shadow-[0_30px_80px_rgba(0,0,0,0.42)] lg:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)]">
        <section className="relative hidden overflow-hidden border-r border-purple-500/14 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,200,0,0.16),transparent_22%),radial-gradient(circle_at_78%_24%,rgba(139,63,190,0.24),transparent_28%),linear-gradient(145deg,rgba(22,22,31,0.95),rgba(13,13,18,0.88))]" />
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'linear-gradient(rgba(139,63,190,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,63,190,0.08) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }} />

          <div className="relative px-10 py-10 xl:px-14 xl:py-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              Tem na Área
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#f5c800,#ff7a00)] shadow-[0_18px_45px_rgba(245,200,0,0.16)]">
              <Pizza className="h-10 w-10 text-[#241d00]" />
            </div>

            <h1 className="mt-8 max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-white">
              O caixa da pizzaria com a mesma atmosfera urbana do Tem na Área.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-300">
              Visual noturno, pulsação comercial e operação rápida para pedido, atendimento e pagamento acontecerem sem ruído.
            </p>
          </div>

          <div className="relative grid gap-4 px-10 pb-10 xl:grid-cols-3 xl:px-14 xl:pb-12">
            {features.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-[24px] border border-purple-500/14 bg-white/[0.04] p-5 backdrop-blur">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(245,200,0,0.16),rgba(139,63,190,0.22))]">
                  <Icon className="h-5 w-5 text-orange-300" />
                </div>
                <p className="font-bold text-white">{label}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#f5c800,#ff7a00)]">
                <Pizza className="h-6 w-6 text-[#241d00]" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-300">Tem na Área</p>
                <p className="text-lg font-black text-white">PDV Pizzaria</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-purple-500/16 bg-[linear-gradient(180deg,rgba(22,22,31,0.92),rgba(16,16,24,0.94))] p-6 shadow-[0_26px_60px_rgba(0,0,0,0.38)] sm:p-7">
              <div className="mb-7">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-500">Acesso operacional</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Entrar no sistema</h2>
                <p className="mt-2 text-sm leading-6 text-gray-400">Use suas credenciais para acessar o caixa, pedidos, relatórios e rotinas administrativas.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-300">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="w-full rounded-[18px] border border-purple-500/16 bg-[#1b1b28] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-orange-400 focus:bg-[#212132] focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-300">Senha</label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-[18px] border border-purple-500/16 bg-[#1b1b28] px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-500 focus:border-orange-400 focus:bg-[#212132] focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-300"
                    >
                      {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#f5c800] px-4 py-3.5 font-black text-[#241d00] shadow-[0_16px_34px_rgba(245,200,0,0.2)] hover:bg-[#ffd84b] disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-[#241d00] border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-[22px] border border-purple-500/14 bg-white/[0.03] p-4 text-sm text-gray-400">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-orange-300">Acessos padrão</p>
                <p><strong className="text-white">Admin:</strong> admin@pizzaria.com / admin123</p>
                <p><strong className="text-white">Atendente:</strong> atendente@pizzaria.com / atend123</p>
                <p><strong className="text-white">Caixa:</strong> caixa@pizzaria.com / caixa123</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
