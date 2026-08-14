import axios from 'axios';

// Dynamically resolve API Base URL:
// In production or local, relative '/api' points to window.location.origin + '/api'
// If VITE_API_BASE_URL is explicitly set, it overrides the default.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stylewalk_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
