import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<Record<string, string>>({
    "deepseek.api_key": "",
    "deepseek.base_url": "https://api.deepseek.com",
    "deepseek.model": "deepseek-v4-flash",
  });

  function set(key: string, value: string) {
    settings.value[key] = value;
  }

  function setAll(data: Record<string, string>) {
    settings.value = { ...settings.value, ...data };
  }

  return { settings, set, setAll };
});
