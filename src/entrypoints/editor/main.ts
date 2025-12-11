import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import VueKonva from 'vue-konva';
import 'vue-sonner/style.css';
import 'floating-vue/dist/style.css';
import 'vue-final-modal/style.css';

import { createVfm } from 'vue-final-modal';

const vfm = createVfm();

createApp(App).use(VueKonva).use(vfm).mount('#app');
