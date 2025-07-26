// Enhanced GameModeLayout.jsx with FIXED internal scrolling support
// Location: client/src/components/articleComponents/GameModeLayout.jsx
// FIXED: Internal scrolling now works properly on desktop while maintaining page navigation

import React, {
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  startTransition,
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
  }) => {
    // Enhanced state with desktop features
    const [gameState, dispatch] = useReducer(gameStateReducer, initialGameState)
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

    // NEW: Desktop-specific gesture threshold
    const gestureThreshold = useMemo(() => {
      if (isDesktop) return 100 // Larger threshold for desktop mouse wheel
      return isMobile ? 50 : 70
    }, [isMobile, isDesktop])

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

    // Quiz answer handler
    const handleQuizAnswer = useCallback(
      async (questionId, answerIndex) => {
        try {
          await submitAnswer(questionId, answerIndex)
        } catch (error) {
          console.error('Error submitting quiz answer:', error)
        }
      },
      [submitAnswer],
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
          index === 0 ? item.earliestPage : currentQuizPage + 1
        currentQuizPage = Math.max(assignedPage, currentQuizPage + 1)

        detectedQuizPages.push({
          afterPageIndex: currentQuizPage,
          quiz: item.quiz,
          sectionIndex: 1 + currentQuizPage + 1 + index,
        })
      })

      return detectedQuizPages
    }, [isContentReady, quizQuestions, importantSentences, actualContentPages])

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
              alignItems="center"
              justifyContent="center"
              pt={sectionPaddingTop}
              pb={8}
              px={sectionPadding}
              position="relative"
              bgGradient="radial(circle at center, rgba(159, 122, 234, 0.03), transparent 70%)"
            >
              <Box
                position="absolute"
                top={sectionPaddingTop}
                w="100%"
                display="flex"
                justifyContent="center"
              >
                <HStack spacing={3} align="center">
                  <Icon as={CheckCircle} color="green.400" boxSize={5} />
                  <Text
                    fontSize="lg"
                    fontWeight="600"
                    color="green.400"
                    letterSpacing="wide"
                  >
                    Reading Complete
                  </Text>
                  <Box
                    w="3px"
                    h="3px"
                    bg="green.400"
                    borderRadius="full"
                    animation="pulse 2s ease-in-out infinite"
                  />
                </HStack>
              </Box>

              <Flex
                w="100%"
                h="100%"
                alignItems="center"
                justifyContent="center"
                px={{ base: 4, md: 6, lg: isDesktop ? 8 : 6 }}
              >
                <VStack
                  spacing={isDesktop ? 12 : 10}
                  w="100%"
                  maxW={isDesktop ? '500px' : '420px'}
                  align="center"
                >
                  <Box w="100%" display="flex" justifyContent="center">
                    <GameHubButton
                      onClick={onQuizButtonClick}
                      category={article?.category}
                      articleId={article?._id}
                      disabled={!isAuthenticated}
                    />
                  </Box>

                  <TotalUserAttempted
                    totalUsersGivenQuiz={totalUsersGivenQuiz}
                    notLoggedIn={!isAuthenticated}
                    RQM_score={RQM_score}
                    articleId={article?._id}
                  />

                  {isAuthenticated && (
                    <Box textAlign="center">
                      <Text fontSize="sm" color="whiteAlpha.600" mb={2}>
                        {isDesktop
                          ? 'Use scroll wheel or arrow keys to continue'
                          : 'Continue scrolling for more articles'}
                      </Text>
                      <Box
                        w="6px"
                        h="15px"
                        bg="linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))"
                        mx="auto"
                        borderRadius="full"
                        animation="bounce 2s ease-in-out infinite"
                        sx={{
                          '@keyframes bounce': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-8px)' },
                          },
                        }}
                      />
                    </Box>
                  )}

                  <Box textAlign="center" pt={4}>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {isDesktop
                        ? 'Press ESC to exit immersive mode'
                        : 'Tap the view icon in header to switch reading modes'}
                    </Text>
                  </Box>
                </VStack>
              </Flex>
            </Flex>
          )

        case 'articles':
          return (
            <Flex
              h="100vh"
              w="100%"
              alignItems="center"
              justifyContent="center"
              px={sectionPadding}
              pt={sectionPaddingTop}
              pb={8}
              bgGradient="radial(circle at center, rgba(214, 158, 46, 0.03), transparent 70%)"
            >
              <VStack
                spacing={isDesktop ? 10 : 8}
                w="100%"
                maxW={isDesktop ? '500px' : '400px'}
                align="center"
              >
                <Box textAlign="center">
                  <HStack spacing={3} justify="center" mb={3}>
                    <Icon as={Users} color="orange.400" boxSize={6} />
                    <Text
                      fontSize="xl"
                      fontWeight="bold"
                      color="orange.400"
                      letterSpacing="wide"
                    >
                      Discover More
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="whiteAlpha.700">
                    Explore related articles and personalized recommendations
                  </Text>
                </Box>

                <RelatedArticlesToggle
                  showRelated={showRelated}
                  onToggle={onRelatedToggle}
                />

                <Box
                  w="100%"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  p={isDesktop ? 8 : 6}
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  textAlign="center"
                  minH={isDesktop ? '250px' : '200px'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <VStack spacing={3}>
                    <Box
                      w="40px"
                      h="40px"
                      border="2px solid"
                      borderColor="whiteAlpha.300"
                      borderTopColor="orange.400"
                      borderRadius="full"
                      animation="spin 1s linear infinite"
                      sx={{
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                    <Text fontSize="sm" color="whiteAlpha.600">
                      {showRelated
                        ? 'Loading related articles...'
                        : 'Loading recommendations...'}
                    </Text>
                  </VStack>
                </Box>

                <Box textAlign="center" pt={4}>
                  <Text fontSize="xs" color="whiteAlpha.400">
                    You've reached the end
                  </Text>
                </Box>
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
