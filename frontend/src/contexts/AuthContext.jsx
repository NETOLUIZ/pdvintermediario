import { createContext, useContext, useState, useEffect } from 'react';
import { pdvAuthApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('pdv_usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pdv_token');
    const savedUser = localStorage.getItem('pdv_usuario');

    if (!token || !savedUser) {
      setLoading(false);
      return;
    }

    try {
      setUsuario(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem('pdv_token');
      localStorage.removeItem('pdv_usuario');
      localStorage.removeItem('pdv_store');
      localStorage.removeItem('pdv_auth_raw');
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (loginValue, senha) => {
    const authData = await pdvAuthApi.login(loginValue, senha);
    const usuarioNormalizado = {
      ...authData.user,
      perfil: authData.user?.perfil || 'MERCHANT',
      store: authData.store || null,
    };

    localStorage.setItem('pdv_token', authData.token);
    localStorage.setItem('pdv_usuario', JSON.stringify(usuarioNormalizado));
    localStorage.setItem('pdv_store', JSON.stringify(authData.store || null));
    localStorage.setItem('pdv_auth_raw', JSON.stringify(authData));
    setUsuario(usuarioNormalizado);
    return usuarioNormalizado;
  };

  const logout = () => {
    localStorage.removeItem('pdv_token');
    localStorage.removeItem('pdv_usuario');
    localStorage.removeItem('pdv_store');
    localStorage.removeItem('pdv_auth_raw');
    setUsuario(null);
  };

  const isAdmin = () => usuario?.perfil === 'ADMIN';
  const isAtendente = () => ['ADMIN', 'ATENDENTE', 'MERCHANT'].includes(usuario?.perfil);
  const isCaixa = () => ['ADMIN', 'OPERADOR_CAIXA', 'MERCHANT'].includes(usuario?.perfil);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading, isAdmin, isAtendente, isCaixa }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
