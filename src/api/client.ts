import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const client = axios.create({ baseURL: BASE_URL });

// ─── Token helpers ────────────────────────────────────────────────────────────

export const getAccessToken  = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const storeTokens = (access: string, refresh: string) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// ─── Request interceptor — attach token ───────────────────────────────────────

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — refresh on 401 ───────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const drainQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Public auth endpoints return 401 for bad credentials — don't try to refresh
    const url = (originalRequest.url ?? '');
    if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google')) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
        return client(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefresh } = res.data.data;
      storeTokens(accessToken, newRefresh);
      drainQueue(null, accessToken);
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${accessToken}` };
      return client(originalRequest);
    } catch (refreshError) {
      drainQueue(refreshError);
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
