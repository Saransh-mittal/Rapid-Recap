import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Suspense,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, useToast } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import i18n from 'i18next'
import LanguageSelection from '../components/onboarding/LanguageSelection'
import CategorySelection from '../components/onboarding/CategorySelection'
import ArticleReading from '../components/onboarding/ArticleReading'
import LeaderboardOnboarding from '../components/onboarding/LeaderboardOnboarding'
import { setUser } from '../redux/authSlice'
import { setArticleData } from '../redux/articleSlice'
import { setIsOpen } from '../redux/quizSlice'
import { useFeatureDetection } from '../utils/featureDetection'
import useSafeSound from '../customHooks/useSafeSound'
import { getVisitedArticle } from '../utils/article.utils'
import ArticleSelection from '../components/onboarding/ArticleSelection'
import TimeIndicatorBadge from '../components/onboarding/TimeIndicatorBadge'
import ReferralStep from '../components/onboarding/ReferralStep'
const EarlyAdopterStep = React.lazy(() =>
  import('../components/onboarding/EarlyAdopterStep'),
)
const TutorialChoice = React.lazy(() =>
  import('../components/onboarding/TutorialChoice'),
)

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
  EARLY_ADOPTER: 'early_adopter',
  REFERRAL: 'referral',
  CATEGORIES: 'categories',
  TUTORIAL_CHOICE: 'tutorial_choice',
  ARTICLE_SELECTION: 'article_selection',
  ARTICLE_READING: 'article_reading',
  LEADERBOARD: 'leaderboard',
}

// Define step sequence
const STEP_SEQUENCE = [
  ONBOARDING_STEPS.LANGUAGE,
  ONBOARDING_STEPS.EARLY_ADOPTER,
  ONBOARDING_STEPS.REFERRAL,
  ONBOARDING_STEPS.CATEGORIES,
  ONBOARDING_STEPS.TUTORIAL_CHOICE,
  ONBOARDING_STEPS.ARTICLE_SELECTION,
  ONBOARDING_STEPS.ARTICLE_READING,
  ONBOARDING_STEPS.LEADERBOARD,
]

const OnboardingProcess = ({ setIsGuestLoggedin }) => {
  const [currentStepId, setCurrentStepId] = useState(ONBOARDING_STEPS.LANGUAGE)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [article, setArticle] = useState(null)
  const [visitedArticle, setVisitedArticle] = useState(null)
  const [isEarlyAdopter, setIsEarlyAdopter] = useState(false)
  const [takeTutorial, setTakeTutorial] = useState(null)
  const [isVisitedArticleFetching, setIsVisitedArticleFetching] =
    useState(false)
  const [isArticleFetching, setIsArticleFetching] = useState(false)
  const [submittingSelectedLanguage, setSubmittingSelectedLanguage] =
    useState(false)
  const [isLoadingNext, setIsLoadingNext] = useState(false)
  const [errorFecthinArticle, setErrorFetchingArticle] = useState(false)
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

  const getNextStepId = useCallback(
    (currentId, wantsTutorial) => {
      // Skip article selection if user doesn't want tutorial
      if (
        (currentId === ONBOARDING_STEPS.TUTORIAL_CHOICE &&
          wantsTutorial === false) ||
        (currentId === ONBOARDING_STEPS.ARTICLE_SELECTION &&
          wantsTutorial === false) ||
        (currentId === ONBOARDING_STEPS.ARTICLE_READING &&
          wantsTutorial === false)
      ) {
        return ONBOARDING_STEPS.LEADERBOARD
      }

      if (
        !getVisitedArticle() &&
        currentId === ONBOARDING_STEPS.ARTICLE_SELECTION
      ) {
        return ONBOARDING_STEPS.ARTICLE_READING
      }

      const currentIndex = STEP_SEQUENCE.indexOf(currentId)
      const nextIndex = currentIndex + 1

      return STEP_SEQUENCE[nextIndex] || currentId
    },
    [takeTutorial],
  )

  const handleTutorialChoice = async (data = {}) => {
    setIsLoadingNext(true)
    try {
      const { takeTutorial: wantsTutorial } = data
      setTakeTutorial(wantsTutorial)

      const nextStepId = getNextStepId(
        ONBOARDING_STEPS.TUTORIAL_CHOICE,
        wantsTutorial,
      )

      await updateOnboardingProgress(
        ONBOARDING_STEPS.TUTORIAL_CHOICE,
        nextStepId,
        {
          takeTutorial: wantsTutorial,
        },
      )

      setCurrentStepId(nextStepId)

      // If user chose tutorial and going to article reading, fetch article
      if (nextStepId === ONBOARDING_STEPS.ARTICLE_READING) {
        fetchOnBoardingArticle()
      }
    } catch (error) {
      console.error('Failed to process tutorial choice:', error)
      toast({
        title: 'Error',
        description: 'Failed to proceed. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingNext(false)
    }
  }

  const handleEarlyAdopterComplete = async (data = {}) => {
    setIsLoadingNext(true)
    try {
      const { earlyAdopterCode } = data

      if (earlyAdopterCode) {
        setIsEarlyAdopter(true)
      }

      const nextStepId = getNextStepId(ONBOARDING_STEPS.EARLY_ADOPTER)

      await updateOnboardingProgress(
        ONBOARDING_STEPS.EARLY_ADOPTER,
        nextStepId,
        {
          earlyAdopterCode,
        },
      )

      setCurrentStepId(nextStepId)
    } catch (error) {
      console.error('Failed to process early adopter step:', error)
      toast({
        title: 'Error',
        description: 'Failed to proceed. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingNext(false)
    }
  }

  const sanitizeData = (stepId, data) => {
    // Sanitize data for the current step
    switch (stepId) {
      case ONBOARDING_STEPS.LANGUAGE:
        return {
          language: data.language,
        }
      case ONBOARDING_STEPS.EARLY_ADOPTER:
        return {
          earlyAdopterCode: data.earlyAdopterCode,
        }
      case ONBOARDING_STEPS.TUTORIAL_CHOICE:
        return {
          takeTutorial: data.takeTutorial,
        }
      case ONBOARDING_STEPS.CATEGORIES:
        return {
          categories: data.categories,
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
    setSubmittingSelectedLanguage(true)
    try {
      setSelectedLanguage(lang)
      await i18n.changeLanguage(lang)
      const nextStepId = ONBOARDING_STEPS.EARLY_ADOPTER // Changed from REFERRAL to EARLY_ADOPTER
      await updateOnboardingProgress(ONBOARDING_STEPS.LANGUAGE, nextStepId, {
        language: lang,
      })
      setCurrentStepId(nextStepId)

      if (getVisitedArticle()) fetchVisitedArticle(getVisitedArticle()?.id)
      axios.get('/api/user/leaderboard?limit=500')
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
    } finally {
      setSubmittingSelectedLanguage(false)
    }
  }

  const handleNext = async (rawData = {}) => {
    setIsLoadingNext(true)
    try {
      const nextStepId = getNextStepId(currentStepId)
      if (nextStepId !== currentStepId) {
        await updateOnboardingProgress(currentStepId, nextStepId, rawData)
        setCurrentStepId(nextStepId)

        if (nextStepId === ONBOARDING_STEPS.ARTICLE_READING) {
          axios.get(
            `/api/recommendation?page=${1}&pageSize=18&lang=${i18n.language}`,
          )
        }
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Failed to proceed to next step. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoadingNext(false)
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

  const fetchVisitedArticle = useCallback(
    async articleId => {
      if (isVisitedArticleFetching || !articleId) return

      setIsVisitedArticleFetching(true)
      try {
        const response = await axios.get(
          `/api/articles/onboarding?articleId=${articleId}`,
        )

        setVisitedArticle(response.data)
      } catch (error) {
        setErrorFetchingArticle(true)
        console.error(error)
      } finally {
        setIsVisitedArticleFetching(false)
      }
    },
    [dispatch, isVisitedArticleFetching, toast],
  )
  const fetchOnBoardingArticle = useCallback(
    async articleId => {
      if (isArticleFetching) return
      setIsArticleFetching(true)

      try {
        const response = await axios.get(
          `/api/articles/onboarding?articleId=${articleId}`,
        )
        setArticle(response.data)

        dispatch(setArticleData(response.data))
      } catch (error) {
        console.error(error)
        toast({
          title: 'Error',
          description:
            'Failed to fetch onboarding article. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsArticleFetching(false)
      }
    },
    [dispatch, isArticleFetching, toast],
  )

  const handleArticleNext = useCallback(async () => {
    playClick()

    const nextStepId = ONBOARDING_STEPS.LEADERBOARD // Changed from REFERRAL to EARLY_ADOPTER
    await updateOnboardingProgress(ONBOARDING_STEPS.ARTICLE_READING, nextStepId)
    setCurrentStepId(nextStepId)
  }, [playClick])

  useEffect(() => {
    const fetchUserOnboardingProgress = async () => {
      try {
        // Check for EOC parameter first
        const searchParams = new URLSearchParams(location.hash.split('?')[1])
        const eocParam = searchParams.get('EOC')
        if (eocParam) {
          localStorage.setItem('EOC', eocParam)
        }

        const response = await axios.get('/api/user/onboarding-progress')
        const stepId =
          STEP_SEQUENCE[response.data.step - 1] || ONBOARDING_STEPS.LANGUAGE

        // Skip article selection if user didn't come from an article page
        if (
          stepId === ONBOARDING_STEPS.ARTICLE_SELECTION &&
          !getVisitedArticle()
        ) {
          setCurrentStepId(ONBOARDING_STEPS.ARTICLE_READING)
        } else {
          setCurrentStepId(stepId)
        }

        // Set onboarding data based on progress
        if (response.data.step >= 1) {
          setSelectedLanguage(response.data.language)
        }
        if (response.data.step >= 5) {
          setSelectedCategories(response.data.categories)
        }

        if (response.data.step >= 6) {
          setTakeTutorial(response.data.tutorialChoice)
        }

        // Handle article fetching based on step
        if (stepId === ONBOARDING_STEPS.ARTICLE_SELECTION) {
          fetchVisitedArticle(getVisitedArticle()?.id)
          fetchOnBoardingArticle()
        }
        if (stepId === ONBOARDING_STEPS.ARTICLE_READING) {
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
      <LanguageSelection
        onLanguageSelect={handleLanguageSelect}
        submittingSelectedLanguage={submittingSelectedLanguage}
        selectedLanguage={selectedLanguage}
      />
    ),
    [ONBOARDING_STEPS.EARLY_ADOPTER]: (
      <Suspense fallback={null}>
        <EarlyAdopterStep onComplete={handleEarlyAdopterComplete} />
      </Suspense>
    ),
    [ONBOARDING_STEPS.REFERRAL]: (
      <ReferralStep onComplete={() => handleNext()} />
    ),
    [ONBOARDING_STEPS.CATEGORIES]: (
      <CategorySelection
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />
    ),
    [ONBOARDING_STEPS.TUTORIAL_CHOICE]: (
      <Suspense fallback={null}>
        <TutorialChoice onChoice={handleTutorialChoice} />
      </Suspense>
    ),
    [ONBOARDING_STEPS.ARTICLE_SELECTION]: (
      <ArticleSelection
        errorFecthinArticle={errorFecthinArticle}
        onArticleSelect={selectedArticle => {
          fetchOnBoardingArticle(selectedArticle?.id || selectedArticle?._id)
          handleNext()
        }}
        randomArticle={article}
        visitedArticle={visitedArticle}
        isArticleFetching={isArticleFetching}
        isVisitedArticleFetching={isVisitedArticleFetching}
      />
    ),
    [ONBOARDING_STEPS.ARTICLE_READING]: (
      <ArticleReading
        onNext={handleArticleNext}
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
      <TimeIndicatorBadge
        currentStep={currentStepId}
        STEP_SEQUENCE={STEP_SEQUENCE}
      />
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
                'none'
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
                isLoading={isLoadingNext}
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
