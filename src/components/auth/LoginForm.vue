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
