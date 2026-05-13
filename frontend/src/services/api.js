import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://login-flow.octopustrack.shop/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:8000/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_cms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Budget endpoints
export const budgetService = {
  // Get all budgets
  getAll: async (params = {}) => {
    const response = await api.get('/budgets/', { params });
    return response.data;
  },

  // Get single budget
  getById: async (id) => {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  // Create budget
  create: async (budgetData) => {
    const response = await api.post('/budgets/', budgetData);
    return response.data;
  },

  // Update budget
  update: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  // Delete budget
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },

  // Generate PDF
  generatePDF: async (id) => {
    const response = await api.get(`/budgets/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Budget Items endpoints
export const budgetItemService = {
  // Get items for a budget
  getItems: async (budgetId) => {
    const response = await api.get(`/budget-items/${budgetId}/items`);
    return response.data;
  },

  // Add item to budget
  addItem: async (budgetId, itemData) => {
    const response = await api.post(`/budget-items/${budgetId}/items`, itemData);
    return response.data;
  },

  // Delete item
  deleteItem: async (itemId) => {
    const response = await api.delete(`/budget-items/items/${itemId}`);
    return response.data;
  },
};

// Clients endpoints
export const clientService = {
  // Get all clients
  getAll: async (params = {}) => {
    const response = await api.get('/clients/', { params });
    return response.data;
  },

  // Create client
  create: async (clientData) => {
    const response = await api.post('/clients/', clientData);
    return response.data;
  },

  // Update client
  update: async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Delete client
  delete: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};

// Company endpoints
export const companyService = {
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteLogo: async () => {
    const response = await api.delete('/company/logo');
    return response.data;
  },

  getLogo: async () => {
    const response = await api.get('/company/logo', {
      responseType: 'blob',
      headers: {
        Accept: 'image/*',
      },
    });
    return response.data;
  },

  // Company settings (branding)
  getSettings: async () => {
    const response = await api.get('/company/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.patch('/company/settings', settings);
    return response.data;
  },
};

// Auth endpoints
export const authService = {
  // Login with email/password
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  // Login with Google (Swap token)
  googleLogin: async (googleToken) => {
    const response = await api.post('/auth/google', { token: googleToken });
    return response.data;
  },

  setPassword: async (password, token) => {
    const response = await api.post(
      '/auth/set-password',
      { password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get current user info
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const adminAuthService = {
  googleLogin: async (googleToken) => {
    const response = await adminApi.post('/auth/google', { token: googleToken });
    return response.data;
  },
};

export const adminUsersService = {
  list: async () => (await adminApi.get('/users')).data,
  create: async (payload) => (await adminApi.post('/users', payload)).data,
  update: async (id, payload) => (await adminApi.put(`/users/${id}`, payload)).data,
  setStatus: async (id, is_active) => (await adminApi.patch(`/users/${id}/status`, { is_active })).data,
  resetMembership: async (id) => (await adminApi.post(`/users/${id}/reset-membership`)).data,
  remove: async (id) => (await adminApi.delete(`/users/${id}`)).data,
};

export default api;
