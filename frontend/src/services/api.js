import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_PDV_API_URL || 'http://127.0.0.1:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pdv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pdv_token');
      localStorage.removeItem('pdv_usuario');
      localStorage.removeItem('pdv_store');
      localStorage.removeItem('pdv_auth_raw');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const pdvAuthApi = {
  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    const data = response.data?.data ?? response.data;

    return {
      token: data.token,
      user: data.usuario,
      store: data.store ?? null,
      raw: data,
    };
  },

  async me() {
    const response = await api.get('/auth/me');
    return response.data?.usuario ?? response.data?.data?.usuario ?? null;
  },
};

export const pdvCoreApi = {
  async bootstrap() {
    const [categorias, mesas] = await Promise.all([
      api.get('/categorias'),
      api.get('/mesas'),
    ]);

    return {
      categories: categorias.data ?? [],
      tables: mesas.data ?? [],
    };
  },

  async products() {
    const response = await api.get('/produtos');
    return response.data ?? [];
  },

  async customers(search = '') {
    const response = await api.get('/clientes', { params: search ? { busca: search } : {} });
    return response.data ?? [];
  },

  async createCustomer(payload) {
    const response = await api.post('/clientes', payload);
    return response.data ?? null;
  },

  async orders(status = null) {
    const response = await api.get('/pedidos', {
      params: status ? { status_pedido: status } : {},
    });
    return response.data?.pedidos ?? [];
  },

  async orderById(id) {
    const response = await api.get(`/pedidos/${id}`);
    return response.data ?? null;
  },

  async createOrder(payload) {
    const response = await api.post('/pedidos', payload);
    return response.data ?? null;
  },

  async updateOrderStatus(id, status) {
    const response = await api.put(`/pedidos/${id}/status`, { status });
    return response.data ?? null;
  },
};

export default api;
