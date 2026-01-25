import axios from 'axios';
import Cookies from 'js-cookie';

// Force the production URL or fallback to localhost
const BACKEND_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000')
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000');

const API_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || `${BACKEND_URL}/api`)
  : (process.env.NEXT_PUBLIC_API_URL || `${BACKEND_URL}/api`);

console.log('🔧 API Configuration:', { BACKEND_URL, API_URL });

export { BACKEND_URL };

const api = axios.create({
  baseURL: API_URL,
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

// Interceptor pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ne pas essayer de rafraîchir si on est déjà sur les routes d'auth
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');

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
