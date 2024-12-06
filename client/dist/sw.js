const VERSION = 'v8.1'
const CACHE_NAME = `rapid-recap-${VERSION}`
const ASSETS_CACHE = `assets-${VERSION}`
const DYNAMIC_CACHE = `dynamic-${VERSION}`

const RapidRecapLogo = './images/rrlogo.webp'
const RapidRecapBadge = './images/rrlogo_badge.png'
const IS_DEVELOPMENT = false
// location.hostname === 'localhost' || location.hostname === '127.0.0.1'

// Add list of domains that should never be cached
const NEVER_CACHE_DOMAINS = [
  'www.google-analytics.com',
  'analytics.google.com',
  'www.googletagmanager.com',
  'stats.g.doubleclick.net',
]

// Function to get all files from a directory with specific extensions
const getFilesFromPublicDirectory = async () => {
  try {
    // We can't directly access filesystem, so we need to maintain a list of paths
    const imageFiles = [
      './images/rrlogo.webp',
      './images/rrlogo_512.png',
      './images/rrlogo_badge.png',
      './images/tourBGDark.webp',
      './images/landingPage/articleUI.webp',
      './images/landingPage/featureBg.webp',
      './images/landingPage/featureBgMobile.webp',
      './images/landingPage/homeUI.webp',
      './images/landingPage/QuizReportUI.webp',
      './images/landingPage/quizUI.webp',
      './images/landingPage/tournamentUI.webp',
      // Add paths of other images you want to cache
    ]

    return imageFiles
  } catch (error) {
    console.error('Error getting image files:', error)
    return []
  }
}
// Assets that should be cached immediately
const STATIC_ASSETS = [
  // Original paths
  '/',
  './index.html',
  './manifest.json',
  './splash.html',
  './styles/main.css',
  './styles/utils/reset.css',
  './styles/utils/variables.css',
  './styles/utils/responsive.css',
  './styles/components/css-article.css',
  './styles/components/css-benefits.css',
  './styles/components/css-features.css',
  './styles/components/css-footer.css',
  './styles/components/css-hero.css',
  './styles/components/css-navigation.css',
  './styles/components/css-sections.css',
  './styles/components/css-splash.css',

  // Article Components
  './locales/en/components/articleComponents/ArticleHeader.json',
  './locales/en/components/articleComponents/AuthorInfo.json',
  './locales/en/components/articleComponents/BoostSection.json',
  './locales/en/components/articleComponents/GivenQuiz.json',
  './locales/en/components/articleComponents/QuinBoostModal.json',
  './locales/en/components/articleComponents/QuizExpired.json',
  './locales/en/components/articleComponents/RelatedArticlesToggle.json',
  './locales/en/components/articleComponents/ShareButton.json',
  './locales/en/components/articleComponents/Sidebar.json',
  './locales/en/components/articleComponents/TakeQuizButton.json',
  './locales/en/components/articleComponents/TotalUserAttempted.json',
  './locales/en/components/articleComponents/TrackTime.json',

  // Auth Components
  './locales/en/components/authComponents/EmailVerify.json',
  './locales/en/components/authComponents/GuestLogin.json',
  './locales/en/components/authComponents/GuestLoginModal.json',
  './locales/en/components/authComponents/ResetPassword.json',

  // Chat Components
  './locales/en/components/chatComponent/BookmarksModal.json',
  './locales/en/components/chatComponent/ChatHeader.json',
  './locales/en/components/chatComponent/ChatSideDrawer.json',
  './locales/en/components/chatComponent/ContextMenu.json',
  './locales/en/components/chatComponent/DeleteMessageModal.json',
  './locales/en/components/chatComponent/MessageInput.json',
  './locales/en/components/chatComponent/MessageReactions.json',
  './locales/en/components/chatComponent/MessageRequestComponent.json',
  './locales/en/components/chatComponent/ReactionModal.json',
  './locales/en/components/chatComponent/ShareChatModal.json',
  './locales/en/components/chatComponent/SingleChat.json',
  './locales/en/components/chatComponent/userChats.json',
  './locales/en/components/chatComponent/UserListItem.json',

  // Contact Components
  './locales/en/components/contactComponents/FeedbackModal.json',

  // Header Footer Components
  './locales/en/components/headerFooter/HamburgerModal.json',
  './locales/en/components/headerFooter/IQScoreModal.json',
  './locales/en/components/headerFooter/LogoutButton.json',
  './locales/en/components/headerFooter/Navbar.json',
  './locales/en/components/headerFooter/NavbarContent.json',
  './locales/en/components/headerFooter/NavBrand.json',
  './locales/en/components/headerFooter/NotificationDrawer.json',
  './locales/en/components/headerFooter/OutsideNavbarContent.json',
  './locales/en/components/headerFooter/XPLevelModal.json',

  // Home Components
  './locales/en/components/homeComponents/Card.json',
  './locales/en/components/homeComponents/SearchBarInput.json',
  './locales/en/components/homeComponents/Timeline.json',
  './locales/en/components/homeComponents/UpgradeModal.json',

  // Leaderboard Components
  './locales/en/components/leaderBoardComponents/LeaderBoardRow.json',
  './locales/en/components/leaderBoardComponents/LeaderBoardTable.json',
  './locales/en/components/leaderBoardComponents/SearchBar.json',

  // Miscellaneous Components
  './locales/en/components/miscellaneous/ButtonFactory.json',
  './locales/en/components/miscellaneous/DifficultyLegend.json',
  './locales/en/components/miscellaneous/milestones.json',
  './locales/en/components/miscellaneous/NoteMessageSummary.json',
  './locales/en/components/miscellaneous/ProfileBox.json',
  './locales/en/components/miscellaneous/SecureYourProgress.json',
  './locales/en/components/miscellaneous/StreakNoteMessage.json',
  './locales/en/components/miscellaneous/TournamentNoteMessage.json',
  './locales/en/components/miscellaneous/UnifiedFeedbackNoteMessage.json',
  './locales/en/components/miscellaneous/UserSearchDrawer.json',
  './locales/en/components/miscellaneous/XPAwardNoteMessage.json',

  // Notifications
  './locales/en/components/Notifications/NotificationSubscription.json',

  // Profile Components
  './locales/en/components/profileComponents/Bookmarks.json',
  './locales/en/components/profileComponents/BrainModal.json',
  './locales/en/components/profileComponents/CircleModal.json',
  './locales/en/components/profileComponents/EditProfileModal.json',
  './locales/en/components/profileComponents/EnhancedSocietyCircle.json',
  './locales/en/components/profileComponents/FriendItem.json',
  './locales/en/components/profileComponents/FriendRequestItem.json',
  './locales/en/components/profileComponents/IQBarGraph.json',
  './locales/en/components/profileComponents/LastTournamentRank.json',
  './locales/en/components/profileComponents/LeftProfileBox.json',
  './locales/en/components/profileComponents/LineGraph.json',
  './locales/en/components/profileComponents/ProfileButton.json',
  './locales/en/components/profileComponents/ProfileDropDownMenu.json',
  './locales/en/components/profileComponents/ProfileExperienceLevel.json',
  './locales/en/components/profileComponents/RankAndSociety.json',
  './locales/en/components/profileComponents/SeasonModal.json',
  './locales/en/components/profileComponents/SeasonSelectorModal.json',
  './locales/en/components/profileComponents/Settings.json',
  './locales/en/components/profileComponents/SolvedQuizHistory.json',
  './locales/en/components/profileComponents/SolvedQuizzes.json',
  './locales/en/components/profileComponents/ToggleProfileVisibility.json',
  './locales/en/components/profileComponents/TournamentBadgeGallery.json',
  './locales/en/components/profileComponents/TournamentModal.json',
  './locales/en/components/profileComponents/TournamentSection.json',
  './locales/en/components/profileComponents/TournamentSelectorDrawer.json',
  './locales/en/components/profileComponents/WiseWeb.json',
  // Quiz Components
  './locales/en/components/quizComponents/BoostedSubmittedQuizInterface.json',
  './locales/en/components/quizComponents/ConfirmationModal.json',
  './locales/en/components/quizComponents/GivenQuizInterface.json',
  './locales/en/components/quizComponents/InstructionModal.json',
  './locales/en/components/quizComponents/ModalComponent.json',
  './locales/en/components/quizComponents/QuinBoost.json',
  './locales/en/components/quizComponents/QuizGivenSummary.json',
  './locales/en/components/quizComponents/QuizInterface.json',
  './locales/en/components/quizComponents/SubmittedQuizInterface.json',

  // Streak Components
  './locales/en/components/streakComponents/DailyStreakModal.json',

  // Tournament Components
  './locales/en/components/tournamentComponents/CategoryCard.json',
  './locales/en/components/tournamentComponents/CategoryLeaders.json',
  './locales/en/components/tournamentComponents/CategorySelection.json',
  './locales/en/components/tournamentComponents/EpicQuestGuide.json',
  './locales/en/components/tournamentComponents/LeaderboardSearch.json',
  './locales/en/components/tournamentComponents/LeaderboardSection.json',
  './locales/en/components/tournamentComponents/LeaderboardTable.json',
  './locales/en/components/tournamentComponents/LeaderCard.json',
  './locales/en/components/tournamentComponents/NoteMessageQueue.json',
  './locales/en/components/tournamentComponents/PreviousTournamentLeaderboard.json',
  './locales/en/components/tournamentComponents/QuizConfirmationModal.json',
  './locales/en/components/tournamentComponents/RegisteredUsersCount.json',
  './locales/en/components/tournamentComponents/RegistrationForm.json',
  './locales/en/components/tournamentComponents/RegistrationSection.json',
  './locales/en/components/tournamentComponents/ShutterAnimation.json',
  './locales/en/components/tournamentComponents/TimeInfo.json',
  './locales/en/components/tournamentComponents/TournamentBadge.json',
  './locales/en/components/tournamentComponents/TournamentGuideModal.json',
  './locales/en/components/tournamentComponents/TournamentHeader.json',
  './locales/en/components/tournamentComponents/TournamentLoadingScreen.json',
  './locales/en/components/tournamentComponents/TournamentQuiz.json',
  './locales/en/components/tournamentComponents/TournamentStatus.json',
  './locales/en/components/tournamentComponents/UserStatsModal.json',
  // Main files
  './locales/en/main/App.json',

  // Redux files
  './locales/en/redux/tournamentSlice.json',

  // Screen files
  './locales/en/screens/ComingSoonTournament.json',
  './locales/en/screens/Contact.json',
  './locales/en/screens/GetStarted.json',
  './locales/en/screens/Home.json',
  './locales/en/screens/LeaderBoard.json',
  './locales/en/screens/LoadingScreen.json',
  './locales/en/screens/OnboardingProcess.json',
  './locales/en/screens/Profile.json',
  './locales/en/screens/Quiz.json',
  './locales/en/screens/Register.json',
  './locales/en/screens/Signin.json',
  './locales/en/screens/Tournament.json',

  // Utils files
  './locales/en/utils/formatDate.json',

  // Assets files
  './locales/en/assets/Brains.json',
  './locales/en/assets/CircleAndSocietyData.json',
  './locales/en/assets/Circles.json',

  // Categories files
  './locales/en/categories/categories.json',
  './locales/en/categories/tournamentCategories.json',

  // hindi
  // Article Components
  './locales/hi/components/articleComponents/ArticleHeader.json',
  './locales/hi/components/articleComponents/AuthorInfo.json',
  './locales/hi/components/articleComponents/BoostSection.json',
  './locales/hi/components/articleComponents/GivenQuiz.json',
  './locales/hi/components/articleComponents/QuinBoostModal.json',
  './locales/hi/components/articleComponents/QuizExpired.json',
  './locales/hi/components/articleComponents/RelatedArticlesToggle.json',
  './locales/hi/components/articleComponents/ShareButton.json',
  './locales/hi/components/articleComponents/Sidebar.json',
  './locales/hi/components/articleComponents/TakeQuizButton.json',
  './locales/hi/components/articleComponents/TotalUserAttempted.json',
  './locales/hi/components/articleComponents/TrackTime.json',

  // Auth Components
  './locales/hi/components/authComponents/EmailVerify.json',
  './locales/hi/components/authComponents/GuestLogin.json',
  './locales/hi/components/authComponents/GuestLoginModal.json',
  './locales/hi/components/authComponents/ResetPassword.json',

  // Chat Components
  './locales/hi/components/chatComponent/BookmarksModal.json',
  './locales/hi/components/chatComponent/ChatHeader.json',
  './locales/hi/components/chatComponent/ChatSideDrawer.json',
  './locales/hi/components/chatComponent/ContextMenu.json',
  './locales/hi/components/chatComponent/DeleteMessageModal.json',
  './locales/hi/components/chatComponent/MessageInput.json',
  './locales/hi/components/chatComponent/MessageReactions.json',
  './locales/hi/components/chatComponent/MessageRequestComponent.json',
  './locales/hi/components/chatComponent/ReactionModal.json',
  './locales/hi/components/chatComponent/ShareChatModal.json',
  './locales/hi/components/chatComponent/SingleChat.json',
  './locales/hi/components/chatComponent/userChats.json',
  './locales/hi/components/chatComponent/UserListItem.json',

  // Contact Components
  './locales/hi/components/contactComponents/FeedbackModal.json',

  // Header Footer Components
  './locales/hi/components/headerFooter/HamburgerModal.json',
  './locales/hi/components/headerFooter/IQScoreModal.json',
  './locales/hi/components/headerFooter/LogoutButton.json',
  './locales/hi/components/headerFooter/Navbar.json',
  './locales/hi/components/headerFooter/NavbarContent.json',
  './locales/hi/components/headerFooter/NavBrand.json',
  './locales/hi/components/headerFooter/NotificationDrawer.json',
  './locales/hi/components/headerFooter/OutsideNavbarContent.json',
  './locales/hi/components/headerFooter/XPLevelModal.json',

  // Home Components
  './locales/hi/components/homeComponents/Card.json',
  './locales/hi/components/homeComponents/SearchBarInput.json',
  './locales/hi/components/homeComponents/Timeline.json',
  './locales/hi/components/homeComponents/UpgradeModal.json',

  // Leaderboard Components
  './locales/hi/components/leaderBoardComponents/LeaderBoardRow.json',
  './locales/hi/components/leaderBoardComponents/LeaderBoardTable.json',
  './locales/hi/components/leaderBoardComponents/SearchBar.json',

  // Miscellaneous Components
  './locales/hi/components/miscellaneous/ButtonFactory.json',
  './locales/hi/components/miscellaneous/DifficultyLegend.json',
  './locales/hi/components/miscellaneous/milestones.json',
  './locales/hi/components/miscellaneous/NoteMessageSummary.json',
  './locales/hi/components/miscellaneous/ProfileBox.json',
  './locales/hi/components/miscellaneous/SecureYourProgress.json',
  './locales/hi/components/miscellaneous/StreakNoteMessage.json',
  './locales/hi/components/miscellaneous/TournamentNoteMessage.json',
  './locales/hi/components/miscellaneous/UnifiedFeedbackNoteMessage.json',
  './locales/hi/components/miscellaneous/UserSearchDrawer.json',
  './locales/hi/components/miscellaneous/XPAwardNoteMessage.json',

  // Notifications
  './locales/hi/components/Notifications/NotificationSubscription.json',

  // Profile Components
  './locales/hi/components/profileComponents/Bookmarks.json',
  './locales/hi/components/profileComponents/BrainModal.json',
  './locales/hi/components/profileComponents/CircleModal.json',
  './locales/hi/components/profileComponents/EditProfileModal.json',
  './locales/hi/components/profileComponents/EnhancedSocietyCircle.json',
  './locales/hi/components/profileComponents/FriendItem.json',
  './locales/hi/components/profileComponents/FriendRequestItem.json',
  './locales/hi/components/profileComponents/IQBarGraph.json',
  './locales/hi/components/profileComponents/LastTournamentRank.json',
  './locales/hi/components/profileComponents/LeftProfileBox.json',
  './locales/hi/components/profileComponents/LineGraph.json',
  './locales/hi/components/profileComponents/ProfileButton.json',
  './locales/hi/components/profileComponents/ProfileDropDownMenu.json',
  './locales/hi/components/profileComponents/ProfileExperienceLevel.json',
  './locales/hi/components/profileComponents/RankAndSociety.json',
  './locales/hi/components/profileComponents/SeasonModal.json',
  './locales/hi/components/profileComponents/SeasonSelectorModal.json',
  './locales/hi/components/profileComponents/Settings.json',
  './locales/hi/components/profileComponents/SolvedQuizHistory.json',
  './locales/hi/components/profileComponents/SolvedQuizzes.json',
  './locales/hi/components/profileComponents/ToggleProfileVisibility.json',
  './locales/hi/components/profileComponents/TournamentBadgeGallery.json',
  './locales/hi/components/profileComponents/TournamentModal.json',
  './locales/hi/components/profileComponents/TournamentSection.json',
  './locales/hi/components/profileComponents/TournamentSelectorDrawer.json',
  './locales/hi/components/profileComponents/WiseWeb.json',
  // Quiz Components
  './locales/hi/components/quizComponents/BoostedSubmittedQuizInterface.json',
  './locales/hi/components/quizComponents/ConfirmationModal.json',
  './locales/hi/components/quizComponents/GivenQuizInterface.json',
  './locales/hi/components/quizComponents/InstructionModal.json',
  './locales/hi/components/quizComponents/ModalComponent.json',
  './locales/hi/components/quizComponents/QuinBoost.json',
  './locales/hi/components/quizComponents/QuizGivenSummary.json',
  './locales/hi/components/quizComponents/QuizInterface.json',
  './locales/hi/components/quizComponents/SubmittedQuizInterface.json',

  // Streak Components
  './locales/hi/components/streakComponents/DailyStreakModal.json',

  // Tournament Components
  './locales/hi/components/tournamentComponents/CategoryCard.json',
  './locales/hi/components/tournamentComponents/CategoryLeaders.json',
  './locales/hi/components/tournamentComponents/CategorySelection.json',
  './locales/hi/components/tournamentComponents/EpicQuestGuide.json',
  './locales/hi/components/tournamentComponents/LeaderboardSearch.json',
  './locales/hi/components/tournamentComponents/LeaderboardSection.json',
  './locales/hi/components/tournamentComponents/LeaderboardTable.json',
  './locales/hi/components/tournamentComponents/LeaderCard.json',
  './locales/hi/components/tournamentComponents/NoteMessageQueue.json',
  './locales/hi/components/tournamentComponents/PreviousTournamentLeaderboard.json',
  './locales/hi/components/tournamentComponents/QuizConfirmationModal.json',
  './locales/hi/components/tournamentComponents/RegisteredUsersCount.json',
  './locales/hi/components/tournamentComponents/RegistrationForm.json',
  './locales/hi/components/tournamentComponents/RegistrationSection.json',
  './locales/hi/components/tournamentComponents/ShutterAnimation.json',
  './locales/hi/components/tournamentComponents/TimeInfo.json',
  './locales/hi/components/tournamentComponents/TournamentBadge.json',
  './locales/hi/components/tournamentComponents/TournamentGuideModal.json',
  './locales/hi/components/tournamentComponents/TournamentHeader.json',
  './locales/hi/components/tournamentComponents/TournamentLoadingScreen.json',
  './locales/hi/components/tournamentComponents/TournamentQuiz.json',
  './locales/hi/components/tournamentComponents/TournamentStatus.json',
  './locales/hi/components/tournamentComponents/UserStatsModal.json',
  // Main files
  './locales/hi/main/App.json',

  // Redux files
  './locales/hi/redux/tournamentSlice.json',

  // Screen files
  './locales/hi/screens/ComingSoonTournament.json',
  './locales/hi/screens/Contact.json',
  './locales/hi/screens/GetStarted.json',
  './locales/hi/screens/Home.json',
  './locales/hi/screens/LeaderBoard.json',
  './locales/hi/screens/LoadingScreen.json',
  './locales/hi/screens/OnboardingProcess.json',
  './locales/hi/screens/Profile.json',
  './locales/hi/screens/Quiz.json',
  './locales/hi/screens/Register.json',
  './locales/hi/screens/Signin.json',
  './locales/hi/screens/Tournament.json',

  // Utils files
  './locales/hi/utils/formatDate.json',

  // Assets files
  './locales/hi/assets/Brains.json',
  './locales/hi/assets/CircleAndSocietyData.json',
  './locales/hi/assets/Circles.json',

  // Categories files
  './locales/hi/categories/categories.json',
  './locales/hi/categories/tournamentCategories.json',
]

// Function to check if URL should be cached
function shouldCache(url) {
  // Immediately return false if in development mode
  if (IS_DEVELOPMENT) {
    console.log('Development mode: Caching disabled')
    return false
  }
  try {
    const requestURL = new URL(url)

    // Don't cache chrome-extension URLs
    if (requestURL.protocol === 'chrome-extension:') return false

    // Don't cache analytics and tracking
    if (NEVER_CACHE_DOMAINS.includes(requestURL.hostname)) return false

    // Don't cache URLs with auth tokens
    if (requestURL.search.includes('token=')) return false

    // Don't cache API requests
    if (requestURL.pathname.includes('/api/')) return false

    return true
  } catch (err) {
    console.error('Error checking cache eligibility:', err)
    return false
  }
}

// Modified installation handler with cache busting
self.addEventListener('install', event => {
  console.log('Service Worker installing - Version', VERSION)
  if (IS_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting())
    return
  }

  event.waitUntil(
    (async () => {
      try {
        // Delete old caches first
        const keys = await caches.keys()
        await Promise.all(
          keys.map(key => {
            if (key !== ASSETS_CACHE) {
              return caches.delete(key)
            }
          }),
        )

        // Open new cache
        const cache = await caches.open(ASSETS_CACHE)

        // Add cache busting parameter to static assets
        const assetsWithVersion = STATIC_ASSETS.map(asset => {
          const url = new URL(asset, self.location)
          url.searchParams.set('v', VERSION)
          return url.toString()
        })

        // Cache files with network-first strategy
        for (const asset of assetsWithVersion) {
          try {
            const response = await fetch(asset, {
              cache: 'reload',
              headers: {
                'Cache-Control': 'no-cache',
              },
            })
            if (response.ok) {
              await cache.put(asset, response)
            }
          } catch (error) {
            console.warn(`Failed to cache asset ${asset}:`, error)
          }
        }

        // Handle image files
        try {
          const imageFiles = await getFilesFromPublicDirectory()
          for (const imageFile of imageFiles) {
            try {
              const imageUrl = new URL(imageFile, self.location)
              imageUrl.searchParams.set('v', VERSION)
              const response = await fetch(imageUrl.toString(), {
                cache: 'reload',
                headers: {
                  'Cache-Control': 'no-cache',
                },
              })
              if (response.ok) {
                await cache.put(imageFile, response)
              }
            } catch (error) {
              console.warn(`Failed to cache image ${imageFile}:`, error)
            }
          }
        } catch (error) {
          console.warn('Failed to get image files:', error)
        }

        await self.skipWaiting()
        console.log('Service Worker installed successfully')
      } catch (error) {
        console.error('Service Worker installation failed:', error)
        throw error
      }
    })(),
  )
})

// Modified activate event with proper cache cleanup
self.addEventListener('activate', event => {
  console.log('Service Worker activating - Version', VERSION)

  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then(keys =>
        Promise.all(
          keys.map(key => {
            if (!key.includes(VERSION)) {
              console.log('Deleting old cache:', key)
              return caches.delete(key)
            }
          }),
        ),
      ),
      // Take control of all clients
      clients.claim(),
      // Force reload all clients to ensure they get fresh content
      clients.matchAll().then(clients => {
        clients.forEach(client => client.navigate(client.url))
      }),
    ]),
  )
})

// Modified fetch event with stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (IS_DEVELOPMENT) return
  if (!shouldCache(event.request.url)) return

  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      (async () => {
        // Try cache first
        const cache = await caches.open(ASSETS_CACHE)
        const cachedResponse = await caches.match(event.request)

        // Fetch new version in background
        const fetchPromise = fetch(event.request, {
          cache: 'reload',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
          .then(async networkResponse => {
            if (networkResponse.ok) {
              // Update cache with new version
              await cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(error => {
            console.error('Network fetch failed:', error)
            return cachedResponse || caches.match('/offline.html')
          })

        // Return cached version immediately if available
        return cachedResponse || fetchPromise
      })(),
    )
  }
})

// Add periodic cache validation
const CACHE_VALIDATION_INTERVAL = 60 * 60 * 1000 // 1 hour

setInterval(() => {
  if (!IS_DEVELOPMENT) {
    caches.keys().then(keys => {
      keys.forEach(key => {
        if (key.includes(VERSION)) {
          caches.open(key).then(cache => {
            cache.keys().then(requests => {
              requests.forEach(request => {
                fetch(request, {
                  cache: 'reload',
                  headers: {
                    'Cache-Control': 'no-cache',
                  },
                }).then(response => {
                  if (response.ok) {
                    cache.put(request, response)
                  }
                })
              })
            })
          })
        }
      })
    })
  }
}, CACHE_VALIDATION_INTERVAL)

// Push notification handling
self.addEventListener('push', event => {
  try {
    const data = event.data.json()

    if (data.messageId && data.title === 'Message Deleted') {
      // Handle message deletion
      event.waitUntil(
        self.registration.getNotifications().then(notifications => {
          notifications.forEach(notification => {
            if (
              notification.data &&
              notification.data.messageId === data.messageId
            ) {
              notification.close()
            }
          })
        }),
      )
      return
    }

    const notificationOptions = {
      body: data.body,
      icon: data.icon || RapidRecapLogo,
      image: data.image || null,
      data: { url: data.url },
      badge: RapidRecapBadge,
      vibrate: [200, 100, 200],
      tag: data.messageId, // Add tag for notification management
    }

    event.waitUntil(
      self.registration.showNotification(data.title, notificationOptions),
    )
  } catch (err) {
    console.error('Error handling push event:', err)
  }
})

self.addEventListener('notificationclick', event => {
  try {
    const notificationData = event.notification.data

    event.waitUntil(
      Promise.all([
        // Close the notification
        event.notification.close(),
        // Open the URL if provided
        notificationData?.url && clients.openWindow(notificationData.url),
      ]),
    )
  } catch (err) {
    console.error('Error handling notification click:', err)
  }
})

// Listen for messages from the client
self.addEventListener('message', event => {
  try {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }

    if (event.data.type === 'CACHE_INVALIDATE') {
      event.waitUntil(
        caches.keys().then(keys => {
          return Promise.all(
            keys.map(key => {
              console.log('Invalidating cache:', key)
              return caches.delete(key)
            }),
          )
        }),
      )
    }
  } catch (err) {
    console.error('Error handling message event:', err)
  }
})

// Error handling for uncaught errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error)
})

// Error handling for unhandled rejections
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason)
})
