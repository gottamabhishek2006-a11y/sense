import axios from 'axios';

const getApiBaseUrl = () => {
  // Explicitly configured environment variable
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '') {
    return import.meta.env.VITE_API_URL.trim();
  }

  // Dynamic detection in browser environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local');

    if (!isLocal) {
      // Deployed cloud production backend
      return 'https://sense-3n8z.onrender.com/api';
    }
  }

  // Default for local development
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 20000,
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
        error.config.url.includes('/auth/check-email') ||
        error.config.url.includes('/auth/admin/login');

      if (!isAuthEndpoint) {
        localStorage.removeItem('civicfix_token');
        localStorage.removeItem('civicfix_user');
        window.dispatchEvent(new Event('civicfix:session_expired'));
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────
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

  /**
   * Dedicated admin login — hits /api/auth/admin/login.
   * Used ONLY by the hidden admin login page.
   * Never called from the public citizen login flow.
   */
  adminLogin: async (credentials) => {
    const response = await api.post('/auth/admin/login', credentials);
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

  /**
   * Verify server-side admin status.
   * Backend returns 403 for citizens, 401 for unauthenticated, 200 for admin.
   */
  checkAdmin: async () => {
    const response = await api.get('/auth/admin-check');
    return response.data;
  },
};

// ─────────────────────────────────────────────────────
// ISSUES API
// ─────────────────────────────────────────────────────
export const issuesAPI = {
  /**
   * Submit a new civic issue report.
   * Image (if any) must be a base64 data URL, validated server-side.
   */
  createIssue: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },

  /**
   * Get all issues for admin review (includes imageUrl).
   * Requires admin JWT — returns 403 for citizens.
   */
  getAllIssues: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.withPhoto) params.append('withPhoto', 'true');

    const response = await api.get(`/issues/admin?${params.toString()}`);
    return response.data;
  },

  /**
   * Update issue status (admin only).
   */
  updateIssueStatus: async (ticketId, status) => {
    const response = await api.patch(`/issues/admin/${ticketId}/status`, { status });
    return response.data;
  },

  /**
   * Get recent public issues (no auth required, no images).
   */
  getPublicIssues: async () => {
    const response = await api.get('/issues/public');
    return response.data;
  },
};

export default api;
