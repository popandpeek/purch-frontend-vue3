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
    console.log('Making API request to:', config.url);
    console.log('Auth state:', authStore.isAuthenticated);
    
    if (authStore.isAuthenticated && authStore.firebaseUser) {
      try {
        const token = await authStore.getCurrentToken();
        console.log('Token obtained:', token ? 'Yes' : 'No');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Authorization header set');
        }
      } catch (error) {
        console.error('Error getting Firebase token:', error);
        // Don't logout immediately - let the response interceptor handle 401s
        console.warn('Token retrieval failed, proceeding without auth header');
      }
    } else {
      console.warn('Not authenticated, request will likely fail');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling with retry logic
instance.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API request failed:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);
    
    // Handle authentication errors with retry logic
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      console.log('🔐 Authentication error - attempting token refresh');
      originalRequest._retry = true;
      
      try {
        const authStore = useAuthStore();
        if (authStore.firebaseUser) {
          // Force token refresh
          const newToken = await authStore.firebaseUser.getIdToken(true);
          if (newToken) {
            console.log('Token refreshed, retrying request');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If refresh failed, logout
      console.log('🔐 Token refresh failed - logging out');
      const authStore = useAuthStore();
      authStore.logout();
    } else if (error.code?.includes('NETWORK')) {
      console.log('🌐 Network error - not logging out');
    }
    
    return Promise.reject(error);
  }
);

export default instance;
