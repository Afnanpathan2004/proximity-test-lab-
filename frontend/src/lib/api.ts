import axios from 'axios';
import { getRefreshToken, setToken } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let pending: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (isRefreshing) {
          const token = await new Promise<string>((resolve) => pending.push(resolve));
          original.headers = original.headers || {};
          original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        }
        isRefreshing = true;
        const rt = getRefreshToken();
        if (!rt) throw error;
        const { data } = await axios.post((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000') + '/api/auth/refresh', { refresh_token: rt });
        setToken(data.access_token);
        pending.forEach((fn) => fn(data.access_token));
        pending = [];
        isRefreshing = false;
        original.headers = original.headers || {};
        original.headers['Authorization'] = `Bearer ${data.access_token}`;
        return api(original);
      } catch (e) {
        isRefreshing = false;
        pending = [];
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
