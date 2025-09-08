# 🎨 PURCH Frontend Vue3 - MVP Implementation Plan

## **Project Overview**
Complete the Vue3 frontend implementation to work seamlessly with the new FastAPI backend, ensuring all TypeScript interfaces are properly integrated and all features are fully functional.

## **Current State Analysis**

### ✅ **What's Working**
- Vue3 + Quasar framework setup
- TypeScript configuration
- Basic component structure
- Pinia store setup
- Router configuration
- API client setup

### ❌ **Issues to Address**
- **API Integration**: Need to update API client for FastAPI backend
- **Data Model Alignment**: Ensure frontend models match backend schemas
- **Missing Components**: Some components may need updates for new data structure
- **Error Handling**: Need proper error handling for new API responses
- **Authentication**: Update auth flow for new JWT implementation

## **Phase 1: Authentication System (CRITICAL PRIORITY)**
*Estimated Time: 5-6 hours*

**Note: Authentication must be working before any other development can proceed.**

### 1.1 Current Auth Issues (CRITICAL)
**Current Frontend Auth Problems:**
- ❌ **No proper login flow** - Basic form without validation
- ❌ **No token management** - No refresh token handling
- ❌ **No user registration** - No signup functionality
- ❌ **No logout functionality** - No proper session cleanup
- ❌ **No password validation** - No client-side validation
- ❌ **No error handling** - No proper auth error feedback
- ❌ **No protected routes** - No route guards
- ❌ **No user state management** - No persistent user data

**Solution: Firebase Authentication**
- ✅ **Google-managed auth** - No need to build custom JWT system
- ✅ **Multiple auth methods** - Email/password, Google, GitHub, etc.
- ✅ **Automatic token management** - Firebase handles refresh tokens
- ✅ **Built-in security** - Google's security infrastructure
- ✅ **Easy integration** - Simple Vue3 + Firebase setup
- ✅ **Production ready** - Used by millions of apps

### 1.2 Firebase Setup
**Install Firebase:**
```bash
npm install firebase
```

**File: `src/firebase/config.ts`**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

### 1.3 Update API Client
**File: `src/http-common.ts`**

*Note: This will work with Firebase Auth and the FastAPI backend.*
```typescript
import axios from 'axios';
import { auth } from '@/firebase/config';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore();
    if (authStore.user) {
      try {
        const token = await authStore.user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 1.4 Firebase Authentication Service
**File: `src/services/auth.service.ts`**
```typescript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import type { User, UserLogin, UserRegister } from '@/api/model';

export class AuthService {
  // Email/Password Login
  async login(credentials: UserLogin): Promise<FirebaseUser> {
    const { email, password } = credentials;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Email/Password Registration
  async register(userData: UserRegister): Promise<FirebaseUser> {
    const { email, password, first_name, last_name } = userData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: `${first_name} ${last_name}`
    });
    
    return userCredential.user;
  }

  // Google Sign-In
  async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Password Reset
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Auth State Listener
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Convert Firebase User to our User interface
  convertFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: firebaseUser.displayName || firebaseUser.email || '',
      first_name: firebaseUser.displayName?.split(' ')[0] || '',
      last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      phone: firebaseUser.phoneNumber || undefined,
      is_active: !firebaseUser.isAnonymous,
      is_superuser: false, // You can set this based on custom claims
      created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
      updated_at: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
    };
  }
}

export const authService = new AuthService();
```

### 1.5 Update TypeScript Models
**File: `src/api/model.ts`**
```typescript
// Update User interface to work with Firebase
export interface User {
  id: string; // Firebase UID
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

// Add authentication interfaces
export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Remove JWT token interfaces - Firebase handles this

// Ensure all other interfaces match backend Pydantic schemas exactly
// Add missing fields and relationships
// Update field types to match backend (e.g., `measure_unit` instead of `unit`)
// Add proper optional/required field annotations
```

### 1.6 Firebase Authentication Store Implementation
**File: `src/stores/auth.ts`**
```typescript
import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import type { User, UserLogin, UserRegister } from '@/api/model';
import { onMounted } from 'vue';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    firebaseUser: null as any, // Firebase User object
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
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
        this.firebaseUser = firebaseUser;
        this.user = authService.convertFirebaseUser(firebaseUser);
        this.isAuthenticated = true;
        
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
        this.firebaseUser = firebaseUser;
        this.user = authService.convertFirebaseUser(firebaseUser);
        this.isAuthenticated = true;
        
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
        this.firebaseUser = firebaseUser;
        this.user = authService.convertFirebaseUser(firebaseUser);
        this.isAuthenticated = true;
        
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

    // Initialize auth state listener
    initializeAuth() {
      authService.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          this.firebaseUser = firebaseUser;
          this.user = authService.convertFirebaseUser(firebaseUser);
          this.isAuthenticated = true;
        } else {
          this.user = null;
          this.firebaseUser = null;
          this.isAuthenticated = false;
        }
      });
    },
  },
});
```

### 1.7 Firebase Authentication Components
**File: `src/components/auth/LoginForm.vue`**
```vue
<template>
  <q-card class="login-card">
    <q-card-section>
      <div class="text-h6 text-center q-mb-md">Login</div>
      
      <q-form @submit="handleLogin" class="q-gutter-md">
        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Invalid email']"
          outlined
        />
        
        <q-input
          v-model="form.password"
          label="Password"
          type="password"
          :rules="[val => !!val || 'Password is required']"
          outlined
        />
        
        <q-btn
          type="submit"
          color="primary"
          label="Login"
          class="full-width"
          :loading="authStore.loading"
        />
      </q-form>
      
      <q-separator class="q-my-md" />
      
      <q-btn
        color="secondary"
        icon="fab fa-google"
        label="Sign in with Google"
        class="full-width"
        :loading="authStore.loading"
        @click="handleGoogleSignIn"
      />
      
      <div class="text-center q-mt-md">
        <q-btn
          flat
          color="primary"
          label="Don't have an account? Register"
          @click="$emit('switch-to-register')"
        />
        <br>
        <q-btn
          flat
          color="grey"
          label="Forgot password?"
          @click="$emit('forgot-password')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { UserLogin } from '@/api/model';

const authStore = useAuthStore();

const form = ref<UserLogin>({
  email: '',
  password: '',
});

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleLogin = async () => {
  try {
    await authStore.login(form.value);
    // Emit success event or redirect
    emit('login-success');
  } catch (error) {
    // Error is handled in the store
  }
};

const handleGoogleSignIn = async () => {
  try {
    await authStore.signInWithGoogle();
    emit('login-success');
  } catch (error) {
    // Error is handled in the store
  }
};

defineEmits<{
  'switch-to-register': [];
  'login-success': [];
  'forgot-password': [];
}>();
</script>
```

**File: `src/components/auth/RegisterForm.vue`**
```vue
<template>
  <q-card class="register-card">
    <q-card-section>
      <div class="text-h6 text-center q-mb-md">Register</div>
      
      <q-form @submit="handleRegister" class="q-gutter-md">
        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Invalid email']"
          outlined
        />
        
        
        <q-input
          v-model="form.first_name"
          label="First Name"
          :rules="[val => !!val || 'First name is required']"
          outlined
        />
        
        <q-input
          v-model="form.last_name"
          label="Last Name"
          :rules="[val => !!val || 'Last name is required']"
          outlined
        />
        
        <q-input
          v-model="form.password"
          label="Password"
          type="password"
          :rules="[val => !!val || 'Password is required', val => val.length >= 8 || 'Password must be at least 8 characters']"
          outlined
        />
        
        <q-input
          v-model="form.confirmPassword"
          label="Confirm Password"
          type="password"
          :rules="[val => !!val || 'Please confirm password', val => val === form.password || 'Passwords do not match']"
          outlined
        />
        
        <q-btn
          type="submit"
          color="primary"
          label="Register"
          class="full-width"
          :loading="authStore.loading"
        />
      </q-form>
      
      <div class="text-center q-mt-md">
        <q-btn
          flat
          color="primary"
          label="Already have an account? Login"
          @click="$emit('switch-to-login')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { UserRegister } from '@/api/model';

const authStore = useAuthStore();

const form = ref<UserRegister & { confirmPassword: string }>({
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  confirmPassword: '',
});

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleRegister = async () => {
  try {
    const { confirmPassword, ...userData } = form.value;
    await authStore.register(userData);
    // Emit success event or redirect
    emit('register-success');
  } catch (error) {
    // Error is handled in the store
  }
};

defineEmits<{
  'switch-to-login': [];
  'register-success': [];
}>();
</script>
```

### 1.8 Firebase Route Guards
**File: `src/router.ts`**
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/pages/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/Home.vue'),
      meta: { requiresAuth: true }
    },
    // ... other routes
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize Firebase auth state listener
  if (!authStore.isAuthenticated) {
    authStore.initializeAuth();
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
```

### 1.9 Firebase Setup Instructions
**Environment Variables (`.env`):**
```env
VUE_APP_FIREBASE_API_KEY=your_api_key
VUE_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=your_project_id
VUE_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
VUE_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
VUE_APP_API_URL=http://localhost:8000/api/v1
```

**Firebase Console Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable Authentication
4. Enable Email/Password and Google sign-in methods
5. Get your config from Project Settings > General > Your apps
6. Add your domain to authorized domains

**Package.json Dependencies:**
```json
{
  "dependencies": {
    "firebase": "^10.7.1",
    "vue": "^3.3.0",
    "pinia": "^2.1.0",
    "quasar": "^2.14.0"
  }
}
```

### 1.10 Backend Integration
**Backend needs to verify Firebase tokens:**
```python
# In your FastAPI backend
from firebase_admin import auth as firebase_auth

async def verify_firebase_token(token: str):
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 1.11 Create API Service Layer
**New Files:**
```
src/services/
├── auth.service.ts
├── vendor.service.ts
├── house-item.service.ts
├── vendor-item.service.ts
├── house-order.service.ts
├── inventory.service.ts
└── vendor-order.service.ts
```

**Example Service:**
```typescript
// src/services/vendor.service.ts
import api from '@/http-common';
import type { Vendor, VendorCreate, VendorUpdate } from '@/api/model';

export class VendorService {
  async getVendors(): Promise<Vendor[]> {
    const response = await api.get('/vendors/');
    return response.data;
  }

  async getVendor(id: number): Promise<Vendor> {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  }

  async createVendor(vendor: VendorCreate): Promise<Vendor> {
    const response = await api.post('/vendors/', vendor);
    return response.data;
  }

  async updateVendor(id: number, vendor: VendorUpdate): Promise<Vendor> {
    const response = await api.put(`/vendors/${id}`, vendor);
    return response.data;
  }

  async deleteVendor(id: number): Promise<void> {
    await api.delete(`/vendors/${id}`);
  }
}

export const vendorService = new VendorService();
```

## **Phase 2: Store Updates & State Management**
*Estimated Time: 3-4 hours*

### 2.1 Update Pinia Stores
**File: `src/stores/vendors.ts`**
```typescript
import { defineStore } from 'pinia';
import { vendorService } from '@/services/vendor.service';
import type { Vendor, VendorCreate, VendorUpdate } from '@/api/model';

export const useVendorStore = defineStore('vendors', {
  state: () => ({
    vendors: [] as Vendor[],
    currentVendor: null as Vendor | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getVendorById: (state) => (id: number) => 
      state.vendors.find(vendor => vendor.id === id),
    
    getVendorsByCategory: (state) => (category: string) =>
      state.vendors.filter(vendor => vendor.category === category),
  },

  actions: {
    async fetchVendors() {
      this.loading = true;
      this.error = null;
      try {
        this.vendors = await vendorService.getVendors();
      } catch (error) {
        this.error = 'Failed to fetch vendors';
        console.error('Error fetching vendors:', error);
      } finally {
        this.loading = false;
      }
    },

    async createVendor(vendorData: VendorCreate) {
      this.loading = true;
      this.error = null;
      try {
        const newVendor = await vendorService.createVendor(vendorData);
        this.vendors.push(newVendor);
        return newVendor;
      } catch (error) {
        this.error = 'Failed to create vendor';
        console.error('Error creating vendor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateVendor(id: number, vendorData: VendorUpdate) {
      this.loading = true;
      this.error = null;
      try {
        const updatedVendor = await vendorService.updateVendor(id, vendorData);
        const index = this.vendors.findIndex(v => v.id === id);
        if (index !== -1) {
          this.vendors[index] = updatedVendor;
        }
        return updatedVendor;
      } catch (error) {
        this.error = 'Failed to update vendor';
        console.error('Error updating vendor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteVendor(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await vendorService.deleteVendor(id);
        this.vendors = this.vendors.filter(v => v.id !== id);
      } catch (error) {
        this.error = 'Failed to delete vendor';
        console.error('Error deleting vendor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
```

### 2.2 Update All Stores
- **vendors.ts**: Complete CRUD operations
- **house-items.ts**: Update for new data structure
- **vendor-items.ts**: Add missing functionality
- **house-orders.ts**: Implement order management
- **inventories.ts**: Add inventory management
- **vendor-orders.ts**: Add vendor order management
- **vendor-invoices.ts**: Add invoice management

## **Phase 3: Component Updates & New Features**
*Estimated Time: 6-8 hours*

### 3.1 Update Existing Components
**File: `src/components/vendors/VendorItem.vue`**
```vue
<template>
  <q-card class="vendor-item-card">
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h6">{{ vendor.name }}</div>
          <div class="text-caption text-grey-6">
            {{ vendor.contact_name_first }} {{ vendor.contact_name_last }}
          </div>
          <div class="text-caption text-grey-6">
            {{ vendor.phone }} • {{ vendor.email }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            icon="edit"
            @click="$emit('edit', vendor)"
          />
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            @click="$emit('delete', vendor.id)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { Vendor } from '@/api/model';

interface Props {
  vendor: Vendor;
}

defineProps<Props>();
defineEmits<{
  edit: [vendor: Vendor];
  delete: [id: number];
}>();
</script>
```

### 3.2 Create Missing Components
**New Components Needed:**
- **VendorOrderItem.vue**: Vendor order line items
- **VendorInvoiceItem.vue**: Vendor invoice line items
- **HouseOrderItem.vue**: House order line items
- **InventoryItem.vue**: Inventory line items
- **ItemClassSelector.vue**: Item class selection
- **StorageLocationSelector.vue**: Storage location selection

### 3.3 Update Page Components
**File: `src/pages/vendors/VendorList.vue`**
```vue
<template>
  <q-page class="vendor-list-page">
    <div class="row q-mb-md">
      <div class="col">
        <h4>Vendors</h4>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Add Vendor"
          @click="showAddDialog = true"
        />
      </div>
    </div>

    <q-list v-if="!vendorStore.loading">
      <VendorItem
        v-for="vendor in vendorStore.vendors"
        :key="vendor.id"
        :vendor="vendor"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </q-list>

    <q-spinner v-else size="40px" />

    <!-- Add/Edit Dialog -->
    <VendorDialog
      v-model="showAddDialog"
      :vendor="editingVendor"
      @save="handleSave"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVendorStore } from '@/stores/vendors';
import VendorItem from '@/components/vendors/VendorItem.vue';
import VendorDialog from '@/components/vendors/VendorDialog.vue';
import type { Vendor } from '@/api/model';

const vendorStore = useVendorStore();
const showAddDialog = ref(false);
const editingVendor = ref<Vendor | null>(null);

onMounted(() => {
  vendorStore.fetchVendors();
});

const handleEdit = (vendor: Vendor) => {
  editingVendor.value = vendor;
  showAddDialog.value = true;
};

const handleDelete = async (id: number) => {
  if (confirm('Are you sure you want to delete this vendor?')) {
    await vendorStore.deleteVendor(id);
  }
};

const handleSave = async (vendorData: any) => {
  if (editingVendor.value) {
    await vendorStore.updateVendor(editingVendor.value.id, vendorData);
  } else {
    await vendorStore.createVendor(vendorData);
  }
  editingVendor.value = null;
  showAddDialog.value = false;
};
</script>
```

## **Phase 4: Authentication & Security Updates**
*Estimated Time: 3-4 hours*

### 4.1 Update Authentication Store
**File: `src/stores/auth.ts`**
```typescript
import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import type { User, UserLogin, UserRegister } from '@/api/model';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && state.isAuthenticated,
  },

  actions: {
    async login(credentials: UserLogin) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(credentials);
        this.token = response.access_token;
        this.user = response.user;
        this.isAuthenticated = true;
        localStorage.setItem('token', this.token);
        return response;
      } catch (error) {
        this.error = 'Login failed';
        console.error('Login error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData: UserRegister) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.register(userData);
        return response;
      } catch (error) {
        this.error = 'Registration failed';
        console.error('Registration error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    },

    async refreshToken() {
      if (!this.token) return;
      
      try {
        const response = await authService.refreshToken(this.token);
        this.token = response.access_token;
        localStorage.setItem('token', this.token);
      } catch (error) {
        this.logout();
        throw error;
      }
    },
  },
});
```

### 4.2 Update Router Guards
**File: `src/router.ts`**
```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ... existing routes
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
```

## **Phase 5: Error Handling & User Experience**
*Estimated Time: 3-4 hours*

### 5.1 Global Error Handling
**File: `src/utils/errorHandler.ts`**
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error.response) {
    return new APIError(
      error.response.data.detail || 'An error occurred',
      error.response.status,
      error.response.data.code
    );
  } else if (error.request) {
    return new APIError('Network error', 0);
  } else {
    return new APIError('An unexpected error occurred', 500);
  }
};
```

### 5.2 Loading States & Notifications
**File: `src/composables/useNotifications.ts`**
```typescript
import { useQuasar } from 'quasar';

export const useNotifications = () => {
  const $q = useQuasar();

  const showSuccess = (message: string) => {
    $q.notify({
      type: 'positive',
      message,
      position: 'top',
    });
  };

  const showError = (message: string) => {
    $q.notify({
      type: 'negative',
      message,
      position: 'top',
    });
  };

  const showLoading = (message: string) => {
    return $q.loading.show({
      message,
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
  };
};
```

### 5.3 Form Validation
**File: `src/utils/validation.ts`**
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};
```

## **Phase 6: Testing & Quality Assurance**
*Estimated Time: 4-5 hours*

### 6.1 Unit Tests
**File: `tests/unit/stores/vendors.spec.ts`**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVendorStore } from '@/stores/vendors';

describe('Vendor Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should fetch vendors', async () => {
    const store = useVendorStore();
    await store.fetchVendors();
    expect(store.vendors).toBeDefined();
  });

  it('should create vendor', async () => {
    const store = useVendorStore();
    const vendorData = {
      name: 'Test Vendor',
      contact_name_first: 'John',
      contact_name_last: 'Doe',
      contact_email: 'john@test.com',
      phone: '1234567890',
    };
    
    const result = await store.createVendor(vendorData);
    expect(result).toBeDefined();
    expect(store.vendors).toContain(result);
  });
});
```

### 6.2 Component Tests
**File: `tests/unit/components/VendorItem.spec.ts`**
```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VendorItem from '@/components/vendors/VendorItem.vue';
import type { Vendor } from '@/api/model';

describe('VendorItem', () => {
  it('should render vendor information', () => {
    const vendor: Vendor = {
      id: 1,
      name: 'Test Vendor',
      contact_name_first: 'John',
      contact_name_last: 'Doe',
      contact_email: 'john@test.com',
      phone: '1234567890',
      // ... other required fields
    };

    const wrapper = mount(VendorItem, {
      props: { vendor },
    });

    expect(wrapper.text()).toContain('Test Vendor');
    expect(wrapper.text()).toContain('John Doe');
  });
});
```

## **Phase 7: Performance & Optimization**
*Estimated Time: 2-3 hours*

### 7.1 Code Splitting
**File: `src/router.ts`**
```typescript
const routes = [
  {
    path: '/vendors',
    component: () => import('@/pages/vendors/VendorList.vue'),
  },
  {
    path: '/house-items',
    component: () => import('@/pages/products/HouseItemList.vue'),
  },
  // ... other routes
];
```

### 7.2 Lazy Loading
**File: `src/components/VendorDialog.vue`**
```vue
<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 400px">
      <!-- Dialog content -->
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const VendorForm = defineAsyncComponent(() => import('./VendorForm.vue'));
</script>
```

### 7.3 Caching Strategy
- Implement proper caching in Pinia stores
- Use computed properties for derived data
- Implement pagination for large datasets

## **📊 Implementation Timeline**

| Phase | Duration | Dependencies | Priority |
|-------|----------|--------------|----------|
| Phase 1 | 4-5 hours | Backend Phase 1 | High |
| Phase 2 | 3-4 hours | Phase 1 | High |
| Phase 3 | 6-8 hours | Phase 2 | High |
| Phase 4 | 3-4 hours | Phase 3 | High |
| Phase 5 | 3-4 hours | Phase 4 | Medium |
| Phase 6 | 4-5 hours | Phase 5 | Medium |
| Phase 7 | 2-3 hours | Phase 6 | Low |

**Total Estimated Time: 25-33 hours**

## **🎯 Success Criteria**

### MVP Completion Checklist:
- [ ] All API endpoints integrated and working
- [ ] All TypeScript interfaces aligned with backend
- [ ] Complete CRUD operations for all entities
- [ ] Proper error handling and user feedback
- [ ] Authentication flow working
- [ ] All components updated and functional
- [ ] Responsive design maintained
- [ ] Basic testing coverage
- [ ] Performance optimized

## **🚀 Next Steps**

1. **Start Phase 1**: Update API client and data models
2. **Coordinate with Backend**: Ensure API endpoints and seeding are ready
3. **Update Stores**: Implement new state management
4. **Test Integration**: Verify frontend-backend communication with seeded data

## **📝 Notes**

- Use Quasar components instead of raw HTML [[memory:6772185]]
- Manage state through Pinia stores [[memory:5046895]]
- Use logging instead of print statements [[memory:5046899]]
- Keep services separated for future microservices [[memory:6772195]]
- Follow clean code principles [[memory:4871127]]
