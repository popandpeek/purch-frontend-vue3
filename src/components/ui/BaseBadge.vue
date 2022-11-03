<template>
  <span
    class="badge"
    :class="type"
  >
    {{ text }}
  </span>
</template>

<script>
export default {
    props: ["type", "title"],
    computed: {
        text() {
            return this.title.toUpperCase();
        }
    }
}
</script>

<style scoped>
.badge {
  @import url('https://fonts.googleapis.com/css?family=Proza+Libre');
  font-family: 'Proza Libre', sans-serif;
  background-color: #ccc;
  color: #3D008D;
  border-radius: 30px;
  padding: 0.5rem 1.5rem;
  display: inline-block;
  margin-right: 0.5rem;
}

.frontend {
  background-color: #3d008d;
  color: white;
}

.backend {
  background-color: #71008d;
  color: white;
}

.career {
  background-color: #8d006e;
  color: white;
}
</style>
