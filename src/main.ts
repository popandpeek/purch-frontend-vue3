import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from 'vue-query';
import { router } from "./router";
import App from "./App.vue";
import BaseCard from './components/ui/BaseCard.vue';
import BaseButton from './components/ui/BaseButton.vue';
import BaseBadge from './components/ui/BaseBadge.vue';
import BaseInputListItem from './components/ui/BaseInputListItem.vue'


const app = createApp(App);
app.use(createPinia());
app.use(router);

app.component('BaseCard', BaseCard);
app.component('BaseButton', BaseButton);
app.component('BaseBadge', BaseBadge);
app.component('BaseInputListItem', BaseInputListItem);

app.mount("#app");
