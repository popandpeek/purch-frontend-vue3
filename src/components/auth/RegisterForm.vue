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
      
      <q-separator class="q-my-md" />
      
      <q-btn
        color="secondary"
        icon="fab fa-google"
        label="Sign up with Google"
        class="full-width"
        :loading="authStore.loading"
        @click="handleGoogleSignIn"
      />
      
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

const handleGoogleSignIn = async () => {
  try {
    await authStore.signInWithGoogle();
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
