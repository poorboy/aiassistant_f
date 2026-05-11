import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", name: "Chat", component: () => import("../views/ChatView.vue") },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/SettingsView.vue"),
  },
  {
    path: "/help",
    name: "Help",
    component: () => import("../views/HelpView.vue"),
  },

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
