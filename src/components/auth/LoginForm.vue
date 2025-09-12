<template>
  <div class="login-form">
    <q-form @submit="handleLogin" class="form-container">
      <div class="input-group">
        <label class="input-label">Email Address</label>
        <div class="input-wrapper">
          <input
            v-model="form.email"
            type="email"
            class="input-field"
            placeholder="Enter your email"
            required
          />
        </div>
        <div v-if="form.email && !isValidEmail(form.email)" class="error-message">
          Please enter a valid email address
        </div>
      </div>
      
      <div class="input-group">
        <label class="input-label">Password</label>
        <div class="input-wrapper">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="input-field"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div v-if="form.password && form.password.length < 8" class="error-message">
          Password must be at least 8 characters
        </div>
      </div>
      
      <div class="form-actions">
        <q-btn
          type="submit"
          color="primary"
          label="Sign In"
          class="submit-button"
          :loading="authStore.loading"
          size="lg"
        />
      </div>
    </q-form>
    
    <div class="divider">
      <span class="divider-text">or continue with</span>
    </div>
    
    <div class="social-login">
      <q-btn
        color="white"
        text-color="grey-8"
        label="Google"
        class="social-button"
        :loading="authStore.loading"
        @click="handleGoogleSignIn"
        outline
      />
    </div>
    
    <div class="form-footer">
      <div class="footer-links">
        <q-btn
          flat
          color="primary"
          label="Don't have an account? Sign up"
          class="link-button"
          @click="$emit('switch-to-register')"
        />
        <q-btn
          flat
          color="grey-7"
          label="Forgot your password?"
          class="link-button"
          @click="$emit('forgot-password')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { UserLogin } from '@/api/model';

const emit = defineEmits<{
  'login-success': []
  'switch-to-register': []
  'forgot-password': []
}>();

const authStore = useAuthStore();

const form = ref<UserLogin>({
  email: '',
  password: '',
});

const showPassword = ref(false);

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
</script>

<style scoped>
.login-form {
  width: 100%;
}

.form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: left;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-field {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  color: #111827;
  background: #ffffff;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: #9ca3af;
}


.password-toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.password-toggle:hover {
  color: #6b7280;
}

.error-message {
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
  text-align: left;
}

.form-actions {
  margin-top: 8px;
}

.submit-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-transform: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.divider {
  position: relative;
  text-align: center;
  margin: 32px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider-text {
  background: white;
  padding: 0 16px;
  color: #718096;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.social-login {
  margin-bottom: 24px;
}

.social-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  text-transform: none;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.social-button:hover {
  border-color: #cbd5e0;
  background: #f8fafc;
  transform: translateY(-1px);
}

.form-footer {
  text-align: center;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-button {
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.link-button:hover {
  background: #f8fafc;
}

/* Responsive Design */
@media (max-width: 480px) {
  .form-container {
    gap: 20px;
  }
  
  .submit-button,
  .social-button {
    height: 44px;
    font-size: 15px;
  }
  
  .divider {
    margin: 24px 0;
  }
}
</style>
