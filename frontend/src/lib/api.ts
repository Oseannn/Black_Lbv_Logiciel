import axios from 'axios';
import Cookies from 'js-cookie';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${BACKEND_URL}/api`;

export { BACKEND_URL };

// Retry helper for network errors and 5xx responses
const MAX_RETRIES = 1;
const RETRY_DELAY = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Interceptor pour ajouter le token
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Translate network errors to user-friendly messages
const getReadableError = (error: any): string => {
  if (!error.response && error.message === 'Network Error') {
    return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Le serveur met trop de temps à répondre. Réessayez dans un instant.';
  }
  return '';
};

// Interceptor pour gérer les erreurs 401 + retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry logic for network errors and 5xx (not on auth requests)
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');
    const retryCount = originalRequest._retryCount || 0;
    const isRetryable = !error.response || (error.response.status >= 500 && error.response.status < 600);

    if (isRetryable && retryCount < MAX_RETRIES && !isAuthRequest) {
      originalRequest._retryCount = retryCount + 1;
      await sleep(RETRY_DELAY);
      return api(originalRequest);
    }

    // Add user-friendly message to network errors
    const readableMessage = getReadableError(error);
    if (readableMessage && !error.response) {
      error.message = readableMessage;
    }

    // Handle 401 with token refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          Cookies.set('accessToken', accessToken, { expires: 1, path: '/' });
          Cookies.set('refreshToken', newRefreshToken, { expires: 7, path: '/' });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          Cookies.remove('accessToken', { path: '/' });
          Cookies.remove('refreshToken', { path: '/' });
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
