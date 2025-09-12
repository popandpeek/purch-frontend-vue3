<template>
  <div class="password-reset-form">
    
    <q-form @submit="handleResetPassword" class="form-container">
      <div class="input-group">
        <label class="input-label">Email Address</label>
        <div class="input-wrapper">
          <input
            v-model="email"
            type="email"
            class="input-field"
            placeholder="Enter your email"
            required
          />
        </div>
        <div v-if="email && !isValidEmail(email)" class="error-message">
          Please enter a valid email address
        </div>
      </div>
      
      <div class="form-actions">
        <q-btn
          type="submit"
          color="primary"
          label="Send Reset Instructions"
          class="submit-button"
          :loading="authStore.loading"
          size="lg"
        />
      </div>
    </q-form>
    
    <div class="reset-info">
      <p class="info-text">
        We'll send you a link to reset your password. Check your email and follow the instructions.
      </p>
    </div>
    
    <div class="form-footer">
      <div class="footer-links">
        <q-btn
          flat
          color="primary"
          label="Back to Sign In"
          class="link-button"
          @click="$emit('back-to-login')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const emit = defineEmits<{
  'reset-sent': []
  'back-to-login': []
}>();

const authStore = useAuthStore();
const email = ref('');

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleResetPassword = async () => {
  try {
    await authStore.resetPassword(email.value);
    // Show success message
    emit('reset-sent');
  } catch (error) {
    // Error is handled in the store
  }
};
</script>

<style scoped>
.password-reset-form {
  width: 100%;
  text-align: center;
}


.form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 32px;
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

.reset-info {
  margin: 32px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-text {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
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
  
  .submit-button {
    height: 44px;
    font-size: 15px;
  }
  
  
  .reset-info {
    margin: 24px 0;
    padding: 16px;
  }
}
</style>
