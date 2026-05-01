import axios from 'axios';

const TOKEN_STORAGE_KEY = 'fac.auth.token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function normalizeApiError(error) {
  if (!error?.response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: '無法連線到伺服器，請確認網路或稍後再試。',
      details: null,
      raw: error,
    };
  }

  const responseError = error.response.data?.error || {};
  return {
    status: error.response.status,
    code: responseError.code || 'API_ERROR',
    message: responseError.message || '系統發生錯誤，請稍後再試。',
    details: responseError.details || null,
    raw: error,
  };
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error))
);

export default apiClient;
