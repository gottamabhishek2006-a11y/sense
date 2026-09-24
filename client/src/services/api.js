import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized / Token Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect loop if already on auth endpoints
      const isAuthEndpoint =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/signup') ||
        error.config.url.includes('/auth/check-email');

      if (!isAuthEndpoint) {
        localStorage.removeItem('civicfix_token');
        localStorage.removeItem('civicfix_user');
        window.dispatchEvent(new Event('civicfix:session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  checkEmail: async (email) => {
    const response = await api.post('/auth/check-email', { email });
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue client cleanup regardless of server response
    }
  },

  checkAdmin: async () => {
    const response = await api.get('/auth/admin-check');
    return response.data;
  },
};

export default api;
