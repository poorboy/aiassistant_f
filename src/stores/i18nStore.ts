import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import en from '../locales/en'
import zh from '../locales/zh'
import ja from '../locales/ja'

type LocaleKey = keyof typeof en
type Locales = Record<string, Record<LocaleKey, string>>

const locales: Locales = { en, zh, ja }

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref(localStorage.getItem('locale') || 'zh')

  function setLocale(l: string) {
    locale.value = l
    localStorage.setItem('locale', l)
  }

  const t = computed(() => {
    const dict = locales[locale.value] || locales['zh']
    return (key: LocaleKey, params?: Record<string, string>) => {
      let s = dict[key]
      if (s === undefined) s = locales['en'][key] || key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replace(`{${k}}`, v)
        }
      }
      return s
    }
  })

  return { locale, setLocale, t }
})
