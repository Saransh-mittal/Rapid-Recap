import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

const namespaces = {
  screens: ['Contact', 'Home', 'LeaderBoard', 'Profile', 'Register', 'Signin'],
  categories: ['categories'],
  articleComponents: [
    'ArticleHeader',
    'AuthorInfo',
    'BoostSection',
    'BoostedSubmittedQuizInterface',
    'ConfirmationModal',
    'ExpectedIQModal',
    'GivenQuiz',
    'GivenQuizInterface',
    'InstructionModal',
    'ModalComponent',
    'QuinBoost',
    'QuinBoostModal',
    'Quiz',
    'QuizExpired',
    'QuizGivenSummary',
    'QuizInterface',
    'RelatedArticlesToggle',
    'ShareButton',
    'Sidebar',
    'SubmittedQuizInterface',
    'TakeQuizButton',
    'TotalUserAttempted',
  ],
  authComponents: [],
  homeComponents: [],
  leaderBoardComponents: [],
}

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: (lngs, ns) => {
        const lng = Array.isArray(lngs) ? lngs[0] : lngs
        const namespace = Array.isArray(ns) ? ns[0] : ns
        const category = Object.keys(namespaces).find(key =>
          namespaces[key].includes(namespace),
        )

        switch (category) {
          case 'screens':
            return `/locales/${lng}/screens/${namespace}.json`
          case 'articleComponents':
            return `/locales/${lng}/components/articleComponents/${namespace}.json`
          case 'authComponents':
            return `/locales/${lng}/components/authComponents/${namespace}.json`
          case 'homeComponents':
            return `/locales/${lng}/components/homeComponents/${namespace}.json`
          case 'leaderBoardComponents':
            return `/locales/${lng}/components/leaderBoardComponents/${namespace}.json`
          case 'categories':
            return `/locales/${lng}/categories/${namespace}.json`
          default:
            return `/locales/${lng}/${namespace}.json` // fallback
        }
      },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    ns: Object.values(namespaces).flat(),
    defaultNS: 'Contact',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n
