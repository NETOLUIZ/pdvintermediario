import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_PDV_API_URL || 'http://127.0.0.1:3001/api/v1',
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
  async login(login, senha) {
    const response = await api.post('/pdv/auth/login', { login, senha });
    return response.data?.data ?? response.data;
  },
};

export const pdvCoreApi = {
  async bootstrap() {
    const response = await api.get('/pdv/bootstrap');
    return response.data?.data ?? response.data;
  },

  async products() {
    const response = await api.get('/pdv/products');
    return response.data?.data?.products ?? [];
  },

  async customers(search = '') {
    const response = await api.get('/pdv/customers', { params: { search } });
    return response.data?.data?.customers ?? [];
  },

  async createCustomer(payload) {
    const response = await api.post('/pdv/customers', payload);
    return response.data?.data?.customer ?? null;
  },

  async orders(status = null) {
    const response = await api.get('/pdv/orders', { params: { status } });
    return response.data?.data?.orders ?? [];
  },

  async orderById(id) {
    const response = await api.get(`/pdv/orders/${id}`);
    return response.data?.data?.order ?? null;
  },

  async createOrder(payload) {
    const response = await api.post('/pdv/orders', payload);
    return response.data?.data?.order ?? null;
  },

  async updateOrderStatus(id, status) {
    const response = await api.patch(`/pdv/orders/${id}/status`, { status });
    return response.data?.data?.order ?? null;
  },
};

export default api;
