// client/src/pages/Article.jsx
// UPDATED: Add support for Normal and Game reading modes

import React, {
  lazy,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import axios from 'axios'
import { Flex, useToast, Grid, useMediaQuery, Box } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
// import ReactGA from 'react-ga4'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { quinBoostChecker } from '../utils/quiz.utils'
import slugify from 'slugify'
import i18n from 'i18next'
import { blackListedImgUrls } from '../assets/blackListedImgUrls'

import {
  setArticleData,
  setImmersiveModeActive,
  setTotalUsersGivenQuiz,
} from '../redux/articleSlice'
import { setQuizLeftToGetQuizBoost } from '../redux/quizSlice'
import ArticleFooter from '../components/articleComponents/ArticleFooter'
import { useReadingProgress } from '../customHooks/useReadingProgress'
import PremiumCTA from '../components/articleComponents/PremiumCTA'
import PremiumValueBanner from '../components/articleComponents/PremiumValueBanner'
import { saveVisitedArticle } from '../utils/article.utils'
import { articleCacheService } from '../lib/cache/services/articleCache'
import MainArticleContent from '../components/articleComponents/MainArticleContent'
import Sidebar from '../components/articleComponents/Sidebar'
import ArticleHeader from '../components/articleComponents/ArticleHeader'
import TrackTime from '../components/articleComponents/TrackTime'
import MainArticleContentSkeleton from '../components/articleComponents/loaders/MainArticleContentSkeleton'
import StreakSurgeModal from '../components/articleComponents/StreakSurgeModal'
import CategoryBoostModal from '../components/articleComponents/CategoryBoostModal'
import GameInventoryButton from '../components/rewards/GameInventoryButton'

import { animationUtils, cssOptimizations } from '../utils/animationUtils'
// NEW: Import Game Mode Layout
import GameModeLayout from '../components/articleComponents/GameModeLayout'
import useImmersiveMode from '../customHooks/useImmersiveMode'
import { DesktopContextMenu } from '../components/articleComponents/desktopImmersiveUtils/DesktopContextMenu'

//SSR images
const fallback_news_image = '/images/fallback_news_image.webp'

const QuinBoostModal = lazy(() =>
  import('../components/articleComponents/QuinBoostModal'),
)

const Article = () => {
  const toast = useToast()
  const { isAuthenticated, user, loginCheckStatus } = useSelector(
    state => state.auth,
  )
  const { isBoosted } = useSelector(state => state.app)
  const { articleData, totalUsersGivenQuiz } = useSelector(
    state => state.articles,
  )
  const { isQuinBoostAvailable } = useSelector(state => state.quiz)
  const dispatch = useDispatch()
  const { id } = useParams()

  // NEW: Reading mode state
  const [readingMode, setReadingMode] = useState('normal') // 'normal' or 'game'
  const [isLargerThan821] = useMediaQuery('(min-width: 821px)')

  const [article, setArticle] = useState(articleData)
  const [imgURL, setImgURL] = useState(
    Array.isArray(articleData?.imgURL)
      ? articleData?.imgURL[0]
      : articleData?.imgURL,
  )

  const [articleLoading, setArticleLoading] = useState(true)
  const [loadingRealatedArticles, setLoadingRelatedArticles] = useState({})
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false)
  const [themedContent, setThemedContent] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [textHeight, setTextHeight] = useState(0)
  const [articleHeight, setArticleHeight] = useState(0)
  const [givenQuiz, setGivenQuiz] = useState(null)
  const textRef = useRef()
  const articleRef = useRef()
  const [percentile, setPercentile] = useState(null)
  const [RQM_score, setRQM_score] = useState(null)
  const [onGoingQuiz, setOnGoingQuiz] = useState(null)
  const [quizExpired, setQuizExpired] = useState(null)
  const readProgress = useReadingProgress()
  const [dictionary, setDictionary] = useState([])
  const [importantSentences, setImportantSentences] = useState([])

  const [title, setTitle] = useState({
    english: articleData?.title || '',
    hindi: articleData?.hindiTitle || '',
  })
  const [dateTime, setDateTime] = useState(articleData?.date)
  const [avgTimeRead, setAvgTimeRead] = useState(articleData?.avgReadTime)
  const [author, setAuthor] = useState({
    english: articleData?.author,
    hindi: articleData?.hindiAuthor,
  })
  const [mainText, setMainText] = useState({
    english: articleData?.mainText,
    hindi: articleData?.hindiMainText,
  })
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language === 'en' ? 'english' : 'hindi',
  )

  const [isQuinBoostModalOpen, setIsQuinBoostModalOpen] = useState(false)
  const [isStreakSurgeModalOpen, setIsStreakSurgeModalOpen] = useState(false)
  const [isCategoryBoostModalOpen, setIsCategoryBoostModalOpen] =
    useState(false)
  const [bookmark, setBookmark] = useState(false)
  const [isQuizGivenLoading, setIsQuizGivenLoading] = useState(true)

  // NEW: Game mode related states
  const [isGameModeTransitioning, setIsGameModeTransitioning] = useState(false)
  const [showRelated, setShowRelated] = useState(false)
  const [recommendedArticles, setRecommendedArticles] = useState([])
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loadingRelatedArticles, setLoadingRelatedArticlesState] =
    useState(false)

  const notLoggedIn = !isAuthenticated

  const {
    isImmersiveModeActive,
    isDesktop,
    isMouseIdle,
    showDesktopControls,
    contextMenuPosition,
    closeContextMenu,
    toggleFullscreen,
    forceShowControls,
    isUserInteracting, // NEW: Track user interaction state
  } = useImmersiveMode({
    enableKeyboardShortcuts: true,
    onExitImmersive: () => {
      console.log('ESC pressed - exiting immersive mode')
      setReadingMode('normal')
      dispatch(setImmersiveModeActive(false))
    },
    // Enhanced desktop features with better UX
    enableDesktopFeatures: true,
    onDesktopNavigate: useCallback(direction => {
      console.log('Desktop navigation:', direction)

      if (direction === 'top') {
        window.dispatchEvent(
          new CustomEvent('desktopNavigate', { detail: { action: 'goToTop' } }),
        )
      } else if (direction === 'bottom') {
        window.dispatchEvent(
          new CustomEvent('desktopNavigate', {
            detail: { action: 'goToBottom' },
          }),
        )
      } else {
        window.dispatchEvent(
          new CustomEvent('desktopNavigate', {
            detail: { action: 'navigate', direction },
          }),
        )
      }
    }, []),
    enableMouseIdleDetection: true,
    mouseIdleTimeout: 4000, // Increased timeout for better UX
    enableFullscreenSupport: true,
    enableContextMenu: true,
  })

  const handleDesktopContextAction = useCallback(
    action => {
      try {
        // Force show controls on any context action
        if (forceShowControls) {
          forceShowControls()
        }

        switch (action) {
          case 'exit':
            setReadingMode('normal')
            break
          case 'fullscreen':
            if (toggleFullscreen) {
              toggleFullscreen()
            }
            break
          case 'navigate-up':
            window.dispatchEvent(
              new CustomEvent('desktopNavigate', {
                detail: { action: 'navigate', direction: -1 },
              }),
            )
            break
          case 'navigate-down':
            window.dispatchEvent(
              new CustomEvent('desktopNavigate', {
                detail: { action: 'navigate', direction: 1 },
              }),
            )
            break
          case 'go-top':
            window.dispatchEvent(
              new CustomEvent('desktopNavigate', {
                detail: { action: 'goToTop' },
              }),
            )
            break
          case 'toggle-controls':
            // Toggle controls visibility
            if (forceShowControls) {
              forceShowControls()
            }
            break
          default:
            console.warn('Unknown desktop context action:', action)
            break
        }
      } catch (error) {
        console.error('Error handling desktop context action:', error)
      } finally {
        closeContextMenu()
      }
    },
    [toggleFullscreen, closeContextMenu, forceShowControls],
  )

  // NEW: Check if game mode is available (only for mobile/tablet)
  const isGameModeAvailable = useMemo(() => {
    return importantSentences.length > 0
  }, [importantSentences.length])

  // MODIFY the handleReadingModeChange function (around line 80) to enhance it:
  const handleReadingModeChange = useCallback(
    mode => {
      // Prevent mode changes during transitions
      if (isGameModeTransitioning) return

      setReadingMode(mode)

      // Handle smooth transition to game mode (now supports desktop)
      if (mode === 'game') {
        setIsGameModeTransitioning(true)

        // Use RAF for smoother transition
        requestAnimationFrame(() => {
          console.log('Transitioning to immersive game mode')

          // Reset transition state after animation completes
          setTimeout(() => {
            setIsGameModeTransitioning(false)
          }, 400) // Match the animation duration
        })
      } else {
        console.log('Transitioning to normal reading mode')
      }
    },
    [toast, isGameModeTransitioning],
  )

  const openModal = useCallback(() => setIsQuinBoostModalOpen(true), [])
  const closeModal = useCallback(() => setIsQuinBoostModalOpen(false), [])

  const fetchQuiz = useCallback(async () => {
    try {
      const endpoint = `/api/gamehub/data/${id}`
      await axios.get(endpoint)
    } catch (error) {
      console.log(error.message)
    }
  }, [id])

  const bookmarkStatus = useCallback(
    async ({ view, update }) => {
      if (notLoggedIn) return
      try {
        update && setBookmark(true)
        const response = await axios.get(
          `/api/user/bookmark?articleId=${id}&view=${view}&update=${update}`,
        )
        setBookmark(response.data.bookmarkStatus)
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response.data.error || 'Error Bookmark Status',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
        setBookmark(false)
      }
    },
    [id, notLoggedIn, toast],
  )

  const fetchArticle = useCallback(async () => {
    if (loginCheckStatus === 'pending') return

    // Try to get from cache first
    const cachedResponse = await articleCacheService.getArticle(id)
    if (cachedResponse) {
      // Use cached data
      const articleData = cachedResponse.newArticle

      if (user?.userLanguage) {
        setSelectedLanguage(user?.userLanguage === 'hi' ? 'hindi' : 'english')
      }
      dispatch(setArticleData(articleData))
      setArticle(articleData)
      saveVisitedArticle(articleData)
      dispatch(setTotalUsersGivenQuiz(articleData.quizAttemptCnt))

      const image = Array.isArray(articleData.imgURL)
        ? articleData.imgURL[0]
        : articleData.imgURL
      setImgURL(image)
      setDateTime(articleData.date)
      setAvgTimeRead(articleData.avgReadTime)
      setTitle({
        english: articleData.title,
        hindi: articleData.hindiTitle,
      })
      setAuthor({
        english: articleData.author,
        hindi: articleData.hindiAuthor,
      })
      setMainText({
        english: articleData.mainText,
        hindi: articleData.hindiMainText,
      })
      setDictionary(articleData.dictionary || [])
      setImportantSentences(articleData.importantSentences || [])
      setQuizExpired(cachedResponse.quizExpired)
      setArticleLoading(false)
      setLoadingRelatedArticles(prev => ({ ...prev, [id]: false }))
    }

    try {
      const headers =
        user && isAuthenticated
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}
      // Always fetch fresh data
      const response = await axios.get(
        `/api/articles/article/${id}?lang=${
          user?.userLanguage ? user?.userLanguage : i18n.language
        }`,
        { headers },
      )

      // Cache the full response data
      articleCacheService.cacheArticle(id, response.data)

      const articleData = response.data.newArticle

      // Update UI with fresh data
      if (user?.userLanguage) {
        setSelectedLanguage(user?.userLanguage === 'hi' ? 'hindi' : 'english')
      }

      dispatch(setArticleData(articleData))
      setArticle(articleData)
      saveVisitedArticle(articleData)
      dispatch(setTotalUsersGivenQuiz(articleData.quizAttemptCnt))

      const image = Array.isArray(articleData.imgURL)
        ? articleData.imgURL[0]
        : articleData.imgURL
      setImgURL(image)
      setDateTime(articleData.date)
      setAvgTimeRead(articleData.avgReadTime)
      setTitle({ english: articleData.title, hindi: articleData.hindiTitle })
      setAuthor({ english: articleData.author, hindi: articleData.hindiAuthor })
      setMainText({
        english: articleData.mainText,
        hindi: articleData.hindiMainText,
      })

      if (
        !cachedResponse ||
        !cachedResponse?.newArticle ||
        !cachedResponse?.newArticle?.dictionary
      ) {
        setDictionary(articleData.dictionary || [])
      }

      if (
        !cachedResponse ||
        !cachedResponse?.newArticle ||
        !cachedResponse?.newArticle?.importantSentences
      ) {
        setImportantSentences(articleData.importantSentences || [])
      }
      setQuizExpired(response.data.quizExpired)
    } catch (error) {
      // Only show error if we don't have cached data
      if (!cachedResponse) {
        toast({
          title: 'Error',
          description: error?.response?.data?.error || 'Error fetching article',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      }
      console.error(error)
    } finally {
      setArticleLoading(false)
      setLoadingRelatedArticles(prev => ({ ...prev, [id]: false }))
    }
  }, [id, toast, loginCheckStatus, user?.userLanguage, dispatch])

  const isQuizGiven = useCallback(async () => {
    const userId = user?._id
    if ((!userId || !id) && loginCheckStatus === 'fulfilled') {
      setGivenQuiz(false)
      setIsQuizGivenLoading(false)
      return
    }
    setIsQuizGivenLoading(true)
    try {
      // Use the new GameHub endpoint that checks for any game type completion
      const response = await axios.get(
        `/api/gamehub/completion/${id}/${userId}`,
      )
      console.log('Game completion response:', response.data)

      if (response.data.hasPlayed) {
        setPercentile(response.data.percentile)
        setRQM_score(response.data.bestScore)
        setGivenQuiz(response.data) // Store the full response for more detailed info
        console.log(
          `User has played ${
            response.data.gamesPlayed.length
          } game(s): ${response.data.gamesPlayed.join(', ')}`,
        )
        console.log(
          `Best score: ${response.data.bestScore} from ${response.data.bestGameType}`,
        )
      } else {
        setGivenQuiz(false)
      }
    } catch (error) {
      console.log('Error checking game completion:', error.message)
      setGivenQuiz(false)
    } finally {
      setIsQuizGivenLoading(false)
    }
  }, [id, user, loginCheckStatus])

  const checkOnGoingQuiz = useCallback(async () => {
    try {
      const response = await axios.get(`/api/articles/quizStatus/${id}`)
      setOnGoingQuiz(response.data.status)
    } catch (error) {
      console.log(error.message)
      setOnGoingQuiz(false)
    } finally {
      localStorage.setItem('isQuizGivenCalled', true)
    }
  }, [id])

  const trackGenerateQuizClick = useCallback(() => {
    // ReactGA.send({
    //   hitType: 'event',
    //   eventCategory: 'Generate Quiz Click',
    //   eventAction: 'Click',
    //   eventLabel: 'Generate Quiz Button',
    // })
  }, [])

  // NEW: Quiz button click handler
  const handleQuizButtonClick = useCallback(() => {
    if (notLoggedIn) {
      toast({
        title: 'Login Required',
        description: 'Please login to take the quiz',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    trackGenerateQuizClick()
    // Navigate to GameHub or open quiz modal
    window.location.href = `/gamehub/${id}`
  }, [notLoggedIn, toast, trackGenerateQuizClick, id])

  // NEW: Related articles handlers for game mode
  const handleRelatedToggle = useCallback(() => {
    setShowRelated(!showRelated)
    // Fetch related articles if needed
  }, [showRelated])

  const handleRelatedArticleClick = useCallback(article => {
    // Handle related article navigation
    const path = `/article/${article._id}/${slugify(article.title)}`
    window.location.href = path
  }, [])

  const handleLoadMore = useCallback(() => {
    // Load more related articles
  }, [])

  useEffect(() => {
    quinBoostChecker({
      setQuizLeftToGetQuizBoost,
      dispatch,
    })
    fetchArticle()
    fetchQuiz()
  }, [fetchArticle, fetchQuiz, loginCheckStatus])

  useEffect(() => {
    if (readingMode === 'game') {
      // Enable desktop-specific optimizations
      document.body.style.overflow = 'hidden' // Prevent body scroll in immersive mode

      // Add desktop keyboard shortcuts
      const handleKeyPress = e => {
        if (e.key === 'Escape') {
          setReadingMode('normal')
        }
      }

      document.addEventListener('keydown', handleKeyPress)

      return () => {
        document.body.style.overflow = 'auto'
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [readingMode])

  useEffect(() => {
    checkOnGoingQuiz()
    bookmarkStatus({ view: true, update: false })
  }, [notLoggedIn, checkOnGoingQuiz, bookmarkStatus])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled') {
      isQuizGiven()
    }
  }, [loginCheckStatus, totalUsersGivenQuiz])

  useEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.getBoundingClientRect().height)
    }
    if (articleRef.current) {
      setArticleHeight(articleRef.current.getBoundingClientRect().height)
    }
  }, [article, textHeight])

  useEffect(() => {
    // scroll to the top of the page
    window.scrollTo(0, 0)
    if (articleData) {
      setArticleLoading(false)
    }
    return () => {
      // clear articleData in redux
      dispatch(setArticleData(null))
    }
  }, [])

  // Enhanced desktop performance and stability
  useEffect(() => {
    if (readingMode === 'game' && isDesktop) {
      // Disable text selection for better interaction
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'

      // Prevent context menu on images and other elements (except our custom handler)
      const preventDefaultContextMenu = e => {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
          e.preventDefault()
        }
      }

      document.addEventListener('contextmenu', preventDefaultContextMenu)

      // Prevent drag and drop for better UX
      const preventDragDrop = e => {
        e.preventDefault()
        return false
      }

      document.addEventListener('dragstart', preventDragDrop)
      document.addEventListener('drop', preventDragDrop)

      // Better scroll prevention on body
      const preventScroll = e => {
        if (
          e.target === document.body ||
          e.target === document.documentElement
        ) {
          e.preventDefault()
        }
      }

      document.addEventListener('wheel', preventScroll, { passive: false })
      document.addEventListener('touchmove', preventScroll, { passive: false })

      return () => {
        // Restore original settings
        document.body.style.userSelect = 'auto'
        document.body.style.webkitUserSelect = 'auto'
        document.removeEventListener('contextmenu', preventDefaultContextMenu)
        document.removeEventListener('dragstart', preventDragDrop)
        document.removeEventListener('drop', preventDragDrop)
        document.removeEventListener('wheel', preventScroll)
        document.removeEventListener('touchmove', preventScroll)
      }
    }
  }, [readingMode, isDesktop])

  // Desktop transition stability
  useEffect(() => {
    if (readingMode === 'game' && isDesktop && isGameModeTransitioning) {
      // Temporarily disable controls during transition for stability
      const timeout = setTimeout(() => {
        if (forceShowControls) {
          forceShowControls()
        }
      }, 500) // Show controls after transition

      return () => clearTimeout(timeout)
    }
  }, [readingMode, isDesktop, isGameModeTransitioning, forceShowControls])

  const handleThemeChange = useCallback(newThemedContent => {
    setThemedContent(newThemedContent)
  }, [])

  const getStructuredData = useMemo(() => {
    const articleUrl = `https://rapidrecap.ai/article/${id}/${slugify(
      title['english'],
    )}`

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      headline: title[selectedLanguage],
      description:
        article?.description ||
        mainText[selectedLanguage]?.[0]?.substring(0, 160),
      image: {
        '@type': 'ImageObject',
        url: imgURL || fallback_news_image,
        width: '1200',
        height: '630',
      },
      datePublished: article?.dateTime,
      dateModified: article?.dateTime,
      author: {
        '@type': 'Person',
        name: author[selectedLanguage],
        url: 'https://rapidrecap.ai',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Rapid Recap',
        logo: {
          '@type': 'ImageObject',
          url: 'https://rapidrecap.ai/images/rrlogo.png',
          width: '512',
          height: '512',
        },
      },
      articleSection: article?.category,
      keywords: article?.keywords?.join(', '),
      inLanguage: selectedLanguage === 'hindi' ? 'hi' : 'en',
      isAccessibleForFree: true,
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: totalUsersGivenQuiz,
      },
      potentialAction: [
        {
          '@type': 'ReadAction',
          target: [articleUrl],
        },
        {
          '@type': 'AssessAction',
          target: [`${articleUrl}/quiz`],
          description:
            'Test your knowledge with an AI-powered quiz on this article',
        },
      ],
      isPartOf: {
        '@type': 'WebSite',
        name: 'Rapid Recap',
        url: 'https://rapidrecap.ai',
      },
    }
  }, [
    id,
    title,
    selectedLanguage,
    imgURL,
    article,
    author,
    totalUsersGivenQuiz,
    mainText,
  ])

  // NEW: Render Game Mode Layout
  if (readingMode === 'game' && isGameModeAvailable) {
    return (
      <Box
        w={'100vw'}
        h={'100vh'}
        overflow={'hidden'}
        // ADD optimized styles for hardware acceleration
        css={cssOptimizations.hardwareAccelerated}
      >
        <Helmet>
          <title>{`${title[selectedLanguage]} | Rapid Recap - AI-Powered GK Quiz`}</title>
          {/* Meta tags remain the same */}
          <meta
            name="description"
            content={
              article?.description ||
              mainText[selectedLanguage]?.[0]?.substring(0, 160)
            }
          />
          <script type="application/ld+json">
            {JSON.stringify(getStructuredData)}
          </script>
        </Helmet>

        <GameModeLayout
          // Article data
          article={article}
          title={title}
          selectedLanguage={selectedLanguage}
          mainText={mainText}
          themedContent={themedContent}
          imgURL={imgURL}
          dictionary={dictionary}
          importantSentences={importantSentences}
          // Article header props
          bookmark={bookmark}
          avgTimeRead={avgTimeRead}
          dateTime={dateTime}
          bookmarkStatus={bookmarkStatus}
          onThemeChange={handleThemeChange}
          openStreakSurgeModal={() => setIsStreakSurgeModalOpen(true)}
          openCategoryBoostModal={() => setIsCategoryBoostModalOpen(true)}
          openModal={openModal}
          // Reading mode props
          readingMode={readingMode}
          onReadingModeChange={handleReadingModeChange}
          // Quiz/Game related
          givenQuiz={givenQuiz}
          percentile={percentile}
          RQM_score={RQM_score}
          totalUsersGivenQuiz={totalUsersGivenQuiz}
          onQuizButtonClick={handleQuizButtonClick}
          // Related articles
          showRelated={showRelated}
          onRelatedToggle={handleRelatedToggle}
          relatedArticles={relatedArticles}
          onRelatedArticleClick={handleRelatedArticleClick}
          loading={loadingRelatedArticles}
          onLoadMore={handleLoadMore}
          // General
          isAuthenticated={isAuthenticated}
          user={user}
          isDesktop={isDesktop}
          isMouseIdle={isMouseIdle}
          showDesktopControls={showDesktopControls}
          contextMenuPosition={contextMenuPosition}
          onContextAction={handleDesktopContextAction}
          onForceShowControls={forceShowControls}
          isUserInteracting={isUserInteracting}
          // ADD new optimization props
          isTransitioning={isGameModeTransitioning}
        />

        {/* Enhanced Desktop Context Menu */}
        {readingMode === 'game' && isDesktop && (
          <DesktopContextMenu
            isVisible={!!contextMenuPosition}
            position={contextMenuPosition}
            onClose={closeContextMenu}
            onNavigate={direction => {
              // Force show controls on navigation
              if (forceShowControls) {
                forceShowControls()
              }

              if (direction === 'top') {
                handleDesktopContextAction('go-top')
              } else if (direction === -1) {
                handleDesktopContextAction('navigate-up')
              } else if (direction === 1) {
                handleDesktopContextAction('navigate-down')
              }
            }}
            onExit={() => handleDesktopContextAction('exit')}
            onToggleFullscreen={() => handleDesktopContextAction('fullscreen')}
            onToggleControls={() =>
              handleDesktopContextAction('toggle-controls')
            }
          />
        )}
        {/* Modals for game mode - ADD optimized backdrop */}
        <StreakSurgeModal
          isOpen={isStreakSurgeModalOpen}
          onClose={() => setIsStreakSurgeModalOpen(false)}
          isStreakBoosted={isBoosted}
        />
        <CategoryBoostModal
          isOpen={isCategoryBoostModalOpen}
          onClose={() => setIsCategoryBoostModalOpen(false)}
          isBoostActive={true}
        />
        <QuinBoostModal
          isOpen={isQuinBoostModalOpen}
          onClose={closeModal}
          currentQuizCount={user?.todaysQuizCnt}
          isStateBoosted={isBoosted}
        />

        {user && <TrackTime userId={user?._id} articleId={id} />}
      </Box>
    )
  }

  // Normal mode layout (existing code)
  return (
    <Flex w={'100vw'}>
      <Flex
        className="article-page"
        marginTop={'2.75rem'}
        flexDirection={'column'}
        w={'100vw'}
        overflow={'hidden'}
        minH={'100vh'}
      >
        <Helmet>
          <title>{`${title[selectedLanguage]} | Rapid Recap - AI-Powered GK Quiz`}</title>
          {/* Primary Meta Tags */}
          <meta
            name="description"
            content={
              article?.description ||
              mainText[selectedLanguage]?.[0]?.substring(0, 160)
            }
          />
          <meta
            name="keywords"
            content={`${article?.keywords?.join(
              ', ',
            )}, GK quiz, current affairs, general knowledge test`}
          />
          <meta name="author" content={author[selectedLanguage]} />
          <meta
            name="language"
            content={selectedLanguage === 'hindi' ? 'hi' : 'en'}
          />

          {/* Open Graph Meta Tags */}
          <meta
            property="og:title"
            content={`${title[selectedLanguage]} | Rapid Recap - Test Your Knowledge`}
          />
          <meta
            property="og:description"
            content={
              article?.description ||
              mainText[selectedLanguage]?.[0]?.substring(0, 160)
            }
          />
          <meta property="og:image" content={imgURL || fallback_news_image} />
          <meta property="og:type" content="article" />
          <meta
            property="og:url"
            content={`https://rapidrecap.ai/article/${id}/${slugify(
              title['english'],
            )}`}
          />
          <meta property="og:site_name" content="Rapid Recap" />
          <meta
            property="og:locale"
            content={selectedLanguage === 'hindi' ? 'hi_IN' : 'en_US'}
          />
          <meta property="article:published_time" content={article?.dateTime} />
          <meta property="article:author" content={author[selectedLanguage]} />
          <meta property="article:section" content={article?.category} />
          {article?.keywords?.map(keyword => (
            <meta property="article:tag" content={keyword} key={keyword} />
          ))}

          {/* Twitter Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={`${title[selectedLanguage]} | Rapid Recap`}
          />
          <meta
            name="twitter:description"
            content={
              article?.description ||
              mainText[selectedLanguage]?.[0]?.substring(0, 160)
            }
          />
          <meta name="twitter:image" content={imgURL || fallback_news_image} />
          <meta name="twitter:site" content="@rapidrecap" />

          {/* Canonical URL */}
          <link
            rel="canonical"
            href={`https://rapidrecap.ai/article/${id}/${slugify(
              title['english'],
            )}`}
          />

          {/* Alternate Language Links */}
          <link
            rel="alternate"
            hrefLang="en"
            href={`https://rapidrecap.ai/article/${id}/${slugify(
              title['english'],
            )}`}
          />
          <link
            rel="alternate"
            hrefLang="hi"
            href={`https://rapidrecap.ai/article/${id}/${slugify(
              title['hindi'] || title['english'],
            )}`}
          />

          {/* Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify(getStructuredData)}
          </script>
        </Helmet>
        <article>
          <Flex
            justifyContent={'center'}
            mt={5}
            px={{ base: '20px', md: '50px' }}
            w={'100%'}
          >
            <header
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              <ArticleHeader
                title={title}
                author={author}
                selectedLanguage={selectedLanguage}
                bookmark={bookmark}
                articleLoading={articleLoading}
                avgTimeRead={avgTimeRead}
                dateTime={dateTime}
                bookmarkStatus={bookmarkStatus}
                article={article}
                openStreakSurgeModal={() => setIsStreakSurgeModalOpen(true)}
                openCategoryBoostModal={() => setIsCategoryBoostModalOpen(true)}
                openModal={openModal}
                onThemeChange={handleThemeChange}
                // NEW: Pass reading mode props
                readingMode={readingMode}
                onReadingModeChange={handleReadingModeChange}
                isGameModeAvailable={isGameModeAvailable}
              />
            </header>
          </Flex>
          {!isAuthenticated && loginCheckStatus === 'fulfilled' && (
            <Box px={{ base: 4, md: 6 }}>
              <PremiumValueBanner />
            </Box>
          )}
          <Grid
            templateColumns={isLargerThan821 ? 'minmax(0, 9fr) 5fr' : '1fr'}
            gap={10}
            minH={'85vh'}
            px={{ base: '20px', md: '50px' }}
            marginTop={0}
            className="article-all-content"
          >
            {articleLoading ? (
              <MainArticleContentSkeleton />
            ) : (
              <MainArticleContent
                imgURL={
                  (!blackListedImgUrls.find(url => url === imgURL) && imgURL) ||
                  fallback_news_image
                }
                selectedLanguage={selectedLanguage}
                mainText={mainText}
                textRef={textRef}
                articleRef={articleRef}
                articleLoading={articleLoading}
                themedContent={themedContent}
                SourceURL={articleData?.url}
                dictionary={dictionary}
                importantSentences={importantSentences}
              />
            )}
            {isAuthenticated && loginCheckStatus === 'fulfilled' && (
              <GameInventoryButton page={'ARTICLE'} />
            )}
            <Sidebar
              category={article?.category}
              setShouldScrollToTop={setShouldScrollToTop}
              shouldScrollToTop={shouldScrollToTop}
              givenQuiz={givenQuiz}
              percentile={percentile}
              RQM_score={RQM_score}
              onGoingQuiz={onGoingQuiz}
              quizExpired={quizExpired}
              isQuinBoostAvailable={isQuinBoostAvailable}
              trackGenerateQuizClick={trackGenerateQuizClick}
              setShowQuiz={setShowQuiz}
              showQuiz={showQuiz}
              loadingRealatedArticles={loadingRealatedArticles}
              setLoadingRelatedArticles={setLoadingRelatedArticles}
              totalUsersGivenQuiz={totalUsersGivenQuiz}
              articleHeight={articleHeight}
              article={article}
              id={id}
              isQuizGivenLoading={isQuizGivenLoading}
              i18n={i18n}
            />
          </Grid>
          {!isAuthenticated && loginCheckStatus === 'fulfilled' && (
            <PremiumCTA readProgress={readProgress} />
          )}
          <ArticleFooter />
        </article>
      </Flex>
      <StreakSurgeModal
        isOpen={isStreakSurgeModalOpen}
        onClose={() => setIsStreakSurgeModalOpen(false)}
        isStreakBoosted={isBoosted}
      />
      <CategoryBoostModal
        isOpen={isCategoryBoostModalOpen}
        onClose={() => setIsCategoryBoostModalOpen(false)}
        isBoostActive={true}
      />
      <QuinBoostModal
        isOpen={isQuinBoostModalOpen}
        onClose={closeModal}
        currentQuizCount={user?.todaysQuizCnt}
        isStateBoosted={isBoosted}
      />

      {user && <TrackTime userId={user?._id} articleId={id} />}
    </Flex>
  )
}

export default Article
