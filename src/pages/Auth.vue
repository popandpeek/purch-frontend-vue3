<template>
  <div class="auth-page">
    <!-- Background Elements -->
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <!-- Main Content -->
    <div class="auth-content">
      <!-- Left Side - Branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="logo-container">
            <h1 class="brand-title">PURCH</h1>
          </div>
          <h2 class="brand-subtitle">Procurement Management System</h2>
          <p class="brand-description">
            Streamline your purchasing process with our comprehensive procurement management platform. 
            Manage vendors, track orders, and optimize your supply chain.
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <span>Vendor Management</span>
            </div>
            <div class="feature-item">
              <span>Order Tracking</span>
            </div>
            <div class="feature-item">
              <span>Inventory Control</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Side - Auth Forms -->
      <div class="auth-forms-container">
        <div class="auth-card">
          <div class="auth-header">
            <h3 class="form-title">
              {{ currentForm === 'login' ? 'Welcome Back' : currentForm === 'register' ? 'Create Account' : 'Reset Password' }}
            </h3>
            <p class="form-subtitle">
              {{ currentForm === 'login' ? 'Sign in to continue to your dashboard' : 
                 currentForm === 'register' ? 'Join us and start managing your procurement' : 
                 'Enter your email to reset your password' }}
            </p>
          </div>
          
          <div class="auth-forms">
            <!-- Login Form -->
            <LoginForm
              v-if="currentForm === 'login'"
              @switch-to-register="currentForm = 'register'"
              @forgot-password="currentForm = 'reset'"
              @login-success="handleAuthSuccess"
            />
            
            <!-- Register Form -->
            <RegisterForm
              v-if="currentForm === 'register'"
              @switch-to-login="currentForm = 'login'"
              @register-success="handleAuthSuccess"
            />
            
            <!-- Password Reset Form -->
            <PasswordResetForm
              v-if="currentForm === 'reset'"
              @back-to-login="currentForm = 'login'"
              @reset-sent="handleResetSent"
            />
          </div>
          
          <!-- Error Display -->
          <q-banner
            v-if="authStore.error"
            class="error-banner"
            rounded
          >
            {{ authStore.error }}
          </q-banner>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import PasswordResetForm from '@/components/auth/PasswordResetForm.vue';

const router = useRouter();
const authStore = useAuthStore();
const currentForm = ref<'login' | 'register' | 'reset'>('login');

onMounted(async () => {
  // Initialize Firebase auth state listener
  await authStore.initializeAuth();
  
  // Note: Router guard handles redirecting authenticated users away from /auth
  // No need for additional redirect logic here
});

const handleAuthSuccess = () => {
  // Redirect to dashboard
  router.push('/dashboard');
};

const handleResetSent = () => {
  // Show success message and go back to login
  currentForm.value = 'login';
  // You could show a success notification here
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* Background Shapes */
.background-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Main Content */
.auth-content {
  display: flex;
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 2;
}

/* Left Side - Branding */
.auth-branding {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.branding-content {
  max-width: 500px;
  color: white;
  text-align: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 20px;
}


.brand-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.brand-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 40px 0;
  opacity: 0.8;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-start;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  opacity: 0.9;
}

/* Right Side - Auth Forms */
.auth-forms-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.auth-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 50px;
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: #1a202c;
}

.form-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.auth-forms {
  min-height: 300px;
}

.error-banner {
  margin-top: 20px;
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-content {
    flex-direction: column;
  }
  
  .auth-branding {
    padding: 40px 30px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .auth-forms-container {
    padding: 40px 30px;
  }
  
  .auth-card {
    padding: 30px;
  }
  
  .brand-title {
    font-size: 2.5rem;
  }
  
  .brand-subtitle {
    font-size: 1.2rem;
  }
  
  .feature-list {
    align-items: center;
  }
}
</style>
