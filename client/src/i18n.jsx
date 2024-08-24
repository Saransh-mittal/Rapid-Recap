import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/screens/{{ns}}.json',
    },
    fallbackLng: 'en',
    ns: [
      'Home',
      'Contact',
      'LeaderBoard',
      'Profile',
      'Register',
      'Season',
      'SignIn',
    ], // List all the namespaces (files) you want to load
    defaultNS: 'Contact', // Default namespace to use if not specified
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
