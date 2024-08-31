import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

const namespaces = {
  screens: ['Contact', 'Home', 'LeaderBoard', 'Profile', 'Register', 'Signin'],
  utils: ['formatDate'],
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
  authComponents: [
    'EmailVerify',
    'GuestLogin',
    'GuestLoginModal',
    'ResetPassword',
  ],
  contactComponents: ['FeedbackModal'],
  chatComponent: [
    'userChats',
    'ChatSideDrawer',
    'UserListItem',
    'MessageReactions',
    'ReactionModal',
    'BookmarksModal',
    'ChatHeader',
    'DeleteMessageModal',
    'MessageRequestComponent',
    'ContextMenu',
    'ShareChatModal',
    'SingleChat',
    'MessageInput',
  ],
  getStartedComponents: [
    'heroSection',
    'whyToUseSection',
    'commingSoonSection',
  ],
  headerFooter: [
    'HamburgerModal',
    'NotificationDrawer',
    'IQScoreModal',
    'NavbarContent',
    'OutsideNavbarContent',
    'Navbar',
    'NavBrand',
  ],
  homeComponents: ['SearchBarInput', 'Timeline', 'UpgradeModal', 'Card'],
  leaderBoardComponents: ['LeaderBoardTable', 'SearchBar'],
  miscellaneous: [
    'UserSearchDrawer',
    'SecureYourProgress',
    'NoteMessageSummary',
    'ButtonFactory',
    'milestones',
    'StreakNoteMessage',
    'XPAwardNoteMessage',
  ],
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
          case 'utils':
            return `/locales/${lng}/utils/${namespace}.json`
          case 'articleComponents':
            return `/locales/${lng}/components/articleComponents/${namespace}.json`
          case 'authComponents':
            return `/locales/${lng}/components/authComponents/${namespace}.json`
          case 'contactComponents':
            return `/locales/${lng}/components/contactComponents/${namespace}.json`
          case 'chatComponent':
            return `/locales/${lng}/components/chatComponent/${namespace}.json`
          case 'getStartedComponents':
            return `/locales/${lng}/components/getStartedComponents/${namespace}.json`
          case 'headerFooter':
            return `/locales/${lng}/components/headerFooter/${namespace}.json`
          case 'homeComponents':
            return `/locales/${lng}/components/homeComponents/${namespace}.json`
          case 'leaderBoardComponents':
            return `/locales/${lng}/components/leaderBoardComponents/${namespace}.json`
          case 'miscellaneous':
            return `/locales/${lng}/components/miscellaneous/${namespace}.json`
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
