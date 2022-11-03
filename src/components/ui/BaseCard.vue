<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  @import url('https://fonts.googleapis.com/css?family=Proza+Libre');
  font-family: 'Proza Libre', sans-serif;
  color: #3D008D;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 1rem;
  margin: 2rem auto;
  max-width: 40rem;
}
</style>