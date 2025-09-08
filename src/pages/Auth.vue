<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h2>PURCH System</h2>
        <p>Sign in to your account</p>
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
        class="bg-negative text-white q-mt-md"
        rounded
      >
        {{ authStore.error }}
      </q-banner>
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

onMounted(() => {
  // Initialize Firebase auth state listener
  authStore.initializeAuth();
});

const handleAuthSuccess = () => {
  // Redirect to dashboard or home page
  router.push('/');
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.auth-header p {
  margin: 0;
  color: #666;
}

.auth-forms {
  min-height: 300px;
}
</style>
