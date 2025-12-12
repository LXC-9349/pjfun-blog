// 国际化工具
import { I18N_CONFIG } from '@/constants'

type Language = 'zh' | 'en'
type TranslationKey = keyof typeof I18N_CONFIG.zh

let currentLang: Language = 'zh'

export function setLanguage(lang: Language) {
  currentLang = lang
  localStorage.setItem('language', lang)
}

export function getLanguage(): Language {
  const savedLang = localStorage.getItem('language') as Language | null
  if (savedLang) {
    return savedLang
  }
  
  // 根据浏览器语言设置默认语言
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('en')) {
    return 'en'
  }
  return 'zh'
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const translations = I18N_CONFIG[currentLang as keyof typeof I18N_CONFIG]
  let translation = translations[key as keyof typeof translations] || key
  
  // 处理参数替换
  if (params) {
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, String(params[param]))
    })
  }
  
  return translation
}

// 初始化语言
currentLang = getLanguage()