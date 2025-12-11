import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import VueKonva from 'vue-konva';
import 'vue-sonner/style.css';
import 'floating-vue/dist/style.css';
import 'vue-final-modal/style.css';

import { createVfm } from 'vue-final-modal';

const app = createApp(App);
const pinia = createPinia();
const vfm = createVfm();

app.use(pinia).use(VueKonva).use(vfm).mount('#app');
