<template>
  <div class="container">
    <slot />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 12px;
  padding: 1rem;
  margin: 2rem auto;
  max-width: 40rem;
  border: 1px solid black;
}
</style>