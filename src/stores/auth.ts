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
    authListenerUnsubscribe: null as (() => void) | null, // Track auth listener unsubscribe function
    tokenRefreshInterval: null as NodeJS.Timeout | null, // Track token refresh interval
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
        
        // Clear token refresh interval
        if (this.tokenRefreshInterval) {
          clearInterval(this.tokenRefreshInterval);
          this.tokenRefreshInterval = null;
        }
        
        // Don't clean up the listener here as we want to keep listening for auth changes
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

    // Wait for auth state change and call callback
    waitForAuthStateChange(callback: (isAuthenticated: boolean) => void): () => void {
      // If we already have a definitive auth state, call immediately
      if (this.isInitialized && this.firebaseUser !== null) {
        const isAuthenticated = !!this.firebaseUser;
        console.log('🔐 Using existing auth state, isAuthenticated:', isAuthenticated);
        callback(isAuthenticated);
        return () => {}; // Return empty unsubscribe function
      }
      
      // If initialized but no firebaseUser yet, wait for Firebase auth state change
      // This handles the case where Firebase is still restoring the session
      if (this.isInitialized && this.firebaseUser === null) {
        console.log('🔐 Auth initialized but no user yet, waiting for Firebase auth state change...');
        let hasCalled = false;
        const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
          if (!hasCalled) {
            hasCalled = true;
            const isAuthenticated = !!firebaseUser;
            console.log('🔐 Auth state change callback triggered, isAuthenticated:', isAuthenticated);
            callback(isAuthenticated);
          }
        });
        
        return unsubscribe;
      }
      
      // If not initialized yet, wait for initialization first
      if (!this.isInitialized) {
        console.log('🔐 Auth not initialized yet, waiting for initialization...');
        // Wait for initialization to complete
        const checkInitialized = () => {
          if (this.isInitialized) {
            // Now check if we have a definitive auth state
            if (this.firebaseUser !== null) {
              const isAuthenticated = !!this.firebaseUser;
              console.log('🔐 Auth initialized, using existing state, isAuthenticated:', isAuthenticated);
              callback(isAuthenticated);
            } else {
              // Still waiting for Firebase auth state, wait a bit more
              setTimeout(() => {
                if (this.firebaseUser !== null) {
                  const isAuthenticated = !!this.firebaseUser;
                  console.log('🔐 Auth state determined after delay, isAuthenticated:', isAuthenticated);
                  callback(isAuthenticated);
                } else {
                  // Still no user, call with false
                  console.log('🔐 No user found after initialization, isAuthenticated: false');
                  callback(false);
                }
              }, 300); // Give Firebase more time to restore session
            }
          } else {
            // Still not initialized, check again in a bit
            setTimeout(checkInitialized, 50);
          }
        };
        checkInitialized();
        return () => {}; // Return empty unsubscribe function
      }
      
      // Fallback - should not reach here
      console.warn('🔐 Unexpected state in waitForAuthStateChange');
      callback(false);
      return () => {};
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
        // Don't logout immediately - let the response interceptor handle 401s
        console.warn('Token validation failed, returning false');
        return false;
      }
    },

    // Set up automatic token refresh
    setupTokenRefresh() {
      if (!this.firebaseUser) return;

      // Clear any existing interval
      if (this.tokenRefreshInterval) {
        clearInterval(this.tokenRefreshInterval);
      }

      // Refresh token every 55 minutes (tokens expire after 1 hour)
      this.tokenRefreshInterval = setInterval(async () => {
        if (this.firebaseUser) {
          try {
            // Just get the token (Firebase will refresh if needed)
            await this.firebaseUser.getIdToken();
            console.log('✅ Token refreshed successfully');
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Don't logout immediately - let the response interceptor handle 401s
            console.warn('Token refresh failed, will retry on next API call');
          }
        }
      }, 55 * 60 * 1000); // 55 minutes
    },

    // Get current Firebase token (with automatic refresh)
    async getCurrentToken(): Promise<string | null> {
      if (!this.firebaseUser) {
        console.log('No Firebase user available for token');
        return null;
      }

      try {
        // Check if token needs refresh before expiration
        const tokenResult = await this.firebaseUser.getIdTokenResult();
        const expirationTime = new Date(tokenResult.expirationTime);
        const currentTime = new Date();
        const timeUntilExpiry = expirationTime.getTime() - currentTime.getTime();
        
        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('Token expires soon, refreshing...');
          return await this.firebaseUser.getIdToken(true);
        }
        
        return tokenResult.token;
      } catch (error) {
        console.error('Failed to get token:', error);
        // Don't logout immediately - let the response interceptor handle 401s
        console.warn('Token retrieval failed, returning null');
        return null;
      }
    },

    // Initialize auth state listener
    async initializeAuth(): Promise<void> {
      if (this.isInitialized) {
        console.log('🔐 Auth store already initialized');
        return; // Already initialized
      }

      this.isInitialized = true;
      console.log('🔐 Initializing auth store...');
      
      // Check if authService is available
      if (!authService) {
        console.error('AuthService is not available');
        return;
      }
      
      console.log('✅ AuthService is available, setting up listener...');
      
      // Set up the auth state listener first (only once)
      if (!this.authListenerUnsubscribe) {
        this.authListenerUnsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
          console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
          if (firebaseUser) {
            // Set user state immediately - Firebase handles token validation
            console.log('✅ User found, setting user state');
            this.firebaseUser = firebaseUser;
            this.user = authService.convertFirebaseUser(firebaseUser);
            this.isAuthenticated = true;
            this.error = null;
            
            // Set up automatic token refresh
            this.setupTokenRefresh();
          } else {
            console.log('👤 No user, clearing state');
            // No user, clear state
            this.user = null;
            this.firebaseUser = null;
            this.isAuthenticated = false;
            this.error = null;
          }
        });
      }

      // Add a small delay to allow Firebase to restore the session
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if there's already a current user (for page refresh)
      // This will trigger the auth state change listener above
      const currentUser = authService.getCurrentUser();
      console.log('Current user on initialization:', currentUser);
      if (currentUser) {
        console.log('Found existing user on initialization:', currentUser.uid);
        // The auth state change listener will handle setting the user state
        // We just need to wait for it to complete
        await this.waitForAuthStateUpdate();
        console.log('✅ User state restored from existing session');
      } else {
        console.log('👤 No existing user found, auth state will be determined by listener');
      }
    },

    // Clean up auth listener
    cleanup() {
      if (this.authListenerUnsubscribe) {
        this.authListenerUnsubscribe();
        this.authListenerUnsubscribe = null;
      }
    },
  },
});