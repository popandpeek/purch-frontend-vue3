import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import type { User, UserLogin, UserRegister } from '@/api/model';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    firebaseUser: null as any, // Firebase User object
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
    isInitialized: false, // Track if auth state has been initialized
  }),

  getters: {
    isLoggedIn: (state) => !!state.firebaseUser && state.isAuthenticated,
    fullName: (state) => 
      state.user ? `${state.user.first_name} ${state.user.last_name}` : '',
  },

  actions: {
    async login(credentials: UserLogin) {
      this.loading = true;
      this.error = null;
      
      try {
        const firebaseUser = await authService.login(credentials);
        // The auth state change listener will handle updating the store
        // We just need to wait for it to complete
        await this.waitForAuthStateUpdate();
        
        return { user: this.user, firebaseUser };
      } catch (error: any) {
        this.error = error.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData: UserRegister) {
      this.loading = true;
      this.error = null;
      
      try {
        const firebaseUser = await authService.register(userData);
        // The auth state change listener will handle updating the store
        await this.waitForAuthStateUpdate();
        
        return { user: this.user, firebaseUser };
      } catch (error: any) {
        this.error = error.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signInWithGoogle() {
      this.loading = true;
      this.error = null;
      
      try {
        const firebaseUser = await authService.signInWithGoogle();
        // The auth state change listener will handle updating the store
        await this.waitForAuthStateUpdate();
        
        return { user: this.user, firebaseUser };
      } catch (error: any) {
        this.error = error.message || 'Google sign-in failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(email: string) {
      this.loading = true;
      this.error = null;
      
      try {
        await authService.resetPassword(email);
        return true;
      } catch (error: any) {
        this.error = error.message || 'Password reset failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Clear state regardless of API call success
        this.user = null;
        this.firebaseUser = null;
        this.isAuthenticated = false;
        this.error = null;
      }
    },

    // Helper method to wait for auth state update
    waitForAuthStateUpdate(): Promise<void> {
      return new Promise((resolve) => {
        const checkAuthState = () => {
          if (this.isAuthenticated) {
            resolve();
          } else {
            setTimeout(checkAuthState, 50);
          }
        };
        checkAuthState();
      });
    },

    // Check if current token is valid and refresh if needed
    async checkTokenValidity(): Promise<boolean> {
      if (!this.firebaseUser) {
        return false;
      }

      try {
        // Force refresh the token to check if it's still valid
        const token = await this.firebaseUser.getIdToken(true);
        return !!token;
      } catch (error) {
        console.error('Token validation failed:', error);
        this.logout();
        return false;
      }
    },

    // Set up automatic token refresh
    setupTokenRefresh() {
      if (!this.firebaseUser) return;

      // Refresh token every 50 minutes (tokens expire after 1 hour)
      setInterval(async () => {
        if (this.firebaseUser) {
          const isValid = await this.checkTokenValidity();
          if (!isValid) {
            console.log('Token expired, logging out user');
            this.logout();
          }
        }
      }, 50 * 60 * 1000); // 50 minutes
    },

    // Get current Firebase token (with automatic refresh)
    async getCurrentToken(): Promise<string | null> {
      if (!this.firebaseUser) {
        return null;
      }

      try {
        return await this.firebaseUser.getIdToken();
      } catch (error) {
        console.error('Failed to get token:', error);
        this.logout();
        return null;
      }
    },

    // Initialize auth state listener
    initializeAuth() {
      if (this.isInitialized) {
        return; // Already initialized
      }

      this.isInitialized = true;
      
      authService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          // Check if the token is still valid
          try {
            const token = await firebaseUser.getIdToken();
            if (token) {
              this.firebaseUser = firebaseUser;
              this.user = authService.convertFirebaseUser(firebaseUser);
              this.isAuthenticated = true;
              this.error = null;
              
              // Set up automatic token refresh
              this.setupTokenRefresh();
            } else {
              // Token is invalid, log out
              this.logout();
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            this.logout();
          }
        } else {
          // No user, clear state
          this.user = null;
          this.firebaseUser = null;
          this.isAuthenticated = false;
          this.error = null;
        }
      });
    },
  },
});