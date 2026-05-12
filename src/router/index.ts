import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", name: "Chat", component: () => import("../views/ChatView.vue") },
  {
    path: "/mcp",
    name: "MCP",
    component: () => import("../views/MCPView.vue"),
  },
  {
    path: "/prompts",
    name: "Prompts",
    component: () => import("../views/PromptManageView.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/SettingsView.vue"),
  },
  {
    path: "/model-settings",
    name: "ModelSettings",
    component: () => import("../views/ModelSettingsView.vue"),
  },
  {
    path: "/user-prompts",
    name: "UserPrompts",
    component: () => import("../views/UserPromptView.vue"),
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
