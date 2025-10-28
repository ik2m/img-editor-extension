import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import VueKonva from "vue-konva";

createApp(App).use(VueKonva).mount('#app');