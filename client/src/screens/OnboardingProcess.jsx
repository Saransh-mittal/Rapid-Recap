import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, useToast } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import i18n from 'i18next'
import LanguageSelection from '../components/onboarding/LanguageSelection'
import CategorySelection from '../components/onboarding/CategorySelection'
import Welcome from '../components/onboarding/Welcome'
import QuizQuestion from '../components/onboarding/QuizQuestion'
import QuizResult from '../components/onboarding/QuizResult'
import ArticleReading from '../components/onboarding/ArticleReading'
import LeaderboardOnboarding from '../components/onboarding/LeaderboardOnboarding'
import { setUser } from '../redux/authSlice'
import { setArticleData } from '../redux/articleSlice'
import { setIsOpen } from '../redux/quizSlice'
import { useFeatureDetection } from '../utils/featureDetection'
import useSafeSound from '../customHooks/useSafeSound'

const MotionBox = motion(Box)

// Star component remains the same...
const Star = React.memo(({ size, top, left }) => (
  <motion.div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'white',
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
    }}
    animate={{
      y: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
      x: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
    }}
    transition={{
      duration: Math.random() * 2 + 1,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    }}
  />
))

// Define step constants
const ONBOARDING_STEPS = {
  LANGUAGE: 'language',
  WELCOME: 'welcome',
  CATEGORIES: 'categories',
  QUIZ_QUESTION: 'quiz_question',
  QUIZ_RESULT: 'quiz_result',
  ARTICLE_READING: 'article_reading',
  LEADERBOARD: 'leaderboard',
}

// Define step sequence
const STEP_SEQUENCE = [
  ONBOARDING_STEPS.LANGUAGE,
  ONBOARDING_STEPS.WELCOME,
  ONBOARDING_STEPS.CATEGORIES,
  ONBOARDING_STEPS.QUIZ_QUESTION,
  ONBOARDING_STEPS.QUIZ_RESULT,
  ONBOARDING_STEPS.ARTICLE_READING,
  ONBOARDING_STEPS.LEADERBOARD,
]

const OnboardingProcess = ({ setIsGuestLoggedin }) => {
  const [currentStepId, setCurrentStepId] = useState(ONBOARDING_STEPS.LANGUAGE)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [initialQuizCorrect, setInitialQuizCorrect] = useState(false)
  const [article, setArticle] = useState(null)
  const [isArticleFetching, setIsArticleFetching] = useState(false)

  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { onBoardingQuizSubmitted } = useSelector(state => state.quiz)
  const toast = useToast()

  // Generate stars
  const stars = useMemo(
    () =>
      Array(25)
        .fill()
        .map((_, i) => ({
          size: Math.random() * 3 + 1,
          top: Math.random() * 100,
          left: Math.random() * 100,
        })),
    [],
  )

  const getNextStepId = useCallback(currentId => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentId)
    return STEP_SEQUENCE[currentIndex + 1] || currentId
  }, [])

  const sanitizeData = (stepId, data) => {
    // Sanitize data for the current step
    switch (stepId) {
      case ONBOARDING_STEPS.LANGUAGE:
        return {
          language: data.language,
        }
      case ONBOARDING_STEPS.CATEGORIES:
        return {
          categories: data.categories,
        }
      case ONBOARDING_STEPS.QUIZ_RESULT:
        return {
          quizResult: data.quizResult,
        }
      case ONBOARDING_STEPS.WELCOME:
        return {
          language: data.language,
        }
      default:
        return {}
    }
  }

  const updateOnboardingProgress = async (
    currentStepId,
    nextStepId,
    rawData = {},
  ) => {
    try {
      // Sanitize data for the current step
      const sanitizedData = sanitizeData(currentStepId, rawData)
      const payload = {
        currentStep: STEP_SEQUENCE.indexOf(currentStepId) + 1,
        step: STEP_SEQUENCE.indexOf(nextStepId) + 1,
        currentStepId,
        nextStepId,
        ...sanitizedData,
      }

      await axios.post('/api/user/onboarding-progress', payload)
    } catch (error) {
      console.error('Failed to update onboarding progress:', error)
      throw error
    }
  }

  const handleLanguageSelect = async lang => {
    try {
      setSelectedLanguage(lang)
      await i18n.changeLanguage(lang)
      const nextStepId = ONBOARDING_STEPS.WELCOME
      await updateOnboardingProgress(ONBOARDING_STEPS.LANGUAGE, nextStepId, {
        language: lang,
      })
      setCurrentStepId(nextStepId)
      fetchOnBoardingArticle()
    } catch (error) {
      console.error('Failed to update language:', error)
      toast({
        title: 'Error',
        description: 'Failed to update language. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  const handleNext = async (rawData = {}) => {
    try {
      const nextStepId = getNextStepId(currentStepId)
      if (nextStepId !== currentStepId) {
        await updateOnboardingProgress(currentStepId, nextStepId, rawData)
        setCurrentStepId(nextStepId)

        if (nextStepId === ONBOARDING_STEPS.CATEGORIES) {
          axios.get(
            `/api/recommendation?page=${1}&pageSize=18&lang=${i18n.language}`,
          )
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to proceed to next step. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleFinish = async () => {
    try {
      await updateOnboardingProgress(
        ONBOARDING_STEPS.LEADERBOARD,
        ONBOARDING_STEPS.LEADERBOARD,
        {},
      )
      dispatch(
        setUser({
          ...user,
          needsOnboarding: false,
          onboardingStep: STEP_SEQUENCE.length,
        }),
      )
      if (user.role === 'guest') setIsGuestLoggedin(true)
      navigate('/home/all')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleQuizComplete = isCorrect => {
    setInitialQuizCorrect(isCorrect)
    const nextStepId = ONBOARDING_STEPS.QUIZ_RESULT
    updateOnboardingProgress(ONBOARDING_STEPS.QUIZ_QUESTION, nextStepId, {
      quizResult: isCorrect,
    })
    setCurrentStepId(nextStepId)
  }

  const handleCategoryToggle = category => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else if (prev.length < 5) {
        return [...prev, category]
      }
      return prev
    })
  }

  const fetchOnBoardingArticle = useCallback(async () => {
    if (isArticleFetching) return
    setIsArticleFetching(true)
    try {
      const response = await axios.get(`/api/articles/onboarding`)
      setArticle(response.data)

      dispatch(setArticleData(response.data))
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Failed to fetch article. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsArticleFetching(false)
    }
  }, [dispatch, isArticleFetching, toast])

  const handleQuizButtonClick = useCallback(() => {
    playClick()
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to take the quiz.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    dispatch(setIsOpen(true))
  }, [isAuthenticated, playClick, toast, dispatch])

  useEffect(() => {
    const fetchUserOnboardingProgress = async () => {
      try {
        const response = await axios.get('/api/user/onboarding-progress')
        const stepId =
          STEP_SEQUENCE[response.data.step - 1] || ONBOARDING_STEPS.LANGUAGE
        setCurrentStepId(stepId)

        if (response.data.step >= 1) {
          setSelectedLanguage(response.data.language)
        }
        if (response.data.step >= 3) {
          setSelectedCategories(response.data.categories)
        }
        if (stepId === ONBOARDING_STEPS.QUIZ_QUESTION) {
          fetchOnBoardingArticle()
        }
      } catch (error) {
        console.error('Failed to fetch onboarding progress:', error)
      }
    }

    fetchUserOnboardingProgress()
  }, [])

  useEffect(() => {
    if (onBoardingQuizSubmitted) {
      handleNext({ language: selectedLanguage })
    }
  }, [onBoardingQuizSubmitted])

  // Map steps to components
  const stepComponents = {
    [ONBOARDING_STEPS.LANGUAGE]: (
      <LanguageSelection onLanguageSelect={handleLanguageSelect} />
    ),
    [ONBOARDING_STEPS.WELCOME]: <Welcome />,
    [ONBOARDING_STEPS.CATEGORIES]: (
      <CategorySelection
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />
    ),
    [ONBOARDING_STEPS.QUIZ_QUESTION]: (
      <QuizQuestion
        isArticleFetching={isArticleFetching}
        onComplete={handleQuizComplete}
        quizQuestion={article?.quizQuestion}
        fetchOnBoardingArticle={fetchOnBoardingArticle}
      />
    ),
    [ONBOARDING_STEPS.QUIZ_RESULT]: (
      <QuizResult
        isCorrect={initialQuizCorrect}
        onNext={handleNext}
        quizQuestion={article?.quizQuestion}
      />
    ),
    [ONBOARDING_STEPS.ARTICLE_READING]: (
      <ArticleReading
        onNext={handleQuizButtonClick}
        article={article}
        isArticleFetching={isArticleFetching}
        fetchOnBoardingArticle={fetchOnBoardingArticle}
      />
    ),
    [ONBOARDING_STEPS.LEADERBOARD]: (
      <LeaderboardOnboarding onComplete={handleFinish} />
    ),
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(to bottom, #44337A, #000000)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          zIndex: 0,
        }}
      >
        {stars.map((star, index) => (
          <Star key={index} {...star} />
        ))}
      </div>
      <Box w={'100vw'} h={'100vh'} zIndex={1}>
        <AnimatePresence mode="wait">
          <MotionBox
            key={currentStepId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            w={'100vw'}
            position="relative"
            zIndex={1}
          >
            {stepComponents[currentStepId]}

            <Box
              position="fixed"
              bottom="40px"
              right="40px"
              display={
                (currentStepId === ONBOARDING_STEPS.CATEGORIES &&
                  selectedCategories.length === 5) ||
                currentStepId === ONBOARDING_STEPS.WELCOME
                  ? 'block'
                  : 'none'
              }
            >
              <Button
                onClick={() => {
                  const data = {
                    categories: selectedCategories,
                    language: selectedLanguage,
                  }
                  handleNext(data)
                }}
                bg="purple.600"
                color="white"
                size="lg"
                isDisabled={
                  currentStepId === ONBOARDING_STEPS.CATEGORIES &&
                  selectedCategories.length !== 5
                }
                _hover={{
                  bg: 'purple.700',
                  transform: 'translateY(-5px)',
                  boxShadow: 'xl',
                }}
                transition="all 0.2s"
              >
                Next
              </Button>
            </Box>
          </MotionBox>
        </AnimatePresence>
      </Box>
    </>
  )
}

export default OnboardingProcess
