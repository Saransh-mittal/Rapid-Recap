// Enhanced GameModeLayout.jsx with IMPROVED articles section responsiveness
// Location: client/src/components/articleComponents/GameModeLayout.jsx
// FIXED: Articles section now properly responsive with visible Load More button on all screen sizes

import React, {
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  startTransition,
  useState,
} from 'react'
import {
  Box,
  Flex,
  Text,
  useMediaQuery,
  VStack,
  HStack,
  Icon,
  IconButton,
  Button,
  Tooltip,
  Badge,
  Grid,
  GridItem,
  SimpleGrid,
  Image,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Users,
  ChevronUp,
  ChevronDown,
  Mouse,
  Keyboard,
  Monitor,
  Home,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react'
import ArticleHeader from './ArticleHeader'
import PaginatedArticleContent from './PaginatedArticleContent'
import GameHubButton from './GameHubButton'
import TotalUserAttempted from './TotalUserAttempted'
import RelatedArticlesToggle from './RelatedArticlesToggle'
import QuizPage from './QuizPage'
import { useInlineQuiz } from './hooks/useInlineQuiz'
import { blackListedImgUrls } from '../../assets/blackListedImgUrls'
import AnimatedScrollIndicator from './AnimatedScrollIndicator'
import { useInlineQuizTracker } from './hooks/useInlineQuizTracker'
import PremiumCTA from './PremiumCTA'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import ArticleListSkeleton from './loaders/ArticleListSkeleton'
import axios from 'axios'
import i18n from 'i18next'
import { formatDate } from '../../utils/helper.utils'
import { useTranslation } from 'react-i18next'
import useSafeSound from '../../customHooks/useSafeSound'
import { useNavigate } from 'react-router-dom'
import { useFeatureDetection } from '../../utils/featureDetection'
import slugify from 'slugify'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionIconButton = motion(IconButton)
const fallback_news_image = '/images/fallback_news_image.webp'

// Enhanced state reducer with desktop-specific states
const gameStateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload }
    case 'SET_DIRECTION':
      return { ...state, direction: action.payload }
    case 'SET_CONTENT_PAGES':
      return { ...state, actualContentPages: action.payload }
    case 'SET_CONTENT_READY':
      return { ...state, isContentReady: action.payload }
    case 'SET_QUIZ_PAGES':
      return { ...state, quizPages: action.payload }
    case 'SET_TRANSITIONING':
      return { ...state, isTransitioning: action.payload }
    case 'SET_TARGET_SECTION':
      return { ...state, targetSection: action.payload }
    case 'SET_SHOW_GO_TO_TOP':
      return { ...state, showGoToTop: action.payload }
    case 'SET_DESKTOP_NAVIGATION_HINT':
      return { ...state, showDesktopNavigationHint: action.payload }
    case 'SET_MOUSE_IDLE':
      return { ...state, isMouseIdle: action.payload }
    case 'NAVIGATION_START':
      return {
        ...state,
        isTransitioning: true,
        direction: action.direction,
        targetSection: action.targetSection,
      }
    case 'NAVIGATION_COMPLETE':
      return {
        ...state,
        currentSection: action.targetSection,
        isTransitioning: false,
      }
    default:
      return state
  }
}

// Enhanced initial state with desktop features
const initialGameState = {
  currentSection: 0,
  direction: 0,
  actualContentPages: 1,
  isContentReady: false,
  quizPages: [],
  isTransitioning: false,
  targetSection: 0,
  showGoToTop: false,
  showDesktopNavigationHint: true,
  isMouseIdle: false,
}

// Enhanced animation variants for desktop
const pageVariants = {
  enter: direction => ({
    y: direction > 0 ? '100vh' : '-100vh',
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: direction => ({
    y: direction < 0 ? '100vh' : '-100vh',
    opacity: 0,
    scale: 0.98,
  }),
}

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.4,
}

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}

const goToTopVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  hover: { scale: 1.1, y: -2 },
  tap: { scale: 0.95 },
}

// NEW: Desktop navigation variants
const desktopHintVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// Constants
const NAVIGATION_COOLDOWN = 400
const TRANSITION_CLEANUP_DELAY = 400
const MOUSE_IDLE_TIMEOUT = 3000 // 3 seconds

// ENHANCED: Helper function to check if element is scrollable and has scroll content
const isElementScrollable = element => {
  if (!element) return false

  const style = window.getComputedStyle(element)
  const isScrollableY =
    style.overflowY === 'auto' || style.overflowY === 'scroll'
  const hasScrollContent = element.scrollHeight > element.clientHeight

  return isScrollableY && hasScrollContent
}

// ENHANCED: Helper function to find the closest scrollable ancestor
const findScrollableAncestor = element => {
  let current = element

  while (current && current !== document.body) {
    if (isElementScrollable(current)) {
      return current
    }
    current = current.parentElement
  }

  return null
}

// ENHANCED: Helper function to check if scroll is at boundary
const isScrollAtBoundary = (element, direction) => {
  if (!element) return true

  const { scrollTop, scrollHeight, clientHeight } = element
  const threshold = 5 // Small threshold for boundary detection

  if (direction > 0) {
    // Scrolling down - check if at bottom
    return scrollTop + clientHeight >= scrollHeight - threshold
  } else {
    // Scrolling up - check if at top
    return scrollTop <= threshold
  }
}

const GameModeLayout = memo(
  ({
    // Article data
    article,
    title,
    selectedLanguage,
    mainText,
    themedContent,
    imgURL,
    dictionary,
    importantSentences,
    // Article header props
    bookmark,
    avgTimeRead,
    dateTime,
    bookmarkStatus,
    onThemeChange,
    openStreakSurgeModal,
    openCategoryBoostModal,
    openModal,
    // Reading mode props
    readingMode,
    onReadingModeChange,
    // Quiz/Game related
    RQM_score,
    totalUsersGivenQuiz,
    onQuizButtonClick,
    // Related articles
    loadingRealatedArticles,
    setLoadingRelatedArticles,
    articleHeight,
    showRelated,
    onRelatedToggle,
    isDesktop = false,
    isMouseIdle = false,
    showDesktopControls = true,
    contextMenuPosition = null,
    onContextAction = () => {},
    onForceShowControls = () => {},
    isUserInteracting = false,
    // General
    isAuthenticated,
    loginCheckStatus = 'pending',
  }) => {
    const articleId = article?._id || ''
    const dispatchRedux = useDispatch()
    const navigate = useNavigate()
    const { t } = useTranslation('Sidebar')
    const { t: formatDateTranslate } = useTranslation('formatDate')
    const features = useFeatureDetection()
    const { playClick } = useSafeSound({
      enabled: features.hasAudioSupport,
      volume: 0.5,
    })
    const toast = useToast()

    // Enhanced state with desktop features
    const [gameState, dispatch] = useReducer(gameStateReducer, initialGameState)
    const quizTracker = useInlineQuizTracker({ articleId })
    const {
      currentSection,
      direction,
      actualContentPages,
      isContentReady,
      quizPages,
      isTransitioning,
      targetSection,
      showGoToTop,
      showDesktopNavigationHint,
    } = gameState

    const [showOnlySummary, setShowOnlySummary] = useState(false)
    const [recommendedArticles, setRecommendedArticles] = useState([])
    const [page, setPage] = useState(1)
    const [pageRelated, setPageRelated] = useState(1)
    const [loading, setLoading] = useState(false)
    const [latestNews, setLatestNews] = useState([])

    // Enhanced refs for desktop
    const containerRef = useRef(null)
    const navigationCooldownRef = useRef(0)
    const mouseIdleTimeoutRef = useRef(null)
    const gestureRef = useRef({
      startY: 0,
      startTime: 0,
      isActive: false,
      threshold: 50,
      timeThreshold: 300,
      velocity: 0,
      lastY: 0,
      lastTime: 0,
    })

    // Enhanced media queries for desktop
    const [isMobile] = useMediaQuery('(max-width: 480px)')
    const [isTablet] = useMediaQuery('(max-width: 768px)')
    const [isLargeDesktop] = useMediaQuery('(min-width: 1200px)')
    const [isExtraLargeDesktop] = useMediaQuery('(min-width: 1440px)')

    // NEW: Desktop-specific gesture threshold
    const gestureThreshold = useMemo(() => {
      if (isDesktop) return 100 // Larger threshold for desktop mouse wheel
      return isMobile ? 50 : 70
    }, [isMobile, isDesktop])

    const fetchRelatedArticles = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(
          `/api/articles/related/${articleId}?page=${pageRelated}&limit=5&lang=${i18n.language}`,
        )
        setLatestNews(prevArticles => [
          ...prevArticles,
          ...data.relatedArticles,
        ])
        setPageRelated(prevPage => prevPage + 1)
      } catch (error) {
        console.error('Error fetching related articles:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchRecommendedArticles = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `/api/recommendation/articlePageRecommendations/${articleId}?page=${page}&pageSize=5&lang=${i18n.language}`,
        )

        setRecommendedArticles(prevArticles => [
          ...prevArticles,
          ...response.data,
        ])
        setPage(prevPage => prevPage + 1)
      } catch (error) {
        console.error('Error fetching recommended articles:', error)
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      // Fetch both types of articles on component mount
      fetchRecommendedArticles()
      if (showRelated && latestNews.length === 0) {
        fetchRelatedArticles()
      }
    }, [showRelated, article])

    // Update gesture threshold
    useEffect(() => {
      gestureRef.current.threshold = gestureThreshold
    }, [gestureThreshold])

    // Inline quiz hook
    const {
      quizQuestions,
      selectedAnswers,
      showStatistics,
      userAnswers,
      submitAnswer,
      generateQuizQuestions,
      getQuizSummary,
      getQuestionStatistics,
      hasAnswered,
      getUserAnswer,
      loading: quizLoading,
      isGenerating: quizGenerating,
    } = useInlineQuiz({
      articleId: article?._id,
    })

    // Enhanced sections calculation with desktop considerations
    const allSections = useMemo(() => {
      const sections = []
      sections.push({ type: 'header', index: 0 })

      let sectionIndex = 1
      for (let pageIndex = 0; pageIndex < actualContentPages; pageIndex++) {
        sections.push({
          type: 'content',
          index: sectionIndex++,
          pageIndex,
        })

        const quizPage = quizPages.find(qp => qp.afterPageIndex === pageIndex)
        if (quizPage) {
          sections.push({
            type: 'quiz',
            index: sectionIndex++,
            quiz: quizPage.quiz,
          })
        }
      }

      sections.push({ type: 'interactive', index: sectionIndex++ })

      if (isAuthenticated) {
        sections.push({ type: 'articles', index: sectionIndex++ })
      }

      return sections
    }, [actualContentPages, quizPages, isAuthenticated])

    const totalSections = allSections.length
    const currentSectionData = allSections[currentSection] || {}

    // Enhanced progress calculation
    const progress = useMemo(() => {
      if (totalSections <= 1) return 0
      return (currentSection / (totalSections - 1)) * 100
    }, [currentSection, totalSections])

    // NEW: Mouse idle detection for desktop
    const handleMouseMove = useCallback(() => {
      if (!isDesktop) return

      dispatch({ type: 'SET_MOUSE_IDLE', payload: false })

      if (mouseIdleTimeoutRef.current) {
        clearTimeout(mouseIdleTimeoutRef.current)
      }

      mouseIdleTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_MOUSE_IDLE', payload: true })
      }, MOUSE_IDLE_TIMEOUT)
    }, [isDesktop])

    // Enhanced navigation function with desktop optimizations
    const navigateToSection = useCallback(
      newDirection => {
        const now = Date.now()

        if (
          now - navigationCooldownRef.current < NAVIGATION_COOLDOWN ||
          isTransitioning
        ) {
          return
        }

        let targetIndex
        if (newDirection > 0) {
          targetIndex = Math.min(currentSection + 1, totalSections - 1)
        } else {
          targetIndex = Math.max(currentSection - 1, 0)
        }

        if (targetIndex === currentSection) return

        navigationCooldownRef.current = now

        // Hide desktop hint after first navigation
        if (showDesktopNavigationHint) {
          dispatch({ type: 'SET_DESKTOP_NAVIGATION_HINT', payload: false })
        }

        dispatch({
          type: 'NAVIGATION_START',
          direction: newDirection,
          targetSection: targetIndex,
        })

        startTransition(() => {
          dispatch({
            type: 'NAVIGATION_COMPLETE',
            targetSection: targetIndex,
          })
        })

        setTimeout(() => {
          dispatch({ type: 'SET_TRANSITIONING', payload: false })
        }, TRANSITION_CLEANUP_DELAY)
      },
      [
        currentSection,
        totalSections,
        isTransitioning,
        showDesktopNavigationHint,
      ],
    )

    // Enhanced go to top handler
    const handleGoToTop = useCallback(() => {
      if (isTransitioning || currentSection === 0) return

      const now = Date.now()
      if (now - navigationCooldownRef.current < NAVIGATION_COOLDOWN) return

      navigationCooldownRef.current = now

      dispatch({
        type: 'NAVIGATION_START',
        direction: -1,
        targetSection: 0,
      })

      startTransition(() => {
        dispatch({
          type: 'NAVIGATION_COMPLETE',
          targetSection: 0,
        })
      })

      setTimeout(() => {
        dispatch({ type: 'SET_TRANSITIONING', payload: false })
      }, TRANSITION_CLEANUP_DELAY)
    }, [currentSection, isTransitioning])

    // NEW: Desktop navigation buttons
    const navigateUp = useCallback(
      () => navigateToSection(-1),
      [navigateToSection],
    )
    const navigateDown = useCallback(
      () => navigateToSection(1),
      [navigateToSection],
    )

    // Update go to top visibility
    useEffect(() => {
      dispatch({ type: 'SET_SHOW_GO_TO_TOP', payload: currentSection > 0 })
    }, [currentSection])

    // Enhanced touch handlers (kept for tablet support)
    const handleTouchStart = useCallback(
      e => {
        if (isTransitioning) return

        const touch = e.touches[0]
        const now = Date.now()

        gestureRef.current = {
          ...gestureRef.current,
          startY: touch.clientY,
          startTime: now,
          isActive: true,
          velocity: 0,
          lastY: touch.clientY,
          lastTime: now,
        }
      },
      [isTransitioning],
    )

    const handleTouchMove = useCallback(
      e => {
        if (!gestureRef.current.isActive || isTransitioning) return

        const touch = e.touches[0]
        const now = Date.now()
        const deltaY = touch.clientY - gestureRef.current.lastY
        const deltaTime = now - gestureRef.current.lastTime
        const totalDeltaY = touch.clientY - gestureRef.current.startY

        if (deltaTime > 0) {
          gestureRef.current.velocity = deltaY / deltaTime
        }

        gestureRef.current.lastY = touch.clientY
        gestureRef.current.lastTime = now

        const isSwipingDown = totalDeltaY > 0
        const isNotFirstPage = currentSection > 0
        const isAtTopOfPage = window.scrollY === 0
        const isDownwardMovement = isSwipingDown && Math.abs(totalDeltaY) > 10

        const isInTopArea = gestureRef.current.startY < 75
        const hasScrolledInTopArea = window.scrollY > 0 && window.scrollY < 75
        const isScrollingContent = hasScrolledInTopArea || window.scrollY > 75

        const shouldAllowPullToRefresh = isInTopArea && isScrollingContent
        const shouldBlockPullToRefresh =
          isNotFirstPage &&
          isAtTopOfPage &&
          isDownwardMovement &&
          !shouldAllowPullToRefresh

        if (shouldBlockPullToRefresh) {
          e.preventDefault()
          e.stopPropagation()
          return
        }

        const isNavigationGesture =
          Math.abs(totalDeltaY) > gestureRef.current.threshold
        if (isNavigationGesture) {
          e.preventDefault()
        }
      },
      [isTransitioning, currentSection],
    )

    const handleTouchEnd = useCallback(
      e => {
        if (!gestureRef.current.isActive || isTransitioning) {
          gestureRef.current.isActive = false
          return
        }

        const touch = e.changedTouches[0]
        const deltaY = touch.clientY - gestureRef.current.startY
        const deltaTime = Date.now() - gestureRef.current.startTime
        const distance = Math.abs(deltaY)

        gestureRef.current.isActive = false

        const hasMinDistance = distance > gestureRef.current.threshold
        const hasGoodVelocity = Math.abs(gestureRef.current.velocity) > 0.3
        const isQuickSwipe = deltaTime < 200 && distance > 30
        const isWithinTimeLimit = deltaTime < gestureRef.current.timeThreshold

        const isValidSwipe =
          isWithinTimeLimit &&
          (hasMinDistance || hasGoodVelocity || isQuickSwipe)

        if (!isValidSwipe) return

        if (deltaY < 0) {
          navigateToSection(1)
        } else {
          navigateToSection(-1)
        }
      },
      [isTransitioning, navigateToSection],
    )

    // FIXED: Enhanced wheel handler for desktop with proper internal scrolling support
    const handleWheel = useCallback(
      e => {
        if (!isDesktop || isTransitioning) {
          if (isTransitioning) e.preventDefault()
          return
        }

        const now = Date.now()
        if (now - navigationCooldownRef.current < NAVIGATION_COOLDOWN) {
          e.preventDefault()
          return
        }

        // ENHANCED: Check if the event target is within a scrollable container
        const scrollableContainer = findScrollableAncestor(e.target)

        if (scrollableContainer) {
          // ENHANCED: Check if the scrollable container can still scroll in the wheel direction
          const canScrollInDirection = !isScrollAtBoundary(
            scrollableContainer,
            e.deltaY,
          )

          if (canScrollInDirection) {
            // Allow normal scrolling within the container
            console.log('Allowing internal scroll within container')
            return
          }

          // If at boundary, check if we should navigate to next section
          console.log('At scroll boundary, checking for section navigation')
        }

        // ENHANCED: Only prevent default if we're going to handle navigation
        const deltaY = e.deltaY
        const threshold = 80

        if (Math.abs(deltaY) > threshold) {
          e.preventDefault() // Only prevent default when we're navigating

          // Show controls during scroll
          if (onForceShowControls) {
            onForceShowControls()
          }

          if (deltaY > 0) {
            navigateToSection(1)
          } else {
            navigateToSection(-1)
          }
        }
        // If deltaY is below threshold, allow normal page scrolling
      },
      [isDesktop, isTransitioning, navigateToSection, onForceShowControls],
    )

    // Enhanced keyboard handler for desktop
    const handleKeyDown = useCallback(
      e => {
        if (isTransitioning) return

        // Hide desktop hint on first interaction
        if (showDesktopNavigationHint) {
          dispatch({ type: 'SET_DESKTOP_NAVIGATION_HINT', payload: false })
        }

        switch (e.key) {
          case 'ArrowDown':
          case ' ':
          case 'PageDown':
            e.preventDefault()
            navigateToSection(1)
            break
          case 'ArrowUp':
          case 'PageUp':
            e.preventDefault()
            navigateToSection(-1)
            break
          case 'Home':
            e.preventDefault()
            handleGoToTop()
            break
          case 'End':
            e.preventDefault()
            if (currentSection < totalSections - 1) {
              dispatch({
                type: 'NAVIGATION_START',
                direction: 1,
                targetSection: totalSections - 1,
              })
              setTimeout(() => {
                dispatch({
                  type: 'NAVIGATION_COMPLETE',
                  targetSection: totalSections - 1,
                })
                dispatch({ type: 'SET_TRANSITIONING', payload: false })
              }, pageTransition.duration * 1000)
            }
            break
          case 'Escape':
            e.preventDefault()
            onReadingModeChange('normal')
            break
        }
      },
      [
        isTransitioning,
        navigateToSection,
        handleGoToTop,
        currentSection,
        totalSections,
        onReadingModeChange,
        showDesktopNavigationHint,
      ],
    )

    const handleRelatedArticleClick = useCallback(
      async (e, item) => {
        if (!isAuthenticated) {
          e.preventDefault()
          toast({
            title: t('loginRequired'),
            description: t('loginToShare'),
            status: 'warning',
            duration: 3000,
            isClosable: true,
          })
          return
        }

        playClick()
        handleGoToTop()
        // cut after article id
        const pathname = location.pathname.split('/').slice(0, 3).join('/')

        if (
          pathname === `/article/${item?._id}/${slugify(item?.title)}` ||
          pathname === `/article/${item?._id}/${slugify(item?.title)}/` ||
          pathname === `/article/${item?._id}` ||
          pathname === `/article/${item?._id}/`
        ) {
          toast({
            title: t('alreadyOnArticle'),
            description: t('alreadyOnArticleDesc'),
            status: 'info',
            duration: 3000,
            isClosable: true,
          })
          return
        }
        setLoadingRelatedArticles(prev => ({ ...prev, [item?._id]: true }))

        const path =
          i18n.language === 'en'
            ? `/article/${item?._id}/${slugify(item?.title)}`
            : `/article/${item?._id}/${slugify(item?.hindiTitle)}`

        navigate(path)

        // Reset loading state after navigation
        // setTimeout(() => {
        //   setLoadingArticles(prev => ({ ...prev, [item?._id]: false }))
        // }, 1000)
      },
      [
        isAuthenticated,
        playClick,
        toast,
        navigate,
        i18n.language,
        handleGoToTop,
        t,
      ],
    )

    // Quiz answer handler
    const handleQuizAnswer = useCallback(
      async (questionId, answerIndex) => {
        try {
          const result = await submitAnswer(questionId, answerIndex)

          // NEW: Track the quiz answer for conversion data
          quizTracker.trackQuizAnswer({
            questionId,
            isCorrect: result?.isCorrect || false,
            timeSpent: 0, // You can track time if needed
          })
        } catch (error) {
          console.error('Error submitting quiz answer:', error)
        }
      },
      [submitAnswer, quizTracker],
    )

    // Quiz page calculations
    const quizPageCalculations = useMemo(() => {
      if (!isContentReady || !quizQuestions.length || !importantSentences)
        return []

      const quizContentPlacement = quizQuestions
        .map(quiz => {
          if (!quiz.relatedSentences || quiz.relatedSentences.length < 2) {
            return null
          }

          const lastRelatedSentence =
            quiz.relatedSentences[quiz.relatedSentences.length - 1]
          const lastSentenceIndex = lastRelatedSentence.sentenceIndex
          const sentencesPerPage = Math.ceil(
            importantSentences.length / actualContentPages,
          )
          const earliestPage = Math.floor(lastSentenceIndex / sentencesPerPage)

          return { quiz, earliestPage, lastSentenceIndex }
        })
        .filter(Boolean)
        .sort((a, b) => a.lastSentenceIndex - b.lastSentenceIndex)

      const detectedQuizPages = []
      let currentQuizPage = -1

      quizContentPlacement.forEach((item, index) => {
        const assignedPage =
          index === 0 ? item?.earliestPage : currentQuizPage + 1
        currentQuizPage = Math.max(assignedPage, currentQuizPage + 1)

        detectedQuizPages.push({
          afterPageIndex: currentQuizPage,
          quiz: item?.quiz,
          sectionIndex: 1 + currentQuizPage + 1 + index,
        })
      })

      return detectedQuizPages
    }, [isContentReady, quizQuestions, importantSentences, actualContentPages])

    // ENHANCED: Articles rendering function with improved responsiveness
    const renderArticles = useCallback(() => {
      const articlesToShow = showRelated
        ? latestNews.filter(item => item && item._id !== article?._id)
        : recommendedArticles.filter(item => item && item._id !== article?._id)

      if (!articlesToShow.length && !loading) {
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            py={{ base: 6, md: 8, lg: 10 }}
            w="100%"
          >
            <VStack spacing={{ base: 3, md: 4 }}>
              <Icon
                as={Users}
                boxSize={{ base: 10, md: 12, lg: 14 }}
                color="whiteAlpha.300"
              />
              <Text
                fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                color="whiteAlpha.600"
                fontWeight="500"
              >
                No {showRelated ? 'related' : 'recommended'} articles found
              </Text>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="whiteAlpha.400"
                maxW={{ base: '280px', md: '350px' }}
                textAlign="center"
              >
                Try exploring other categories or check back later
              </Text>
            </VStack>
          </MotionBox>
        )
      }

      return (
        <VStack spacing={0} w="100%" align="stretch" h="100%">
          {/* IMPROVED: Articles Grid Container with better height management */}
          <Box
            w="100%"
            flex="1"
            overflowY="auto"
            overflowX="hidden"
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(159, 122, 234, 0.6)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(159, 122, 234, 0.8)',
              },
            }}
            pr={{ base: 1, md: 2 }}
            pb={{ base: 4, md: 6 }} // Add bottom padding for Load More button
          >
            <VStack spacing={0} w="100%" align="stretch">
              {/* Articles Grid */}
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(2, 1fr)',
                  xl: isExtraLargeDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                }}
                gap={{
                  base: 4,
                  md: 5,
                  lg: 6,
                  xl: isExtraLargeDesktop ? 5 : 6,
                }}
                w="100%"
                pb={articlesToShow.length > 0 ? { base: 4, md: 6 } : 0}
              >
                {articlesToShow.map((item, index) => (
                  <GridItem key={`${item?._id}-${index}`} w="100%">
                    <MotionBox
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: 'easeOut',
                      }}
                      whileHover={{
                        y: -4,
                        transition: { duration: 0.2, ease: 'easeOut' },
                      }}
                      onClick={e => handleRelatedArticleClick(e, item)}
                      style={
                        !isAuthenticated
                          ? { filter: 'blur(5px)', userSelect: 'none' }
                          : { userSelect: 'text', cursor: 'pointer' }
                      }
                      bg="rgba(255, 255, 255, 0.03)"
                      borderRadius={{ base: 'lg', md: 'xl' }}
                      border="1px solid"
                      borderColor="rgba(255, 255, 255, 0.08)"
                      overflow="hidden"
                      position="relative"
                      minH={{
                        base: '140px',
                        md: '160px',
                        lg: '180px',
                        xl: isExtraLargeDesktop ? '170px' : '180px',
                      }}
                      _hover={{
                        borderColor: 'rgba(159, 122, 234, 0.3)',
                        bg: 'rgba(255, 255, 255, 0.06)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(159, 122, 234, 0.15)',
                      }}
                      _active={{
                        transform: 'translateY(-2px)',
                      }}
                    >
                      {/* Loading Overlay */}
                      {loadingRealatedArticles[item?._id] && (
                        <Flex
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                          backgroundColor="rgba(0, 0, 0, 0.7)"
                          justifyContent="center"
                          alignItems="center"
                          borderRadius={{ base: 'lg', md: 'xl' }}
                          zIndex={3}
                          backdropFilter="blur(4px)"
                        >
                          <VStack spacing={2}>
                            <Spinner
                              thickness="3px"
                              speed="0.65s"
                              emptyColor="whiteAlpha.300"
                              color="purple.400"
                              size="lg"
                            />
                            <Text fontSize="xs" color="whiteAlpha.700">
                              Loading...
                            </Text>
                          </VStack>
                        </Flex>
                      )}

                      {/* Enhanced Card Content */}
                      <Flex direction="column" h="100%" p={{ base: 4, md: 5 }}>
                        {/* Article Metadata Header */}
                        <Flex
                          justify="space-between"
                          align="center"
                          mb={3}
                          flexWrap={{ base: 'wrap', sm: 'nowrap' }}
                          gap={2}
                        >
                          <HStack spacing={2} minW={0} flex={1}>
                            <Box
                              w="3px"
                              h="3px"
                              bg="purple.400"
                              borderRadius="full"
                              flexShrink={0}
                            />
                            <Text
                              fontSize={{
                                base: '2xs',
                                sm: 'xs',
                                xl: isExtraLargeDesktop ? '2xs' : 'xs',
                              }}
                              color="purple.300"
                              fontWeight="600"
                              textTransform="uppercase"
                              letterSpacing="wider"
                              noOfLines={1}
                            >
                              {formatDate(
                                item?.dateTime,
                                formatDateTranslate,
                                i18n.language,
                              )}
                            </Text>
                          </HStack>

                          <Badge
                            colorScheme="orange"
                            variant="subtle"
                            fontSize="2xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                            bg="rgba(214, 158, 46, 0.1)"
                            color="orange.300"
                            border="1px solid"
                            borderColor="rgba(214, 158, 46, 0.2)"
                            flexShrink={0}
                          >
                            {item?.avgReadTime || 'N/A'} {t('minRead')}
                          </Badge>
                        </Flex>

                        {/* Main Content Area */}
                        <Flex flex={1} gap={{ base: 3, md: 4 }} align="stretch">
                          {/* Article Image */}
                          <Box
                            position="relative"
                            flexShrink={0}
                            w={{
                              base: '80px',
                              sm: '100px',
                              md: '120px',
                              xl: isExtraLargeDesktop ? '100px' : '120px',
                            }}
                            h={{
                              base: '60px',
                              sm: '75px',
                              md: '90px',
                              xl: isExtraLargeDesktop ? '75px' : '90px',
                            }}
                            borderRadius={{ base: 'md', md: 'lg' }}
                            overflow="hidden"
                            bg="rgba(255, 255, 255, 0.05)"
                          >
                            <Image
                              src={
                                (!blackListedImgUrls.find(
                                  url => url === item?.imgURL?.[0],
                                ) &&
                                  item?.imgURL?.[0]) ||
                                fallback_news_image
                              }
                              alt={t('articleImageAlt')}
                              onError={e => {
                                e.target.onerror = null
                                e.target.src = fallback_news_image
                              }}
                              w="100%"
                              h="100%"
                              objectFit="cover"
                              loading="lazy"
                              transition="transform 0.3s ease"
                              _hover={{
                                transform: 'scale(1.05)',
                              }}
                            />

                            {/* Image Overlay for Better Text Contrast */}
                            <Box
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              bg="linear-gradient(135deg, rgba(159, 122, 234, 0.1), transparent 50%)"
                              opacity={0}
                              transition="opacity 0.3s ease"
                              _groupHover={{ opacity: 1 }}
                            />
                          </Box>

                          {/* Article Text Content */}
                          <Flex
                            direction="column"
                            flex={1}
                            justify="center"
                            minW={0}
                          >
                            <Text
                              fontSize={{
                                base: 'sm',
                                sm: 'md',
                                md: 'lg',
                                xl: isExtraLargeDesktop ? 'md' : 'lg',
                              }}
                              fontWeight="600"
                              color="white"
                              lineHeight={{ base: '1.3', md: '1.4' }}
                              noOfLines={{
                                base: 3,
                                md: 4,
                                xl: isExtraLargeDesktop ? 3 : 4,
                              }}
                              mb={2}
                              transition="color 0.2s ease"
                              _groupHover={{
                                color: 'purple.200',
                              }}
                            >
                              {i18n.language === 'en'
                                ? item?.title
                                : item?.hindiTitle}
                            </Text>

                            {/* Article Category/Tags */}
                            {item?.category && (
                              <HStack spacing={2} mt="auto">
                                <Box
                                  w="2px"
                                  h="2px"
                                  bg="orange.400"
                                  borderRadius="full"
                                />
                                <Text
                                  fontSize="2xs"
                                  color="orange.300"
                                  fontWeight="500"
                                  textTransform="capitalize"
                                  letterSpacing="wide"
                                >
                                  {item?.category}
                                </Text>
                              </HStack>
                            )}
                          </Flex>
                        </Flex>

                        {/* Subtle Hover Indicator */}
                        <Box
                          position="absolute"
                          bottom={0}
                          left={0}
                          right={0}
                          h="2px"
                          bg="linear-gradient(90deg, rgba(159, 122, 234, 0.6), rgba(214, 158, 46, 0.6))"
                          transform="scaleX(0)"
                          transformOrigin="left"
                          transition="transform 0.3s ease"
                          _groupHover={{
                            transform: 'scaleX(1)',
                          }}
                        />
                      </Flex>
                    </MotionBox>
                  </GridItem>
                ))}
              </Grid>

              {/* IMPROVED: Load More Button with fixed positioning */}
              {!loading && articlesToShow.length > 0 && (
                <MotionBox
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  mt={{ base: 4, md: 6 }}
                  textAlign="center"
                  w="100%"
                  pb={{ base: 2, md: 4 }} // Extra bottom padding
                >
                  <Button
                    onClick={() =>
                      showRelated
                        ? fetchRelatedArticles()
                        : fetchRecommendedArticles()
                    }
                    size={{
                      base: 'md',
                      md: 'lg',
                      lg: isLargeDesktop ? 'lg' : 'md',
                    }}
                    bg="rgba(159, 122, 234, 0.1)"
                    border="2px solid"
                    borderColor="rgba(159, 122, 234, 0.3)"
                    color="purple.300"
                    borderRadius="xl"
                    px={{ base: 6, md: 8, lg: 10 }}
                    py={{ base: 2, md: 3 }}
                    fontWeight="600"
                    letterSpacing="wide"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      bg: 'rgba(159, 122, 234, 0.2)',
                      borderColor: 'rgba(159, 122, 234, 0.5)',
                      color: 'purple.200',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(159, 122, 234, 0.2)',
                    }}
                    _active={{
                      transform: 'translateY(0px)',
                      boxShadow: '0 4px 15px rgba(159, 122, 234, 0.2)',
                    }}
                    leftIcon={
                      <Icon
                        as={TrendingUp}
                        boxSize={{
                          base: 4,
                          md: 5,
                          lg: isLargeDesktop ? 5 : 4,
                        }}
                        transition="transform 0.2s ease"
                        _groupHover={{ transform: 'rotate(12deg)' }}
                      />
                    }
                  >
                    {t('loadMore')}
                  </Button>
                </MotionBox>
              )}

              {/* Loading State */}
              {loading && (
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  mt={4}
                  w="100%"
                >
                  <ArticleListSkeleton
                    count={
                      isExtraLargeDesktop
                        ? 6
                        : isLargeDesktop
                        ? 4
                        : isDesktop
                        ? 4
                        : 2
                    }
                  />
                </MotionBox>
              )}
            </VStack>
          </Box>
        </VStack>
      )
    }, [
      showRelated,
      latestNews,
      recommendedArticles,
      loading,
      isDesktop,
      isLargeDesktop,
      isExtraLargeDesktop,
      isAuthenticated,
      handleRelatedArticleClick,
      fetchRelatedArticles,
      fetchRecommendedArticles,
      loadingRealatedArticles,
      article?._id,
      blackListedImgUrls,
      fallback_news_image,
      formatDate,
      formatDateTranslate,
      i18n.language,
      t,
    ])

    // Enhanced section renderer with desktop optimizations
    const renderCurrentSection = useCallback(() => {
      if (!currentSectionData) return null

      const sectionProps = {
        article,
        title,
        selectedLanguage,
        mainText,
        themedContent,
        imgURL,
        dictionary,
        importantSentences,
        bookmark,
        avgTimeRead,
        dateTime,
        bookmarkStatus,
        openModal,
        onThemeChange,
        openStreakSurgeModal,
        openCategoryBoostModal,
        readingMode,
        onReadingModeChange,
        isAuthenticated,
        actualContentPages,
        isContentReady,
      }

      // Enhanced responsive padding for desktop
      const sectionPadding = {
        base: '10px',
        md: '20px',
        lg: isDesktop ? '40px' : '20px',
        xl: isLargeDesktop ? '60px' : '40px',
      }

      const sectionPaddingTop = {
        base: 16,
        lg: '4.25rem',
      }

      switch (currentSectionData.type) {
        case 'header':
          return (
            <Flex
              flexDirection="column"
              w="100%"
              h="100vh"
              px={sectionPadding}
              pt={sectionPaddingTop}
            >
              <Box w="100%" mb={0}>
                <ArticleHeader
                  title={title}
                  articleLoading={false}
                  selectedLanguage={selectedLanguage}
                  bookmark={bookmark}
                  avgTimeRead={avgTimeRead}
                  dateTime={dateTime}
                  bookmarkStatus={bookmarkStatus}
                  article={article}
                  openModal={openModal}
                  onThemeChange={onThemeChange}
                  openStreakSurgeModal={openStreakSurgeModal}
                  openCategoryBoostModal={openCategoryBoostModal}
                  readingMode={readingMode}
                  onReadingModeChange={onReadingModeChange}
                  isGameModeAvailable={true}
                />
              </Box>

              <Box flex="1" w="100%" overflow="hidden">
                <PaginatedArticleContent
                  imgURL={
                    (!blackListedImgUrls.find(url => url === imgURL) &&
                      imgURL) ||
                    fallback_news_image
                  }
                  selectedLanguage={selectedLanguage}
                  showSummaryToggle={true}
                  showOnlySummary={showOnlySummary}
                  onToggleSummary={() => setShowOnlySummary(!showOnlySummary)}
                  mainText={mainText}
                  themedContent={themedContent}
                  SourceURL={article?.url}
                  dictionary={dictionary}
                  importantSentences={importantSentences}
                  currentPage={-1}
                  totalPages={actualContentPages}
                  showImage={true}
                  isAuthenticated={isAuthenticated}
                />
              </Box>

              <AnimatedScrollIndicator />
            </Flex>
          )

        case 'content':
          if (!isContentReady) {
            return (
              <VStack spacing={4} justify="center" h="100vh">
                <Text fontSize="lg" color="whiteAlpha.700">
                  Optimizing content for your screen...
                </Text>
                <Text fontSize="sm" color="whiteAlpha.500">
                  Ensuring perfect readability
                </Text>
              </VStack>
            )
          }

          return (
            <Flex
              w="100%"
              h="100vh"
              px={sectionPadding}
              pt={sectionPaddingTop}
              alignItems="center"
              justifyContent="center"
            >
              <Flex
                w={{
                  base: '98%',
                  sm: '95%',
                  md: '90%',
                  lg: isDesktop ? '85%' : '90%',
                  xl: isLargeDesktop ? '80%' : '85%',
                }}
                h="90%"
                overflow="hidden"
              >
                <PaginatedArticleContent
                  imgURL={imgURL}
                  selectedLanguage={selectedLanguage}
                  mainText={mainText}
                  themedContent={themedContent}
                  SourceURL={article?.url}
                  dictionary={dictionary}
                  importantSentences={importantSentences}
                  currentPage={currentSectionData.pageIndex}
                  totalPages={actualContentPages}
                  showImage={false}
                  isAuthenticated={isAuthenticated}
                  showSummaryToggle={true}
                  showOnlySummary={showOnlySummary}
                  onToggleSummary={() => setShowOnlySummary(!showOnlySummary)}
                />
              </Flex>
            </Flex>
          )

        case 'quiz':
          const questionId = currentSectionData.quiz._id
          const hasUserAnswered = hasAnswered(questionId)
          const userAnswer = getUserAnswer(questionId)
          const statistics = getQuestionStatistics(questionId)

          return (
            <Flex
              w="100%"
              h="100vh"
              px={sectionPadding}
              pt={sectionPaddingTop}
              alignItems="center"
              justifyContent="center"
            >
              <Flex
                w={{
                  base: '98%',
                  sm: '95%',
                  md: '90%',
                  lg: isDesktop ? '85%' : '90%',
                  xl: isLargeDesktop ? '75%' : '85%',
                }}
                h="90%"
                overflow="hidden"
              >
                <QuizPage
                  question={currentSectionData.quiz}
                  onAnswer={answerIndex =>
                    handleQuizAnswer(questionId, answerIndex)
                  }
                  selectedAnswer={selectedAnswers[questionId]}
                  showStatistics={showStatistics[questionId]}
                  isCorrect={userAnswer ? userAnswer.isCorrect : null}
                  disabled={hasUserAnswered}
                  statistics={statistics}
                  isAuthenticated={isAuthenticated}
                />
              </Flex>
            </Flex>
          )

        case 'interactive':
          return (
            <Flex
              h="100vh"
              w="100%"
              alignItems="flex-start" // Changed from center to flex-start
              justifyContent="center"
              pt={{ base: '80px', sm: '90px' }} // Increased top padding to avoid progress bar
              pb={{ base: 8, md: 12 }}
              px={{ base: 4, sm: 6, md: sectionPadding }}
              position="relative"
              overflow="hidden"
              bg="radial-gradient(circle at 50% 50%, rgba(159, 122, 234, 0.08), transparent 60%)"
            >
              {/* Simple background decoration */}
              <Box
                position="absolute"
                top="25%" // Moved down to avoid top area
                right="20%"
                width={{ base: '80px', md: '150px' }}
                height={{ base: '80px', md: '150px' }}
                borderRadius="full"
                bg="rgba(214, 158, 46, 0.04)"
                filter="blur(30px)"
                animation="gentle-float 8s ease-in-out infinite"
                sx={{
                  '@keyframes gentle-float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                  },
                }}
              />

              {/* Main Content Container - Properly Spaced */}
              <Flex
                direction="column"
                align="center"
                justify="flex-start" // Changed from center
                w="100%"
                maxW={{ base: '100%', sm: '420px', md: '500px', lg: '600px' }}
                mx="auto"
                textAlign="center"
                gap={{ base: 5, sm: 6, md: 8 }} // Consistent spacing
                minH="calc(100vh - 160px)" // Ensure proper height calculation
              >
                {/* Reading Complete Header */}
                <MotionBox
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  w="100%"
                >
                  <HStack
                    spacing={{ base: 2, md: 3 }}
                    justify="center"
                    mb={{ base: 2, md: 3 }}
                  >
                    <Icon
                      as={CheckCircle}
                      color="green.400"
                      boxSize={{ base: 5, md: 6 }}
                    />
                    <Text
                      fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                      fontWeight="600"
                      color="green.400"
                      letterSpacing="wide"
                    >
                      Reading Complete
                    </Text>
                    <Box
                      w={{ base: '3px', md: '4px' }}
                      h={{ base: '3px', md: '4px' }}
                      bg="green.400"
                      borderRadius="full"
                      animation="subtle-pulse 3s ease-in-out infinite"
                      sx={{
                        '@keyframes subtle-pulse': {
                          '0%, 100%': { opacity: 0.6 },
                          '50%': { opacity: 1 },
                        },
                      }}
                    />
                  </HStack>
                </MotionBox>

                {/* Achievement Box */}
                {!isAuthenticated && (
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    w="100%"
                    maxW={{ base: '100%', sm: '400px', md: '450px' }}
                  >
                    <Box
                      bg="linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))"
                      borderRadius={{ base: 'lg', md: 'xl' }}
                      border="2px solid"
                      borderColor="green.500"
                      p={{ base: 4, sm: 5, md: 6 }}
                      position="relative"
                      overflow="hidden"
                      boxShadow="0 8px 25px rgba(34, 197, 94, 0.2)"
                    >
                      {/* Subtle animation */}
                      <Box
                        position="absolute"
                        top="0"
                        left="-100%"
                        width="100%"
                        height="100%"
                        bg="linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)"
                        animation="subtle-shine 4s ease-in-out infinite"
                        sx={{
                          '@keyframes subtle-shine': {
                            '0%': { left: '-100%' },
                            '100%': { left: '100%' },
                          },
                        }}
                      />

                      <VStack
                        spacing={{ base: 3, md: 4 }}
                        position="relative"
                        zIndex={1}
                      >
                        <HStack spacing={{ base: 2, md: 3 }} justify="center">
                          <Icon
                            as={Trophy}
                            boxSize={{ base: 5, md: 6 }}
                            color="yellow.400"
                          />
                          <Text
                            fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                            fontWeight="bold"
                            color="white"
                            textAlign="center"
                          >
                            Your Quiz Performance
                          </Text>
                        </HStack>

                        <VStack spacing={{ base: 2, md: 3 }}>
                          <Badge
                            colorScheme="green"
                            variant="solid"
                            fontSize={{ base: 'sm', md: 'md' }}
                            px={{ base: 4, md: 5 }}
                            py={{ base: 2, md: 2.5 }}
                            borderRadius="full"
                          >
                            SCORE: ? • ✨
                          </Badge>
                          <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            color="whiteAlpha.800"
                            fontWeight="500"
                            textAlign="center"
                          >
                            Ready for the real challenge?
                          </Text>
                        </VStack>
                      </VStack>
                    </Box>
                  </MotionBox>
                )}

                {/* Main Title Section */}
                {!isAuthenticated && (
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    w="100%"
                  >
                    <VStack spacing={{ base: 4, md: 5 }}>
                      <Text
                        fontSize={{
                          base: 'xl',
                          sm: '2xl',
                          md: '3xl',
                          lg: '4xl',
                        }}
                        fontWeight="800"
                        bgGradient="linear(to-r, purple.400, pink.400, orange.400)"
                        bgClip="text"
                        lineHeight={{ base: '1.2', md: '1.1' }}
                        textAlign="center"
                        px={{ base: 2, md: 0 }}
                      >
                        Unlock Your Competitive Edge
                      </Text>

                      <Text
                        fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
                        color="whiteAlpha.800"
                        maxW={{ base: '100%', sm: '380px', md: '420px' }}
                        lineHeight={{ base: '1.4', md: '1.5' }}
                        fontWeight="500"
                        textAlign="center"
                        px={{ base: 3, sm: 2, md: 0 }}
                      >
                        Join 1,000+ players competing daily. Track your IQ,
                        climb leaderboards, and win real prizes.
                      </Text>

                      {/* Call-to-Action Arrow */}
                      <VStack spacing={2} mt={{ base: 2, md: 3 }}>
                        <Text
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          color="purple.300"
                          fontWeight="600"
                          textAlign="center"
                          animation="gentle-bounce 3s ease-in-out infinite"
                          sx={{
                            '@keyframes gentle-bounce': {
                              '0%, 100%': { transform: 'translateY(0px)' },
                              '50%': { transform: 'translateY(-3px)' },
                            },
                          }}
                        >
                          👇 Click below to start competing 👇
                        </Text>
                      </VStack>
                    </VStack>
                  </MotionBox>
                )}

                {/* GameHub Button */}
                <MotionBox
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  w="100%"
                  display="flex"
                  justifyContent="center"
                >
                  <GameHubButton
                    onClick={() => {
                      if (!isAuthenticated) {
                        dispatchRedux(setIsSigninOpen(true))
                      } else {
                        onQuizButtonClick()
                      }
                    }}
                    category={article?.category}
                    articleId={article?._id}
                    disabled={false}
                    userQuizScore="?"
                    totalQuizQuestions={1}
                    hasCompletedInlineQuiz={true}
                  />
                </MotionBox>
                {isAuthenticated && (
                  <TotalUserAttempted
                    totalUsersGivenQuiz={totalUsersGivenQuiz}
                    notLoggedIn={!isAuthenticated}
                    RQM_score={RQM_score}
                    articleId={articleId}
                  />
                )}
                {/* Feature Highlights - Compact Layout */}
                {!isAuthenticated && (
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    w="100%"
                  >
                    <VStack spacing={{ base: 4, md: 5 }}>
                      {/* Feature Icons - Responsive Grid */}
                      <Box w="100%">
                        <Grid
                          templateColumns={{
                            base: 'repeat(2, 1fr)',
                            sm: 'repeat(4, 1fr)',
                            md: 'repeat(4, 1fr)',
                          }}
                          gap={{ base: 3, sm: 4, md: 6 }}
                          w="100%"
                          px={{ base: 2, md: 0 }}
                        >
                          <GridItem>
                            <VStack spacing={1}>
                              <Icon
                                as={Trophy}
                                boxSize={{ base: 4, md: 5 }}
                                color="yellow.400"
                              />
                              <Text
                                fontSize={{ base: 'xs', sm: 'sm' }}
                                fontWeight="500"
                                color="whiteAlpha.700"
                                textAlign="center"
                              >
                                Win Prizes
                              </Text>
                            </VStack>
                          </GridItem>

                          <GridItem>
                            <VStack spacing={1}>
                              <Icon
                                as={TrendingUp}
                                boxSize={{ base: 4, md: 5 }}
                                color="green.400"
                              />
                              <Text
                                fontSize={{ base: 'xs', sm: 'sm' }}
                                fontWeight="500"
                                color="whiteAlpha.700"
                                textAlign="center"
                              >
                                Track IQ
                              </Text>
                            </VStack>
                          </GridItem>

                          <GridItem>
                            <VStack spacing={1}>
                              <Icon
                                as={Users}
                                boxSize={{ base: 4, md: 5 }}
                                color="blue.400"
                              />
                              <Text
                                fontSize={{ base: 'xs', sm: 'sm' }}
                                fontWeight="500"
                                color="whiteAlpha.700"
                                textAlign="center"
                              >
                                1K+ Players
                              </Text>
                            </VStack>
                          </GridItem>

                          <GridItem>
                            <VStack spacing={1}>
                              <Icon
                                as={Zap}
                                boxSize={{ base: 4, md: 5 }}
                                color="purple.400"
                              />
                              <Text
                                fontSize={{ base: 'xs', sm: 'sm' }}
                                fontWeight="500"
                                color="whiteAlpha.700"
                                textAlign="center"
                              >
                                Daily Challenges
                              </Text>
                            </VStack>
                          </GridItem>
                        </Grid>
                      </Box>

                      {/* Trust Indicators */}
                      <Box
                        animation="subtle-glow 4s ease-in-out infinite"
                        sx={{
                          '@keyframes subtle-glow': {
                            '0%, 100%': { opacity: 0.8 },
                            '50%': { opacity: 1 },
                          },
                        }}
                        textAlign="center"
                      >
                        <Flex
                          align="center"
                          justify="center"
                          flexWrap="wrap"
                          gap={{ base: 1, md: 2 }}
                          px={{ base: 4, md: 0 }}
                        >
                          <Box
                            w={{ base: '3px', md: '4px' }}
                            h={{ base: '3px', md: '4px' }}
                            bg="orange.400"
                            borderRadius="full"
                          />
                          <Text
                            fontSize={{ base: 'xs', sm: 'sm' }}
                            color="orange.300"
                            fontWeight="600"
                            textAlign="center"
                            whiteSpace={{ base: 'nowrap', sm: 'normal' }}
                          >
                            Free signup • Instant access • No commitment
                          </Text>
                          <Box
                            w={{ base: '3px', md: '4px' }}
                            h={{ base: '3px', md: '4px' }}
                            bg="orange.400"
                            borderRadius="full"
                          />
                        </Flex>
                      </Box>
                    </VStack>
                  </MotionBox>
                )}

                {/* Bottom Instructions for Authenticated Users */}
                {isAuthenticated && (
                  <Box
                    textAlign="center"
                    mt={{ base: 4, md: 6 }}
                    px={{ base: 4, md: 0 }}
                  >
                    <Text
                      fontSize={{ base: '2xs', sm: 'xs' }}
                      color="whiteAlpha.500"
                      textAlign="center"
                    >
                      {isDesktop
                        ? 'Press ESC to exit immersive mode'
                        : 'Tap the view icon in header to switch reading modes'}
                    </Text>
                  </Box>
                )}
              </Flex>
            </Flex>
          )

        // Fixed Articles Section for GameModeLayout.jsx
        // This replaces the 'articles' case in renderCurrentSection function
        // Location: client/src/components/articleComponents/GameModeLayout.jsx
        // Replace lines approximately 1340-1580 (the entire 'articles' case)

        case 'articles':
          return (
            <Flex
              h="100vh"
              w="100%"
              alignItems="flex-start"
              justifyContent="center"
              px={{
                base: '12px',
                md: '20px',
                lg: isDesktop ? '40px' : '20px',
                xl: isLargeDesktop ? '60px' : '40px',
                '2xl': isExtraLargeDesktop ? '80px' : '60px',
              }}
              pt={{
                base: '70px',
                md: '80px',
                lg: '90px',
                xl: isLargeDesktop ? '100px' : '90px',
              }}
              pb={{
                base: 4,
                md: 6,
                lg: 8,
                xl: isLargeDesktop ? 10 : 8,
              }}
              position="relative"
              overflow="hidden"
              bg="radial-gradient(circle at 30% 70%, rgba(159, 122, 234, 0.04), transparent 70%)"
            >
              {/* Background Decoration */}
              <Box
                position="absolute"
                top="20%"
                left="15%"
                width={{
                  base: '60px',
                  md: '100px',
                  lg: '140px',
                  xl: isLargeDesktop ? '160px' : '140px',
                }}
                height={{
                  base: '60px',
                  md: '100px',
                  lg: '140px',
                  xl: isLargeDesktop ? '160px' : '140px',
                }}
                borderRadius="full"
                bg="rgba(214, 158, 46, 0.03)"
                filter="blur(40px)"
                animation="gentle-float 10s ease-in-out infinite"
                sx={{
                  '@keyframes gentle-float': {
                    '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(20px, -20px) scale(1.1)' },
                    '66%': { transform: 'translate(-15px, 15px) scale(0.9)' },
                  },
                }}
              />

              <Box
                position="absolute"
                bottom="30%"
                right="20%"
                width={{
                  base: '40px',
                  md: '80px',
                  lg: '120px',
                  xl: isLargeDesktop ? '140px' : '120px',
                }}
                height={{
                  base: '40px',
                  md: '80px',
                  lg: '120px',
                  xl: isLargeDesktop ? '140px' : '120px',
                }}
                borderRadius="full"
                bg="rgba(159, 122, 234, 0.03)"
                filter="blur(30px)"
                animation="gentle-float-reverse 12s ease-in-out infinite"
                sx={{
                  '@keyframes gentle-float-reverse': {
                    '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
                    '50%': { transform: 'translate(-25px, -25px) scale(1.2)' },
                  },
                }}
              />

              {/* FIXED: Main Content Container with proper height management */}
              <VStack
                spacing={{
                  base: 4,
                  md: 6,
                  lg: 8,
                  xl: isLargeDesktop ? 10 : 8,
                }}
                w="100%"
                maxW={{
                  base: '100%',
                  sm: '500px',
                  md: '700px',
                  lg: isDesktop ? '900px' : '700px',
                  xl: isLargeDesktop ? '1200px' : '900px',
                  '2xl': isExtraLargeDesktop ? '1400px' : '1200px',
                }}
                mx="auto"
                h="100%"
                justify="flex-start"
                align="stretch"
                overflow="hidden"
              >
                {/* Enhanced Header Section */}
                <MotionBox
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  textAlign="center"
                  w="100%"
                  flexShrink={0}
                >
                  <VStack spacing={{ base: 3, md: 4, lg: 5 }}>
                    <HStack spacing={{ base: 2, md: 3 }} justify="center">
                      <Box
                        w={{ base: '3px', md: '4px' }}
                        h={{ base: '3px', md: '4px' }}
                        bg="orange.400"
                        borderRadius="full"
                        animation="subtle-pulse 3s ease-in-out infinite"
                        sx={{
                          '@keyframes subtle-pulse': {
                            '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                            '50%': { opacity: 1, transform: 'scale(1.2)' },
                          },
                        }}
                      />
                      <Text
                        fontSize={{
                          base: 'lg',
                          sm: 'xl',
                          md: '2xl',
                          lg: isLargeDesktop ? '3xl' : '2xl',
                        }}
                        fontWeight="bold"
                        color="orange.400"
                        letterSpacing="wide"
                        textTransform="uppercase"
                      >
                        Discover More
                      </Text>
                      <Box
                        w={{ base: '3px', md: '4px' }}
                        h={{ base: '3px', md: '4px' }}
                        bg="purple.400"
                        borderRadius="full"
                        animation="subtle-pulse 3s ease-in-out infinite 0.5s"
                      />
                    </HStack>

                    <Text
                      fontSize={{
                        base: 'sm',
                        md: 'md',
                        lg: isLargeDesktop ? 'lg' : 'md',
                      }}
                      color="whiteAlpha.700"
                      maxW={{
                        base: '300px',
                        md: '400px',
                        lg: isLargeDesktop ? '500px' : '400px',
                      }}
                      lineHeight="1.5"
                      fontWeight="500"
                    >
                      Explore{' '}
                      {showRelated
                        ? 'related articles'
                        : 'personalized recommendations'}{' '}
                      curated just for you
                    </Text>
                  </VStack>
                </MotionBox>

                {/* Toggle Section */}
                <MotionBox
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  w="100%"
                  display="flex"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <RelatedArticlesToggle
                    showRelated={showRelated}
                    onToggle={onRelatedToggle}
                  />
                </MotionBox>

                {/* FIXED: Articles Container with proper overflow and height */}
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  w="100%"
                  flex={1}
                  bg="rgba(255, 255, 255, 0.02)"
                  borderRadius={{ base: 'xl', md: '2xl' }}
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  backdropFilter="blur(20px)"
                  p={{
                    base: 4,
                    md: 6,
                    lg: 6,
                    xl: isLargeDesktop ? 8 : 6,
                  }}
                  position="relative"
                  overflow="hidden"
                  display="flex"
                  flexDirection="column"
                  // FIXED: Remove restrictive maxH to allow content to flow
                  minH={{
                    base: '300px',
                    md: '400px',
                    lg: '450px',
                    xl: isLargeDesktop ? '500px' : '450px',
                  }}
                >
                  {/* Subtle Inner Glow */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="radial-gradient(circle at center, rgba(159, 122, 234, 0.02), transparent 60%)"
                    pointerEvents="none"
                    borderRadius={{ base: 'xl', md: '2xl' }}
                  />

                  {/* Articles Content with FIXED height management */}
                  <Box
                    position="relative"
                    zIndex={1}
                    h="100%"
                    display="flex"
                    flexDirection="column"
                    overflow="hidden"
                  >
                    {isAuthenticated ? (
                      <VStack spacing={0} w="100%" align="stretch" h="100%">
                        {/* IMPROVED: Articles Grid Container */}
                        <Box
                          w="100%"
                          flex="1"
                          overflowY="auto"
                          overflowX="hidden"
                          css={{
                            '&::-webkit-scrollbar': {
                              width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: 'rgba(159, 122, 234, 0.6)',
                              borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                              background: 'rgba(159, 122, 234, 0.8)',
                            },
                          }}
                          pr={{ base: 1, md: 2 }}
                          // FIXED: Remove bottom padding that was hiding Load More button
                        >
                          <VStack spacing={0} w="100%" align="stretch">
                            {/* Articles Grid */}
                            {(() => {
                              const articlesToShow = showRelated
                                ? latestNews.filter(
                                    item => item && item._id !== article?._id,
                                  )
                                : recommendedArticles.filter(
                                    item => item && item._id !== article?._id,
                                  )

                              if (!articlesToShow.length && !loading) {
                                return (
                                  <MotionBox
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    textAlign="center"
                                    py={{ base: 6, md: 8, lg: 10 }}
                                    w="100%"
                                  >
                                    <VStack spacing={{ base: 3, md: 4 }}>
                                      <Icon
                                        as={Users}
                                        boxSize={{ base: 10, md: 12, lg: 14 }}
                                        color="whiteAlpha.300"
                                      />
                                      <Text
                                        fontSize={{
                                          base: 'md',
                                          md: 'lg',
                                          lg: 'xl',
                                        }}
                                        color="whiteAlpha.600"
                                        fontWeight="500"
                                      >
                                        No{' '}
                                        {showRelated
                                          ? 'related'
                                          : 'recommended'}{' '}
                                        articles found
                                      </Text>
                                      <Text
                                        fontSize={{ base: 'xs', md: 'sm' }}
                                        color="whiteAlpha.400"
                                        maxW={{ base: '280px', md: '350px' }}
                                        textAlign="center"
                                      >
                                        Try exploring other categories or check
                                        back later
                                      </Text>
                                    </VStack>
                                  </MotionBox>
                                )
                              }

                              return (
                                <>
                                  {/* Articles Grid */}
                                  <Grid
                                    templateColumns={{
                                      base: '1fr',
                                      md: 'repeat(2, 1fr)',
                                      lg: 'repeat(2, 1fr)',
                                      xl: isExtraLargeDesktop
                                        ? 'repeat(3, 1fr)'
                                        : 'repeat(2, 1fr)',
                                    }}
                                    gap={{
                                      base: 4,
                                      md: 5,
                                      lg: 6,
                                      xl: isExtraLargeDesktop ? 5 : 6,
                                    }}
                                    w="100%"
                                    mb={{ base: 4, md: 6, lg: 8 }} // Space for Load More button
                                  >
                                    {articlesToShow.map((item, index) => (
                                      <GridItem
                                        key={`${item?._id}-${index}`}
                                        w="100%"
                                      >
                                        <MotionBox
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            duration: 0.5,
                                            delay: index * 0.1,
                                            ease: 'easeOut',
                                          }}
                                          whileHover={{
                                            y: -4,
                                            transition: {
                                              duration: 0.2,
                                              ease: 'easeOut',
                                            },
                                          }}
                                          onClick={e =>
                                            handleRelatedArticleClick(e, item)
                                          }
                                          style={
                                            !isAuthenticated
                                              ? {
                                                  filter: 'blur(5px)',
                                                  userSelect: 'none',
                                                }
                                              : {
                                                  userSelect: 'text',
                                                  cursor: 'pointer',
                                                }
                                          }
                                          bg="rgba(255, 255, 255, 0.03)"
                                          borderRadius={{
                                            base: 'lg',
                                            md: 'xl',
                                          }}
                                          border="1px solid"
                                          borderColor="rgba(255, 255, 255, 0.08)"
                                          overflow="hidden"
                                          position="relative"
                                          minH={{
                                            base: '140px',
                                            md: '160px',
                                            lg: '180px',
                                            xl: isExtraLargeDesktop
                                              ? '170px'
                                              : '180px',
                                          }}
                                          _hover={{
                                            borderColor:
                                              'rgba(159, 122, 234, 0.3)',
                                            bg: 'rgba(255, 255, 255, 0.06)',
                                            transform: 'translateY(-4px)',
                                            boxShadow:
                                              '0 8px 32px rgba(159, 122, 234, 0.15)',
                                          }}
                                          _active={{
                                            transform: 'translateY(-2px)',
                                          }}
                                        >
                                          {/* Loading Overlay */}
                                          {loadingRealatedArticles[
                                            item?._id
                                          ] && (
                                            <Flex
                                              position="absolute"
                                              top="0"
                                              left="0"
                                              right="0"
                                              bottom="0"
                                              backgroundColor="rgba(0, 0, 0, 0.7)"
                                              justifyContent="center"
                                              alignItems="center"
                                              borderRadius={{
                                                base: 'lg',
                                                md: 'xl',
                                              }}
                                              zIndex={3}
                                              backdropFilter="blur(4px)"
                                            >
                                              <VStack spacing={2}>
                                                <Spinner
                                                  thickness="3px"
                                                  speed="0.65s"
                                                  emptyColor="whiteAlpha.300"
                                                  color="purple.400"
                                                  size="lg"
                                                />
                                                <Text
                                                  fontSize="xs"
                                                  color="whiteAlpha.700"
                                                >
                                                  Loading...
                                                </Text>
                                              </VStack>
                                            </Flex>
                                          )}

                                          {/* Enhanced Card Content */}
                                          <Flex
                                            direction="column"
                                            h="100%"
                                            p={{ base: 4, md: 5 }}
                                          >
                                            {/* Article Metadata Header */}
                                            <Flex
                                              justify="space-between"
                                              align="center"
                                              mb={3}
                                              flexWrap={{
                                                base: 'wrap',
                                                sm: 'nowrap',
                                              }}
                                              gap={2}
                                            >
                                              <HStack
                                                spacing={2}
                                                minW={0}
                                                flex={1}
                                              >
                                                <Box
                                                  w="3px"
                                                  h="3px"
                                                  bg="purple.400"
                                                  borderRadius="full"
                                                  flexShrink={0}
                                                />
                                                <Text
                                                  fontSize={{
                                                    base: '2xs',
                                                    sm: 'xs',
                                                    xl: isExtraLargeDesktop
                                                      ? '2xs'
                                                      : 'xs',
                                                  }}
                                                  color="purple.300"
                                                  fontWeight="600"
                                                  textTransform="uppercase"
                                                  letterSpacing="wider"
                                                  noOfLines={1}
                                                >
                                                  {formatDate(
                                                    item?.dateTime,
                                                    formatDateTranslate,
                                                    i18n.language,
                                                  )}
                                                </Text>
                                              </HStack>

                                              <Badge
                                                colorScheme="orange"
                                                variant="subtle"
                                                fontSize="2xs"
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                                bg="rgba(214, 158, 46, 0.1)"
                                                color="orange.300"
                                                border="1px solid"
                                                borderColor="rgba(214, 158, 46, 0.2)"
                                                flexShrink={0}
                                              >
                                                {item?.avgReadTime || 'N/A'}{' '}
                                                {t('minRead')}
                                              </Badge>
                                            </Flex>

                                            {/* Main Content Area */}
                                            <Flex
                                              flex={1}
                                              gap={{ base: 3, md: 4 }}
                                              align="stretch"
                                            >
                                              {/* Article Image */}
                                              <Box
                                                position="relative"
                                                flexShrink={0}
                                                w={{
                                                  base: '80px',
                                                  sm: '100px',
                                                  md: '120px',
                                                  xl: isExtraLargeDesktop
                                                    ? '100px'
                                                    : '120px',
                                                }}
                                                h={{
                                                  base: '60px',
                                                  sm: '75px',
                                                  md: '90px',
                                                  xl: isExtraLargeDesktop
                                                    ? '75px'
                                                    : '90px',
                                                }}
                                                borderRadius={{
                                                  base: 'md',
                                                  md: 'lg',
                                                }}
                                                overflow="hidden"
                                                bg="rgba(255, 255, 255, 0.05)"
                                              >
                                                <Image
                                                  src={
                                                    (!blackListedImgUrls.find(
                                                      url =>
                                                        url ===
                                                        item?.imgURL?.[0],
                                                    ) &&
                                                      item?.imgURL?.[0]) ||
                                                    fallback_news_image
                                                  }
                                                  alt={t('articleImageAlt')}
                                                  onError={e => {
                                                    e.target.onerror = null
                                                    e.target.src =
                                                      fallback_news_image
                                                  }}
                                                  w="100%"
                                                  h="100%"
                                                  objectFit="cover"
                                                  loading="lazy"
                                                  transition="transform 0.3s ease"
                                                  _hover={{
                                                    transform: 'scale(1.05)',
                                                  }}
                                                />

                                                {/* Image Overlay for Better Text Contrast */}
                                                <Box
                                                  position="absolute"
                                                  top={0}
                                                  left={0}
                                                  right={0}
                                                  bottom={0}
                                                  bg="linear-gradient(135deg, rgba(159, 122, 234, 0.1), transparent 50%)"
                                                  opacity={0}
                                                  transition="opacity 0.3s ease"
                                                  _groupHover={{ opacity: 1 }}
                                                />
                                              </Box>

                                              {/* Article Text Content */}
                                              <Flex
                                                direction="column"
                                                flex={1}
                                                justify="center"
                                                minW={0}
                                              >
                                                <Text
                                                  fontSize={{
                                                    base: 'sm',
                                                    sm: 'md',
                                                    md: 'lg',
                                                    xl: isExtraLargeDesktop
                                                      ? 'md'
                                                      : 'lg',
                                                  }}
                                                  fontWeight="600"
                                                  color="white"
                                                  lineHeight={{
                                                    base: '1.3',
                                                    md: '1.4',
                                                  }}
                                                  noOfLines={{
                                                    base: 3,
                                                    md: 4,
                                                    xl: isExtraLargeDesktop
                                                      ? 3
                                                      : 4,
                                                  }}
                                                  mb={2}
                                                  transition="color 0.2s ease"
                                                  _groupHover={{
                                                    color: 'purple.200',
                                                  }}
                                                >
                                                  {i18n.language === 'en'
                                                    ? item?.title
                                                    : item?.hindiTitle}
                                                </Text>

                                                {/* Article Category/Tags */}
                                                {item?.category && (
                                                  <HStack spacing={2} mt="auto">
                                                    <Box
                                                      w="2px"
                                                      h="2px"
                                                      bg="orange.400"
                                                      borderRadius="full"
                                                    />
                                                    <Text
                                                      fontSize="2xs"
                                                      color="orange.300"
                                                      fontWeight="500"
                                                      textTransform="capitalize"
                                                      letterSpacing="wide"
                                                    >
                                                      {item?.category}
                                                    </Text>
                                                  </HStack>
                                                )}
                                              </Flex>
                                            </Flex>

                                            {/* Subtle Hover Indicator */}
                                            <Box
                                              position="absolute"
                                              bottom={0}
                                              left={0}
                                              right={0}
                                              h="2px"
                                              bg="linear-gradient(90deg, rgba(159, 122, 234, 0.6), rgba(214, 158, 46, 0.6))"
                                              transform="scaleX(0)"
                                              transformOrigin="left"
                                              transition="transform 0.3s ease"
                                              _groupHover={{
                                                transform: 'scaleX(1)',
                                              }}
                                            />
                                          </Flex>
                                        </MotionBox>
                                      </GridItem>
                                    ))}
                                  </Grid>

                                  {/* FIXED: Load More Button - Always visible with proper spacing */}
                                  {!loading && articlesToShow.length > 0 && (
                                    <Box
                                      w="100%"
                                      textAlign="center"
                                      py={{ base: 4, md: 6 }}
                                      flexShrink={0}
                                    >
                                      <MotionBox
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: 0.3,
                                          duration: 0.4,
                                        }}
                                      >
                                        <Button
                                          onClick={() =>
                                            showRelated
                                              ? fetchRelatedArticles()
                                              : fetchRecommendedArticles()
                                          }
                                          size={{
                                            base: 'md',
                                            md: 'lg',
                                            lg: isLargeDesktop ? 'lg' : 'md',
                                          }}
                                          bg="rgba(159, 122, 234, 0.1)"
                                          border="2px solid"
                                          borderColor="rgba(159, 122, 234, 0.3)"
                                          color="purple.300"
                                          borderRadius="xl"
                                          px={{ base: 6, md: 8, lg: 10 }}
                                          py={{ base: 2, md: 3 }}
                                          fontWeight="600"
                                          letterSpacing="wide"
                                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                          _hover={{
                                            bg: 'rgba(159, 122, 234, 0.2)',
                                            borderColor:
                                              'rgba(159, 122, 234, 0.5)',
                                            color: 'purple.200',
                                            transform: 'translateY(-2px)',
                                            boxShadow:
                                              '0 8px 25px rgba(159, 122, 234, 0.2)',
                                          }}
                                          _active={{
                                            transform: 'translateY(0px)',
                                            boxShadow:
                                              '0 4px 15px rgba(159, 122, 234, 0.2)',
                                          }}
                                          leftIcon={
                                            <Icon
                                              as={TrendingUp}
                                              boxSize={{
                                                base: 4,
                                                md: 5,
                                                lg: isLargeDesktop ? 5 : 4,
                                              }}
                                              transition="transform 0.2s ease"
                                              _groupHover={{
                                                transform: 'rotate(12deg)',
                                              }}
                                            />
                                          }
                                        >
                                          {t('loadMore')}
                                        </Button>
                                      </MotionBox>
                                    </Box>
                                  )}

                                  {/* Loading State */}
                                  {loading && (
                                    <MotionBox
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ duration: 0.3 }}
                                      mt={4}
                                      w="100%"
                                    >
                                      <ArticleListSkeleton
                                        count={
                                          isExtraLargeDesktop
                                            ? 6
                                            : isLargeDesktop
                                            ? 4
                                            : isDesktop
                                            ? 4
                                            : 2
                                        }
                                      />
                                    </MotionBox>
                                  )}
                                </>
                              )
                            })()}
                          </VStack>
                        </Box>
                      </VStack>
                    ) : (
                      <Flex
                        h="100%"
                        align="center"
                        justify="center"
                        direction="column"
                        textAlign="center"
                        gap={{ base: 3, md: 4 }}
                        filter="blur(2px)"
                      >
                        <Icon
                          as={Users}
                          boxSize={{
                            base: 12,
                            md: 16,
                            lg: isLargeDesktop ? 20 : 16,
                          }}
                          color="whiteAlpha.200"
                        />
                        <Text
                          fontSize={{
                            base: 'md',
                            md: 'lg',
                            lg: isLargeDesktop ? 'xl' : 'lg',
                          }}
                          color="whiteAlpha.400"
                        >
                          Sign in to explore articles
                        </Text>
                      </Flex>
                    )}
                  </Box>

                  {/* Decorative Border Animation */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    borderRadius={{ base: 'xl', md: '2xl' }}
                    border="1px solid transparent"
                    bgGradient="linear(45deg, rgba(159, 122, 234, 0.2), rgba(214, 158, 46, 0.2), rgba(159, 122, 234, 0.2))"
                    bgSize="300% 300%"
                    animation="gradient-shift 8s ease-in-out infinite"
                    opacity={0.3}
                    pointerEvents="none"
                    sx={{
                      '@keyframes gradient-shift': {
                        '0%, 100%': { backgroundPosition: '0% 50%' },
                        '50%': { backgroundPosition: '100% 50%' },
                      },
                    }}
                    mask="linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)"
                    maskComposite="xor"
                    WebkitMask="linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)"
                    WebkitMaskComposite="xor"
                    p="1px"
                  />
                </MotionBox>

                {/* Enhanced Footer */}
                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  textAlign="center"
                  w="100%"
                  flexShrink={0}
                >
                  <VStack spacing={2}>
                    <HStack spacing={2} justify="center">
                      <Box
                        w="2px"
                        h="2px"
                        bg="whiteAlpha.400"
                        borderRadius="full"
                      />
                      <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        color="whiteAlpha.400"
                        fontWeight="500"
                      >
                        You've reached the end of this article
                      </Text>
                      <Box
                        w="2px"
                        h="2px"
                        bg="whiteAlpha.400"
                        borderRadius="full"
                      />
                    </HStack>

                    {isDesktop && (
                      <Text fontSize="2xs" color="whiteAlpha.300" mt={1}>
                        Press ESC to exit immersive mode
                      </Text>
                    )}
                  </VStack>
                </MotionBox>
              </VStack>
            </Flex>
          )

        default:
          return null
      }
    }, [
      currentSectionData,
      article,
      title,
      selectedLanguage,
      mainText,
      themedContent,
      imgURL,
      dictionary,
      importantSentences,
      bookmark,
      avgTimeRead,
      dateTime,
      bookmarkStatus,
      openModal,
      onThemeChange,
      openStreakSurgeModal,
      openCategoryBoostModal,
      readingMode,
      onReadingModeChange,
      isAuthenticated,
      actualContentPages,
      isContentReady,
      selectedAnswers,
      showStatistics,
      hasAnswered,
      getUserAnswer,
      getQuestionStatistics,
      handleQuizAnswer,
      onQuizButtonClick,
      totalUsersGivenQuiz,
      RQM_score,
      showRelated,
      onRelatedToggle,
      isDesktop,
      isLargeDesktop,
      isExtraLargeDesktop,
      renderArticles,
      recommendedArticles,
      latestNews,
      quizQuestions,
    ])

    // Effects
    useEffect(() => {
      dispatch({ type: 'SET_QUIZ_PAGES', payload: quizPageCalculations })
    }, [quizPageCalculations])

    // Content readiness detection
    useEffect(() => {
      const handleContentReady = event => {
        if (event.detail?.totalPages) {
          startTransition(() => {
            dispatch({
              type: 'SET_CONTENT_PAGES',
              payload: event.detail.totalPages,
            })
            dispatch({ type: 'SET_CONTENT_READY', payload: true })
          })
        }
      }

      window.addEventListener('contentPagesCalculated', handleContentReady)
      return () =>
        window.removeEventListener('contentPagesCalculated', handleContentReady)
    }, [])

    // Fallback quiz generation
    useEffect(() => {
      if (
        isContentReady &&
        importantSentences?.length >= 2 &&
        quizQuestions.length === 0 &&
        !quizLoading &&
        !quizGenerating
      ) {
        const fallbackTimer = setTimeout(() => {
          generateQuizQuestions({ force: false }).catch(console.error)
        }, 2000)

        return () => clearTimeout(fallbackTimer)
      }
    }, [
      isContentReady,
      importantSentences,
      quizQuestions.length,
      quizLoading,
      quizGenerating,
      generateQuizQuestions,
    ])

    useEffect(() => {
      if (!isDesktop) return

      const handleDesktopNavigate = event => {
        const { action, direction } = event.detail

        switch (action) {
          case 'navigate':
            navigateToSection(direction)
            break
          case 'goToTop':
            handleGoToTop()
            break
          case 'goToBottom':
            if (currentSection < totalSections - 1) {
              dispatch({
                type: 'NAVIGATION_START',
                direction: 1,
                targetSection: totalSections - 1,
              })
              setTimeout(() => {
                dispatch({
                  type: 'NAVIGATION_COMPLETE',
                  targetSection: totalSections - 1,
                })
                dispatch({ type: 'SET_TRANSITIONING', payload: false })
              }, pageTransition.duration * 1000)
            }
            break
          default:
            break
        }
      }

      window.addEventListener('desktopNavigate', handleDesktopNavigate)

      return () => {
        window.removeEventListener('desktopNavigate', handleDesktopNavigate)
      }
    }, [
      isDesktop,
      navigateToSection,
      handleGoToTop,
      currentSection,
      totalSections,
    ])

    // Enhanced event listeners with desktop support
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const touchOptions = { passive: false }
      const wheelOptions = { passive: false }

      // Desktop mouse move for idle detection
      if (isDesktop) {
        container.addEventListener('mousemove', handleMouseMove, {
          passive: true,
        })
      }

      // Touch events for mobile/tablet
      if (!isDesktop) {
        container.addEventListener('touchstart', handleTouchStart, touchOptions)
        container.addEventListener('touchmove', handleTouchMove, touchOptions)
        container.addEventListener('touchend', handleTouchEnd, touchOptions)
      }

      // FIXED: Wheel events for desktop with proper passive handling
      container.addEventListener('wheel', handleWheel, wheelOptions)

      // Keyboard events
      window.addEventListener('keydown', handleKeyDown)

      // Document-level pull-to-refresh prevention for mobile
      const preventPullToRefresh = e => {
        if (
          !isDesktop &&
          currentSection > 0 &&
          e.touches &&
          e.touches.length === 1
        ) {
          const touch = e.touches[0]
          const isAtTop = window.scrollY === 0
          const isTopArea = touch.clientY < 150

          if (isAtTop && isTopArea) {
            window._pullToRefreshStart = {
              y: touch.clientY,
              time: Date.now(),
            }
          }
        }
      }

      const preventDocumentPullToRefresh = e => {
        if (
          !isDesktop &&
          currentSection > 0 &&
          window._pullToRefreshStart &&
          e.touches &&
          e.touches.length === 1
        ) {
          const touch = e.touches[0]
          const deltaY = touch.clientY - window._pullToRefreshStart.y
          const isAtTop = window.scrollY === 0

          if (isAtTop && deltaY > 20) {
            e.preventDefault()
            e.stopPropagation()
          }
        }
      }

      const cleanupPullToRefresh = () => {
        delete window._pullToRefreshStart
      }

      if (!isDesktop) {
        document.addEventListener('touchstart', preventPullToRefresh, {
          passive: true,
        })
        document.addEventListener('touchmove', preventDocumentPullToRefresh, {
          passive: false,
        })
        document.addEventListener('touchend', cleanupPullToRefresh, {
          passive: true,
        })
        document.addEventListener('touchcancel', cleanupPullToRefresh, {
          passive: true,
        })
      }

      return () => {
        if (isDesktop) {
          container.removeEventListener('mousemove', handleMouseMove)
        } else {
          container.removeEventListener('touchstart', handleTouchStart)
          container.removeEventListener('touchmove', handleTouchMove)
          container.removeEventListener('touchend', handleTouchEnd)
        }

        container.removeEventListener('wheel', handleWheel)
        window.removeEventListener('keydown', handleKeyDown)

        if (!isDesktop) {
          document.removeEventListener('touchstart', preventPullToRefresh)
          document.removeEventListener(
            'touchmove',
            preventDocumentPullToRefresh,
          )
          document.removeEventListener('touchend', cleanupPullToRefresh)
          document.removeEventListener('touchcancel', cleanupPullToRefresh)
        }

        delete window._pullToRefreshStart

        if (mouseIdleTimeoutRef.current) {
          clearTimeout(mouseIdleTimeoutRef.current)
        }
      }
    }, [
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleWheel,
      handleKeyDown,
      handleMouseMove,
      currentSection,
      isDesktop,
    ])

    // Hide desktop hint after some time
    useEffect(() => {
      if (showDesktopNavigationHint && isDesktop) {
        const timer = setTimeout(() => {
          dispatch({ type: 'SET_DESKTOP_NAVIGATION_HINT', payload: false })
        }, 5000) // Hide after 5 seconds

        return () => clearTimeout(timer)
      }
    }, [showDesktopNavigationHint, isDesktop])

    return (
      <Box
        ref={containerRef}
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        color="white"
        overflow="hidden"
        zIndex={1000}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {!isAuthenticated && loginCheckStatus === 'fulfilled' && (
          <PremiumCTA readProgress={progress} />
        )}
        {/* Enhanced Progress Bar */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={20}
          py={isDesktop ? 4 : 3}
          px={isDesktop ? 6 : 4}
          bg="rgba(0,0,0,0.4)"
          backdropFilter="blur(20px)"
          borderBottom="1px solid rgba(255,255,255,0.1)"
          opacity={
            isDesktop
              ? isMouseIdle && !showDesktopControls && !isUserInteracting
                ? 0.3
                : 1
              : 1
          }
          transition="opacity 0.5s ease"
          _hover={isDesktop ? { opacity: 1 } : {}}
          onMouseEnter={isDesktop ? onForceShowControls : undefined}
        >
          <VStack spacing={2} align="stretch">
            <Flex justify="center" align="center">
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <HStack spacing={2} align="center">
                  <Box
                    w="4px"
                    h="4px"
                    bg="#9F7AEA"
                    borderRadius="full"
                    boxShadow="0 0 8px rgba(159, 122, 234, 0.6)"
                  />
                  <Text
                    fontSize={isDesktop ? 'sm' : 'xs'}
                    fontWeight="600"
                    color="white"
                    textAlign="center"
                    letterSpacing="1.5px"
                    textTransform="uppercase"
                    opacity={0.9}
                  >
                    Immersive Mode
                  </Text>
                  <Box
                    w="4px"
                    h="4px"
                    bg="#D69E2E"
                    borderRadius="full"
                    boxShadow="0 0 8px rgba(214, 158, 46, 0.6)"
                  />
                </HStack>
              </MotionBox>
            </Flex>

            <Box
              h={isDesktop ? '3px' : '2px'}
              bg="rgba(255,255,255,0.15)"
              borderRadius="full"
              overflow="hidden"
              position="relative"
            >
              <MotionBox
                h="100%"
                bg="linear-gradient(90deg, #9F7AEA, #D69E2E)"
                borderRadius="full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={springTransition}
                boxShadow="0 0 12px rgba(159, 122, 234, 0.4)"
              />
            </Box>
          </VStack>

          {progress >= 100 && (
            <MotionBox
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              position="absolute"
              top={2}
              right={4}
            >
              <Text fontSize="xs" color="#48BB78" fontWeight="600">
                ✓ Complete
              </Text>
            </MotionBox>
          )}
        </Box>

        {/* Enhanced Desktop Navigation Buttons with Better State Management */}
        {isDesktop && (showDesktopControls || isUserInteracting) && (
          <AnimatePresence>
            <MotionBox
              initial={{ opacity: 0, x: -30 }}
              animate={{
                opacity: showDesktopControls || isUserInteracting ? 1 : 0.4,
                x: 0,
              }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Up Navigation - Fixed Positioning */}
              {currentSection > 0 && (
                <Box
                  position="fixed"
                  top="50%"
                  left={6}
                  transform="translateY(-70px)" // Fixed position
                  zIndex={30}
                >
                  <Tooltip
                    label={
                      <VStack spacing={1} align="center">
                        <Text fontSize="sm" fontWeight="600">
                          Previous Section
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          Scroll up or ↑
                        </Text>
                      </VStack>
                    }
                    placement="right"
                    hasArrow
                    bg="gray.800"
                    color="white"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    isDisabled={!showDesktopControls}
                  >
                    <MotionBox
                      as="button"
                      onClick={navigateUp}
                      bg="linear-gradient(135deg, rgba(159, 122, 234, 0.9), rgba(124, 58, 237, 0.9))"
                      color="white"
                      borderRadius="full"
                      p={4}
                      boxShadow="0 4px 20px rgba(159, 122, 234, 0.4)"
                      backdropFilter="blur(10px)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      opacity={
                        showDesktopControls || isUserInteracting ? 1 : 0.3
                      }
                      cursor="pointer"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w="56px"
                      h="56px"
                      whileHover={{
                        scale: 1.1,
                        boxShadow: '0 6px 25px rgba(159, 122, 234, 0.6)',
                        bg: 'linear-gradient(135deg, rgba(159, 122, 234, 1), rgba(124, 58, 237, 1))',
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onMouseEnter={() => {
                        if (onForceShowControls) onForceShowControls()
                      }}
                      transition="all 0.3s ease"
                      style={{
                        position: 'relative',
                        transform: 'none',
                      }}
                    >
                      <MotionBox
                        animate={{ y: [0, -2, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Icon as={ChevronUp} boxSize={6} />
                      </MotionBox>
                    </MotionBox>
                  </Tooltip>
                </Box>
              )}

              {/* Down Navigation - Fixed Positioning */}
              {currentSection < totalSections - 1 && (
                <Box
                  position="fixed"
                  top="50%"
                  left={6}
                  transform="translateY(10px)" // Fixed position
                  zIndex={30}
                >
                  <Tooltip
                    label={
                      <VStack spacing={1} align="center">
                        <Text fontSize="sm" fontWeight="600">
                          Next Section
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          Scroll down or ↓
                        </Text>
                      </VStack>
                    }
                    placement="right"
                    hasArrow
                    bg="gray.800"
                    color="white"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    isDisabled={!showDesktopControls}
                  >
                    <MotionBox
                      as="button"
                      onClick={navigateDown}
                      bg="linear-gradient(135deg, rgba(214, 158, 46, 0.9), rgba(255, 193, 7, 0.9))"
                      color="white"
                      borderRadius="full"
                      p={4}
                      boxShadow="0 4px 20px rgba(214, 158, 46, 0.4)"
                      backdropFilter="blur(10px)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      opacity={
                        showDesktopControls || isUserInteracting ? 1 : 0.3
                      }
                      cursor="pointer"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w="56px"
                      h="56px"
                      whileHover={{
                        scale: 1.1,
                        boxShadow: '0 6px 25px rgba(214, 158, 46, 0.6)',
                        bg: 'linear-gradient(135deg, rgba(214, 158, 46, 1), rgba(255, 193, 7, 1))',
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onMouseEnter={() => {
                        if (onForceShowControls) onForceShowControls()
                      }}
                      transition="all 0.3s ease"
                      style={{
                        position: 'relative',
                        transform: 'none',
                      }}
                    >
                      <MotionBox
                        animate={{ y: [0, 2, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Icon as={ChevronDown} boxSize={6} />
                      </MotionBox>
                    </MotionBox>
                  </Tooltip>
                </Box>
              )}
            </MotionBox>
          </AnimatePresence>
        )}

        {/* Enhanced Go To Top Button */}
        <AnimatePresence>
          {showGoToTop && (
            <MotionBox
              initial="hidden"
              animate="visible"
              exit="hidden"
              whileHover="hover"
              whileTap="tap"
              variants={goToTopVariants}
              transition={springTransition}
              position="fixed"
              bottom={{ base: 6, md: 8, lg: isDesktop ? 10 : 8 }}
              right={{ base: 4, md: 6, lg: isDesktop ? 8 : 6 }}
              zIndex={30}
              opacity={
                isDesktop
                  ? showDesktopControls || isUserInteracting
                    ? 1
                    : 0.4
                  : 1
              }
              onMouseEnter={() => {
                if (isDesktop && onForceShowControls) onForceShowControls()
              }}
            >
              {/* Desktop Version - Premium Thin Design */}
              {isDesktop ? (
                <Tooltip
                  label="Back to article beginning"
                  placement="left"
                  hasArrow
                  bg="rgba(0,0,0,0.9)"
                  color="white"
                  fontSize="xs"
                  px={2}
                  py={1.5}
                  borderRadius="md"
                  openDelay={300}
                >
                  <MotionBox
                    as="button"
                    onClick={handleGoToTop}
                    bg="rgba(255, 255, 255, 0.95)"
                    color="gray.700"
                    borderRadius="full"
                    px={3}
                    py={2}
                    boxShadow="0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    backdropFilter="blur(20px)"
                    border="1px solid rgba(255, 255, 255, 0.3)"
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    maxW="120px"
                    height="36px"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow:
                        '0 8px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      bg: 'rgba(255, 255, 255, 1)',
                      color: 'gray.800',
                    }}
                    _active={{
                      transform: 'translateY(0px)',
                      boxShadow:
                        '0 2px 10px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                      y: 0,
                    }}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    style={{
                      willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Subtle gradient overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="linear-gradient(135deg, rgba(159, 122, 234, 0.08), rgba(214, 158, 46, 0.08))"
                      borderRadius="full"
                      zIndex={-1}
                    />

                    {/* Icon with subtle animation */}
                    <MotionBox
                      animate={{ y: [0, -1, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Icon as={ChevronUp} boxSize={4} color="gray.600" />
                    </MotionBox>

                    {/* Compact Text Label */}
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      lineHeight="1"
                      color="gray.700"
                      letterSpacing="tight"
                    >
                      Top
                    </Text>

                    {/* Premium accent line */}
                    <Box
                      position="absolute"
                      bottom={0}
                      left="20%"
                      right="20%"
                      h="1px"
                      bg="linear-gradient(90deg, transparent, rgba(159, 122, 234, 0.4), transparent)"
                    />
                  </MotionBox>
                </Tooltip>
              ) : (
                /* Mobile Version - Keep Simple */
                <MotionIconButton
                  onClick={handleGoToTop}
                  size={isMobile ? 'md' : 'lg'}
                  icon={<Icon as={ChevronUp} boxSize={isMobile ? 5 : 6} />}
                  bg="rgba(159, 122, 234, 0.9)"
                  color="white"
                  borderRadius="full"
                  boxShadow="0 4px 20px rgba(159, 122, 234, 0.4)"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  aria-label="Go to top"
                  _hover={{
                    bg: 'rgba(159, 122, 234, 1)',
                    boxShadow: '0 6px 25px rgba(159, 122, 234, 0.6)',
                    transform: 'translateY(-2px)',
                  }}
                  _active={{
                    bg: 'rgba(159, 122, 234, 0.8)',
                    transform: 'translateY(0px)',
                  }}
                />
              )}
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Page Container */}
        <Box position="relative" w="100%" h="100vh" overflow="hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <MotionBox
              key={currentSection}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              w="100%"
              h="100vh"
              style={{
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
              }}
            >
              {renderCurrentSection()}
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>
    )
  },
)

GameModeLayout.displayName = 'GameModeLayout'

export default GameModeLayout
