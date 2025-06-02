import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import { useDark } from "@vueuse/core";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

useDark();

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.mount("#app");
