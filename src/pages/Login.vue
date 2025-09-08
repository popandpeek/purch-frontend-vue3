<template>
  <form @submit.prevent="onSubmit">
    <div class="form-group my-2">
      <label>Username</label>
      <input v-model="form.username" class="form-control" type="text" placeholder="email@address.com" required />
    </div>
    <div class="form-group my-2">
      <label>Password</label>
      <input v-model="form.password" class="form-control" type="password" placeholder="Password" required />
    </div>
    <div class="text-danger my-2">{{ authStore.error }}</div>
    <base-button class="btn btn-success btn-block my-2" type="submit">Login</base-button>
  </form>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { reactive } from '@vue/reactivity';


const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

function onSubmit() {
  authStore.login(form.username, form.password);
  form.username = ''
  form.password = ''
}
</script>

<style scoped>
form {
  text-align: center;
  margin: 0 auto;
  width: 250px;
}
div {
  text-align: left;
  margin: 2em;
}
</style>