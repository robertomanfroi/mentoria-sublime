import axios from 'axios'
import { getToken, removeToken } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: adiciona Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: 401 redireciona para /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// User/mentoradas endpoints
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/profile/photo', formData),
}

// Checklist endpoints
export const checklistApi = {
  getItems: () => api.get('/checklist'),
  toggleItem: (itemId) => api.post(`/checklist/${itemId}/toggle`),
  getProgress: () => api.get('/checklist/progress'),
  // Admin
  createItem: (data) => api.post('/admin/checklist', data),
  updateItem: (id, data) => api.put(`/admin/checklist/${id}`, data),
  deleteItem: (id) => api.delete(`/admin/checklist/${id}`),
}

// Monthly data endpoints
export const monthlyApi = {
  getData: (month) => api.get(`/monthly/${month}`),
  submit: (month, data) => api.post(`/monthly/${month}`, data),
  uploadProof: (month, formData) =>
    api.post(`/monthly/${month}/proof`, formData),
  getHistory: () => api.get('/monthly'),
}

// Ranking endpoints
export const rankingApi = {
  getRanking: (month) => api.get('/ranking', { params: { month } }),
  getMyPosition: (month) => api.get('/ranking/my-position', { params: { month } }),
}

// Prizes endpoints
export const prizesApi = {
  getPrizes: () => api.get('/prizes'),
  updatePrize: (id, data) => api.put(`/admin/prizes/${id}`, data),
}

// Admin endpoints
export const adminApi = {
  getMentoradas: () => api.get('/admin/users'),
  getPendingValidations: () => api.get('/admin/validations'),
  validateSubmission: (id, approved) =>
    api.put(`/admin/validations/${id}`, { approved }),
  calculateRanking: (month) =>
    api.post('/admin/ranking/calculate', { month }),
  exportRanking: (month) =>
    api.get('/admin/export/ranking', {
      params: { month },
      responseType: 'blob',
    }),
}

export default api
