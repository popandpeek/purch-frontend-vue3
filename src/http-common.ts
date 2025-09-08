import axios from "axios";
import { useAuthStore } from '@/stores/auth';

const instance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:8085',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Firebase ID token
instance.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      try {
        const token = await authStore.getCurrentToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting Firebase token:', error);
        authStore.logout();
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default instance;
