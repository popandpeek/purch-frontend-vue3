import axios from "axios";
import { useAuthStore } from '@/stores/auth';

const instance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Firebase ID token
instance.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore();
    console.log('🔍 Making API request to:', config.url);
    console.log('🔍 Auth state:', authStore.isAuthenticated);
    
    if (authStore.isAuthenticated) {
      try {
        const token = await authStore.getCurrentToken();
        console.log('🔍 Token obtained:', token ? 'Yes' : 'No');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔍 Authorization header set');
        }
      } catch (error) {
        console.error('Error getting Firebase token:', error);
        authStore.logout();
      }
    } else {
      console.warn('⚠️ Not authenticated, request will likely fail');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API request failed:', error.response?.status, error.config?.url);
    console.error('❌ Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized - logging out');
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default instance;
