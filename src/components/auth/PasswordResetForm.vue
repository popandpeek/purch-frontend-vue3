<template>
  <q-card class="password-reset-card">
    <q-card-section>
      <div class="text-h6 text-center q-mb-md">Reset Password</div>
      
      <q-form @submit="handleResetPassword" class="q-gutter-md">
        <q-input
          v-model="email"
          label="Email"
          type="email"
          :rules="[val => !!val || 'Email is required', val => isValidEmail(val) || 'Invalid email']"
          outlined
        />
        
        <q-btn
          type="submit"
          color="primary"
          label="Send Reset Email"
          class="full-width"
          :loading="authStore.loading"
        />
      </q-form>
      
      <div class="text-center q-mt-md">
        <q-btn
          flat
          color="primary"
          label="Back to Login"
          @click="$emit('back-to-login')"
        />
      </div>
    </q-card-section>
  </q-card>
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
