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

/* Global Button Styling for Uniformity */
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  min-height: 2rem;
  background: #f8f9fa;
  color: #6c757d;
  font-family: inherit;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: #e9ecef;
  color: #495057;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Button variants */
.btn--ghost {
  background: transparent;
  color: #6c757d;
  border-color: #e9ecef;
}

.btn--ghost:hover {
  background: #f8f9fa;
  color: #495057;
}

.btn--secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn--secondary:hover {
  background: #5a6268;
  border-color: #5a6268;
}

.btn--primary {
  background: #3d008d;
  color: white;
  border-color: #3d008d;
}

.btn--primary:hover {
  background: #270041;
  border-color: #270041;
}

.btn--danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.btn--danger:hover {
  background: #c82333;
  border-color: #bd2130;
}

.btn--tertiary {
  background: transparent;
  color: #3d008d;
  border-color: transparent;
}

.btn--tertiary:hover {
  background: #f3e8ff;
  color: #270041;
}

.btn--success {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn--success:hover {
  background: #218838;
  border-color: #1e7e34;
}

/* Button sizes */
.btn--xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-height: 1.5rem;
}

.btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  min-height: 1.75rem;
}

.btn--md {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.btn--lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 2.5rem;
}

.btn--xl {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 3rem;
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 0;
  }
}
</style>