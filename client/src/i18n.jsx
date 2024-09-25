import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

const namespaces = {
  screens: [
    'Contact',
    'Home',
    'LeaderBoard',
    'Profile',
    'Register',
    'Signin',
    'Tournament',
    'Quiz',
    'ComingSoonTournament',
  ],
  utils: ['formatDate'],
  categories: ['categories'],
  articleComponents: [
    'ArticleHeader',
    'AuthorInfo',
    'BoostSection',
    'GivenQuiz',
    'QuinBoostModal',
    'QuizExpired',
    'RelatedArticlesToggle',
    'ShareButton',
    'Sidebar',
    'TakeQuizButton',
    'TotalUserAttempted',
    'TrackTime',
  ],
  tournamentComponents: [
    'EpicQuestGuide',
    'CategoryCard',
    'CategorySelection',
    'LeaderboardSearch',
    'LeaderboardSection',
    'LeaderboardTable',
    'PreviousTournamentLeaderboard',
    'RegisteredUsersCount',
    'RegistrationForm',
    'RegistrationSection',
    'TimeInfo',
    'TournamentGuideModal',
    'TournamentHeader',
    'TournamentStatus',
    'UserStatsModal',
    'CategoryLeaders',
    'LeaderCard',
    'QuizConfirmationModal',
    'ShutterAnimation',
    'TournamentQuiz',
  ],
  quizComponents: [
    'BoostedSubmittedQuizInterface',
    'ConfirmationModal',
    'GivenQuizInterface',
    'InstructionModal',
    'ModalComponent',
    'QuinBoost',
    'QuizGivenSummary',
    'QuizInterface',
    'SubmittedQuizInterface',
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
    'XPLevelModal',
    'LogoutButton',
  ],
  homeComponents: ['SearchBarInput', 'Timeline', 'UpgradeModal', 'Card'],
  leaderBoardComponents: ['LeaderBoardTable', 'SearchBar', 'LeaderBoardRow'],
  miscellaneous: [
    'UserSearchDrawer',
    'SecureYourProgress',
    'NoteMessageSummary',
    'ButtonFactory',
    'milestones',
    'StreakNoteMessage',
    'TournamentNoteMessage',
    'XPAwardNoteMessage',
    'DifficultyLegend',
    'NoteMessageQueue',
    'UnifiedFeedbackNoteMessage',
  ],
  Notifications: ['NotificationSubscription'],
  streakComponents: ['DailyStreakModal'],
  profileComponents: [
    'Bookmarks',
    'EditProfileModal',
    'IQBarGraph',
    'LineGraph',
    'LeftProfileBox',
    'ProfileButton',
    'ProfileDropDownMenu',
    'ProfileExperienceLevel',
    'RankAndSociety',
    'SeasonModal',
    'SeasonSelectorModal',
    'SolvedQuizzes',
    'Settings',
    'ToggleProfileVisibility',
    'BrainModal',
    'CircleModal',
    'SolvedQuizHistory',
    'FriendItem',
    'FriendRequestItem',
    'EnhancedSocietyCircle',
    'WiseWeb',
    'TournamentSection',
    'TournamentSelectorDrawer',
    'TournamentModal',
    'LastTournamentRank',
  ],
  assets: ['Circles', 'Brains', 'CircleAndSocietyData'],
  main: ['App'],
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
          case 'tournamentComponents':
            return `/locales/${lng}/components/tournamentComponents/${namespace}.json`
          case 'quizComponents':
            return `/locales/${lng}/components/quizComponents/${namespace}.json`
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
          case 'Notifications':
            return `/locales/${lng}/components/Notifications/${namespace}.json`
          case 'streakComponents':
            return `/locales/${lng}/components/streakComponents/${namespace}.json`
          case 'profileComponents':
            return `/locales/${lng}/components/profileComponents/${namespace}.json`
          case 'assets':
            return `/locales/${lng}/assets/${namespace}.json`
          case 'categories':
            return `/locales/${lng}/categories/${namespace}.json`
          case 'main':
            return `/locales/${lng}/main/${namespace}.json`
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
