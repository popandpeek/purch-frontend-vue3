import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from 'vue-query';

import router from "./router.js";
// import pinia from "./store/index.js";
import App from "./App.vue";
import BaseCard from './components/ui/BaseCard.vue';
import BaseButton from './components/ui/BaseButton.vue';
import BaseBadge from './components/ui/BaseBadge.vue';
import BaseInputListItem from './components/ui/BaseInputListItem.vue'

import bootstrapCSS from "bootstrap/dist/css/bootstrap.css";
import bootsrapVue from "bootstrap-vue/dist/bootstrap-vue.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin)
app.use(bootstrapCSS);
app.use(bootsrapVue);

app.component('BaseCard', BaseCard);
app.component('BaseButton', BaseButton);
app.component('BaseBadge', BaseBadge);
app.component('BaseInputListItem', BaseInputListItem);

app.mount("#app");
