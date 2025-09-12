<template>
  <div class="app">
    <mobile-navigation />
    <desktop-navigation />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import MobileNavigation from './components/layout/MobileNavigation.vue';
import DesktopNavigation from './components/layout/DesktopNavigation.vue';

export default {
  components: {
    MobileNavigation,
    DesktopNavigation
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');

html, body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 0;
  }
}
</style>