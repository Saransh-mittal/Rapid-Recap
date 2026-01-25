// src/i18n.jsx - FIXED VERSION for Bundled Translations
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Create a custom backend that loads bundled files once and caches them
class BundledBackend {
  constructor() {
    this.type = 'backend'
    this.cache = new Map()
    this.bundleCache = new Map()
    this.loadingPromises = new Map()
  }

  init(services, backendOptions, i18nextOptions) {
    this.services = services
    this.options = backendOptions || {}
  }

  read(language, namespace, callback) {
    const cacheKey = `${language}-${namespace}`

    // Return cached namespace data if available
    if (this.cache.has(cacheKey)) {
      callback(null, this.cache.get(cacheKey))
      return
    }

    // If already loading this bundle, wait for it
    const bundleKey = language
    if (this.loadingPromises.has(bundleKey)) {
      this.loadingPromises
        .get(bundleKey)
        .then(() => {
          const data = this.extractNamespaceData(language, namespace)
          this.cache.set(cacheKey, data)
          callback(null, data)
        })
        .catch(callback)
      return
    }

    // Load the entire bundle for this language
    const loadPromise = this.loadBundle(language)
      .then(bundleData => {
        this.bundleCache.set(bundleKey, bundleData)
        this.loadingPromises.delete(bundleKey)

        const data = this.extractNamespaceData(language, namespace)
        this.cache.set(cacheKey, data)
        return data
      })
      .catch(error => {
        this.loadingPromises.delete(bundleKey)
        throw error
      })

    this.loadingPromises.set(bundleKey, loadPromise)

    loadPromise.then(
      data => callback(null, data),
      error => callback(error),
    )
  }

  async loadBundle(language) {
    const bundleKey = language

    // Return cached bundle if available
    if (this.bundleCache.has(bundleKey)) {
      return this.bundleCache.get(bundleKey)
    }

    try {
      const response = await fetch(`/locales/bundled/${language}/all.json`)
      if (!response.ok) {
        throw new Error(`Failed to load ${language} bundle: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error loading bundle for ${language}:`, error)
      throw error
    }
  }

  extractNamespaceData(language, namespace) {
    const bundleData = this.bundleCache.get(language)
    if (!bundleData) return {}

    // Handle the bundled structure
    // First try exact match
    if (bundleData[namespace]) {
      return bundleData[namespace]
    }

    // Then try to find namespace in nested structure
    // Look for patterns like "components.headerFooter.NavBrand"
    const possibleKeys = [
      namespace,
      `screens.${namespace}`,
      `components.headerFooter.${namespace}`,
      `components.homeComponents.${namespace}`,
      `components.authComponents.${namespace}`,
      `components.quizComponents.${namespace}`,
      `components.tournamentComponents.${namespace}`,
      `components.profileComponents.${namespace}`,
      `components.miscellaneous.${namespace}`,
      `components.chatComponent.${namespace}`,
      `components.leaderBoardComponents.${namespace}`,
      `components.contactComponents.${namespace}`,
      `components.articleComponents.${namespace}`,
      `components.streakComponents.${namespace}`,
      `components.rewards.${namespace}`,
      `components.gameHub.${namespace}`,
      `components.HallOfChampions.${namespace}`,
      `components.Notifications.${namespace}`,
      `redux.${namespace}`,
      `utils.${namespace}`,
      `categories.${namespace}`,
      `assets.${namespace}`,
      `main.${namespace}`,
    ]

    for (const key of possibleKeys) {
      if (bundleData[key]) {
        return bundleData[key]
      }
    }

    // If still not found, search all keys for partial matches
    const keys = Object.keys(bundleData)
    const matchingKey = keys.find(
      key => key.endsWith(`.${namespace}`) || key === namespace,
    )

    if (matchingKey && bundleData[matchingKey]) {
      return bundleData[matchingKey]
    }

    console.warn(
      `Namespace '${namespace}' not found in ${language} bundle. Available keys:`,
      keys.slice(0, 10),
    )
    return {}
  }
}

// All your existing namespaces
const namespaces = [
  'Contact',
  'Home',
  'LeaderBoard',
  'Profile',
  'Register',
  'Signin',
  'Tournament',
  'Quiz',
  'ComingSoonTournament',
  'GetStarted',
  'LoadingScreen',
  'OnboardingProcess',
  'rulebook',
  'QuickClash',
  'AppStartScreen',
  'tournamentSlice',
  'formatDate',
  'categories',
  'tournamentCategories',
  'ArticleHeader',
  'AuthorInfo',
  'BoostSection',
  'GivenQuiz',
  'QuinBoostModal',
  'StreakSurgeModal',
  'CategoryBoostModal',
  'QuizExpired',
  'RelatedArticlesToggle',
  'ShareButton',
  'Sidebar',
  'TakeQuizButton',
  'TotalUserAttempted',
  'TrackTime',
  'GameHub',
  'rewards',
  'GameInventory',
  'BadgesSection',
  'TournamentLoadingScreen',
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
  'TournamentBadge',
  'BoostedSubmittedQuizInterface',
  'ConfirmationModal',
  'GivenQuizInterface',
  'InstructionModal',
  'ModalComponent',
  'QuinBoost',
  'QuizGivenSummary',
  'QuizInterface',
  'SubmittedQuizInterface',
  'EmailVerify',
  'GuestLogin',
  'GuestLoginModal',
  'ResetPassword',
  'FeedbackModal',
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
  'HamburgerModal',
  'NotificationDrawer',
  'IQScoreModal',
  'NavbarContent',
  'OutsideNavbarContent',
  'Navbar',
  'NavBrand',
  'XPLevelModal',
  'LogoutButton',
  'SearchBarInput',
  'Timeline',
  'UpgradeModal',
  'Card',
  'LeaderBoardTable',
  'SearchBar',
  'LeaderBoardRow',
  'UserSearchDrawer',
  'SecureYourProgress',
  'NoteMessageSummary',
  'NoteMessageQueue',
  'ButtonFactory',
  'milestones',
  'StreakNoteMessage',
  'TournamentNoteMessage',
  'XPAwardNoteMessage',
  'DifficultyLegend',
  'UnifiedFeedbackNoteMessage',
  'ProfileBox',
  'NotificationSubscription',
  'DailyStreakModal',
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
  'TournamentBadgeGallery',
  'ChampionDetailsModal',
  'Circles',
  'Brains',
  'CircleAndSocietyData',
  'App',
]

i18n
  .use(new BundledBackend())
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    ns: namespaces,
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

    // Performance optimizations
    load: 'languageOnly',
    cleanCode: true,
    nonExplicitSupportedLngs: false,
    initImmediate: false,
  })

export default i18n
