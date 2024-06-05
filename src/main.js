import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueCryptojs from 'vue-cryptojs';
import timeago from 'vue-timeago3'
import InputColorPicker from "./components/modules/InputColorPicker.vue";
const app = createApp(App);

app.use(router);
app.use(store);
app.use(VueCryptojs);
app.use(timeago);

app.use(InputColorPicker);
app.mount('#app');

store.dispatch('init');
store.dispatch('ui');