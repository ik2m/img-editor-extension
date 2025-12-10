import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import VueKonva from 'vue-konva';
import 'vue-sonner/style.css';
import 'floating-vue/dist/style.css';

createApp(App).use(VueKonva).mount('#app');
