import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PDVPage from './pages/PDVPage';
import PainelPedidosPage from './pages/PainelPedidosPage';
import DetalhesPedidoPage from './pages/DetalhesPedidoPage';
import ProdutosPage from './pages/ProdutosPage';
import ClientesPage from './pages/ClientesPage';
import MesasPage from './pages/MesasPage';
import CaixaPage from './pages/CaixaPage';
import RelatoriosPage from './pages/RelatoriosPage';
import UsuariosPage from './pages/UsuariosPage';

function ProtectedRoute({ children, adminOnly }) {
  const { usuario, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Carregando...</p>
      </div>
    </div>
  );
  if (!usuario) return <Navigate to="/login" replace />;
  if (adminOnly && usuario.perfil !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="pdv" element={<PDVPage />} />
        <Route path="pedidos" element={<PainelPedidosPage />} />
        <Route path="pedidos/:id" element={<DetalhesPedidoPage />} />
        <Route path="produtos" element={<ProdutosPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="mesas" element={<MesasPage />} />
        <Route path="caixa" element={<CaixaPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="usuarios" element={<ProtectedRoute adminOnly><UsuariosPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(22, 22, 31, 0.96)',
                color: '#f0eff8',
                border: '1px solid rgba(139, 63, 190, 0.22)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
                borderRadius: '18px',
              },
              success: { iconTheme: { primary: '#23b26d', secondary: '#fff' } },
              error: { iconTheme: { primary: '#e91e8c', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
