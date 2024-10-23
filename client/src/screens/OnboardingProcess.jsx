import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, useToast } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import LanguageSelection from '../components/onboarding/LanguageSelection'
import Welcome from '../components/onboarding/Welcome'
import CategorySelection from '../components/onboarding/CategorySelection'
import QuizQuestion from '../components/onboarding/QuizQuestion'
import QuizResult from '../components/onboarding/QuizResult'
import ArticleReading from '../components/onboarding/ArticleReading'
import LeaderboardOnboarding from '../components/onboarding/LeaderboardOnboarding'
import { setIsOpen } from '../redux/quizSlice'
import useSound from '../customHooks/useSound'
import axios from 'axios'
import { setArticleData } from '../redux/articleSlice'
import i18n from 'i18next'
import { setUser } from '../redux/authSlice'

const MotionBox = motion(Box)

// Star component
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

const OnboardingProcess = () => {
  const [step, setStep] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [initialQuizCorrect, setInitialQuizCorrect] = useState(false)
  const { playClick } = useSound()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { onBoardingQuizSubmitted } = useSelector(state => state.quiz)
  const toast = useToast()
  const [article, setArticle] = useState(null)
  const [isArticleFetching, setIsArticleFetching] = useState(false)

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
  const updateOnboardingProgress = async (currentStep, data = {}) => {
    try {
      await axios.post('/api/user/onboarding-progress', {
        step: currentStep,
        data,
      })
    } catch (error) {
      console.error('Failed to update onboarding progress:', error)
    }
  }

  const handleLanguageSelect = async lang => {
    try {
      setSelectedLanguage(lang)
      await i18n.changeLanguage(lang)
      await handleNext({ language: lang })
      fetchOnBoardingArticle()
    } catch (error) {
      console.error('Failed to update onboarding progress:', error)
      toast({
        title: 'Error',
        description:
          'Failed to update language in onboarding progress. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
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

  const handleNext = async ({ language }) => {
    if (step < 6) {
      const nextStep = step + 1
      let data = {}

      switch (step) {
        case 0:
          data = { language }
          break
        case 2:
          data = { categories: selectedCategories }
          break
        // Add more cases if needed for other steps
      }

      await updateOnboardingProgress(nextStep, data)
      if (step === 2) {
        axios.get(
          `/api/recommendation?page=${1}&pageSize=18&lang=${i18n.language}`,
        )
      }

      setStep(nextStep)
    }
  }

  const handleQuizComplete = isCorrect => {
    setInitialQuizCorrect(isCorrect)
    setStep(4)
  }

  const handleFinish = async () => {
    try {
      await updateOnboardingProgress(7)
      dispatch(
        setUser({
          ...user,
          needsOnboarding: false,
          onboardingStep: 7,
        }),
      )
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
  }, [dispatch, toast])

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
        setStep(response.data.step)
        if (response.data.step >= 1) {
          setSelectedLanguage(response.data.language)
        }
        if (response.data.step >= 3) {
          setSelectedCategories(response.data.categories)
        }
        if (response.data.step === 3) fetchOnBoardingArticle()
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

  const steps = [
    <LanguageSelection onLanguageSelect={handleLanguageSelect} />,
    <Welcome />,
    <CategorySelection
      selectedCategories={selectedCategories}
      onCategoryToggle={handleCategoryToggle}
    />,
    <QuizQuestion
      isArticleFetching={isArticleFetching}
      onComplete={handleQuizComplete}
      quizQuestion={article?.quizQuestion}
    />,
    <QuizResult
      isCorrect={initialQuizCorrect}
      onNext={handleNext}
      quizQuestion={article?.quizQuestion}
    />,
    <ArticleReading
      onNext={handleQuizButtonClick}
      article={article}
      isArticleFetching={isArticleFetching}
      fetchOnBoardingArticle={fetchOnBoardingArticle}
    />,
    <LeaderboardOnboarding onComplete={handleFinish} />,
  ]

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
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            w={'100vw'}
            position="relative"
            zIndex={1}
          >
            {steps[step]}

            <Box
              position="fixed"
              bottom="40px"
              right="40px"
              display={
                (step === 2 && selectedCategories.length === 5) || step === 1
                  ? 'block'
                  : 'none'
              }
            >
              <Button
                onClick={step < 6 ? handleNext : handleFinish}
                bg="purple.600"
                color="white"
                size="lg"
                isDisabled={step === 2 && selectedCategories.length !== 5}
                _hover={{
                  bg: 'purple.700',
                  transform: 'translateY(-5px)',
                  boxShadow: 'xl',
                }}
                transition="all 0.2s"
              >
                {step < 6 ? 'Next' : 'Get Started'}
              </Button>
            </Box>
          </MotionBox>
        </AnimatePresence>
      </Box>
    </>
  )
}

export default OnboardingProcess
