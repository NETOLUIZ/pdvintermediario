import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Package,
  Users, Wallet, BarChart3, LogOut, Pizza, Shield, Table2, Sparkles
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/pdv', icon: ShoppingCart, label: 'PDV / Caixa' },
  { to: '/pedidos', icon: ClipboardList, label: 'Pedidos' },
  { to: '/mesas', icon: Table2, label: 'Mesas' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/caixa', icon: Wallet, label: 'Caixa' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
];

const adminItems = [
  { to: '/usuarios', icon: Shield, label: 'Usuários' },
];

const pageTitles = {
  '/': 'Visão operacional do dia',
  '/pdv': 'Operação rápida de caixa',
  '/pedidos': 'Fila ativa de atendimento',
  '/mesas': 'Mapa de mesas e giro',
  '/produtos': 'Catálogo e precificação',
  '/clientes': 'Cadastro e recorrência',
  '/caixa': 'Movimentação e conferência',
  '/relatorios': 'Leitura comercial e performance',
  '/usuarios': 'Permissões e acessos',
};

export default function Layout() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = pageTitles[location.pathname] || 'Painel operacional';
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-[18px] border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'border-orange-400/35 bg-[linear-gradient(135deg,rgba(245,200,0,0.18),rgba(139,63,190,0.16))] text-white shadow-[0_14px_32px_rgba(245,200,0,0.12)]'
        : 'border-transparent text-gray-400 hover:border-purple-500/20 hover:bg-white/[0.04] hover:text-white'
    }`;

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-gray-950">
      <aside className="relative z-10 hidden w-[290px] flex-shrink-0 border-r border-purple-500/15 bg-[linear-gradient(180deg,rgba(15,15,22,0.96),rgba(22,22,31,0.92))] xl:flex xl:flex-col">
        <div className="border-b border-purple-500/15 px-6 py-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-orange-300">
            <Sparkles className="h-3.5 w-3.5" />
            Tem na Área
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#f5c800,#ff7a00)] shadow-[0_18px_35px_rgba(245,200,0,0.18)]">
              <Pizza className="h-7 w-7 text-[#221b00]" />
            </div>
            <div>
              <p className="text-lg font-black tracking-wide text-white">PDV Pizzaria</p>
              <p className="text-sm text-gray-400">Operação de caixa com linguagem Tem na Área</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <div className="space-y-2">
            {navItems.map(({ to, icon: Icon, label, exact }) => (
              <NavLink key={to} to={to} end={exact} className={linkClass}>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-300 transition-all group-hover:bg-white/[0.08] group-hover:text-orange-300">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {isAdmin() && (
            <div className="space-y-2">
              <p className="px-3 text-[11px] font-black uppercase tracking-[0.24em] text-gray-500">Admin</p>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-300">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-purple-500/15 px-4 py-4">
          <div className="mb-3 rounded-[22px] border border-purple-500/15 bg-white/[0.035] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(245,200,0,0.2),rgba(139,63,190,0.26))]">
                <span className="text-sm font-black text-orange-300">
                  {usuario?.nome?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{usuario?.nome}</p>
                <p className="truncate text-xs text-gray-400">
                  {{ ADMIN: 'Administrador', ATENDENTE: 'Atendente', OPERADOR_CAIXA: 'Operador de Caixa' }[usuario?.perfil]}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[18px] border border-pink-500/18 bg-pink-500/8 px-4 py-3 text-sm font-semibold text-pink-300 hover:bg-pink-500/14 hover:text-pink-200"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="border-b border-purple-500/15 bg-[linear-gradient(180deg,rgba(13,13,18,0.9),rgba(13,13,18,0.72))] px-5 py-4 backdrop-blur xl:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 xl:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#f5c800,#ff7a00)]">
                <Pizza className="h-5 w-5 text-[#221b00]" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-300">Tem na Área</p>
                <p className="text-base font-bold text-white">PDV Pizzaria</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-gray-500">Operação</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white">{pageTitle}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-[18px] border border-purple-500/15 bg-white/[0.035] px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">Hoje</p>
                <p className="text-sm font-semibold capitalize text-white">{today}</p>
              </div>
              <div className="rounded-[18px] border border-orange-400/16 bg-orange-500/10 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-300">Status</p>
                <p className="text-sm font-semibold text-white">Loja online e pronta para vender</p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
