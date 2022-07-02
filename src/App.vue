<template>
  <the-header />
  <router-view />
</template>

<script>
import TheHeader from './components/layout/TheHeader.vue';

export default {
  components: {
    TheHeader
  },
  data() {
    return {
      Users: [
        {
          id: '11111',
          name: 'Bob Rossman',
          company: 'Arlington Peach Grill',
          email: 'bob@arlington-peach.com',
          phone: '123-456-7890',
          admin: true,
        },
      ]
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

* {
  box-sizing: border-box;
}

html {
  font-family: "Roboto", sans-serif;
}

body {
  margin: 0;
}
</style>