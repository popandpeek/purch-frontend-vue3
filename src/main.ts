import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from "./router";
import App from "./App.vue";
import BaseCard from './components/ui/BaseCard.vue';
import BaseButton from './components/ui/BaseButton.vue';
import BaseBadge from './components/ui/BaseBadge.vue';
import BaseInputListItem from './components/ui/BaseInputListItem.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import { useAuthStore } from '@/stores/auth';

// Import design system styles
// import '@/shared/design-system/styles/index.scss';

// Initialize dependency injection
import { initializeServices } from '@/shared/container/registerServices';

const app = createApp(App).use(Quasar, quasarUserOptions);
const pinia = createPinia();
app.use(pinia);
app.use(router);

app.component('BaseCard', BaseCard);
app.component('BaseButton', BaseButton);
app.component('BaseBadge', BaseBadge);
app.component('BaseInputListItem', BaseInputListItem);

// Initialize services
initializeServices({
  apiBaseUrl: (import.meta as any).env?.VUE_APP_API_URL || 'http://localhost:8000/api/v1'
});

app.mount("#app");

// Initialize auth store after app is mounted
(async () => {
  try {
    const authStore = useAuthStore();
    await authStore.initializeAuth();
  } catch (error) {
    console.error('Failed to initialize auth store:', error);
  }
})();
