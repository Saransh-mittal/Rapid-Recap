import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, useToast } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
// import {
//   setOnboardingCompleted,
//   setLanguage,
//   setPreferredCategories,
// } from '../redux/authSlice'
// import {
//   updateUserPreferences,
//   completeOnboarding,
// } from '../services/userService'
import LanguageSelection from '../components/onboarding/LanguageSelection'
import Welcome from '../components/onboarding/Welcome'
import CategorySelection from '../components/onboarding/CategorySelection'
import QuizQuestion from '../components/onboarding/QuizQuestion'
import QuizResult from '../components/onboarding/QuizResult'
import ArticleReading from '../components/onboarding/ArticleReading'
import ArticleQuiz from '../components/onboarding/ArticleQuiz'

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
  const [quizAnswer, setQuizAnswer] = useState('')
  const [initialQuizCorrect, setInitialQuizCorrect] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
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

  const handleLanguageSelect = lang => {
    setSelectedLanguage(lang)
    // dispatch(setLanguage(lang))
    setStep(1)
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

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1)
    }
  }

  const handleQuizComplete = isCorrect => {
    setInitialQuizCorrect(isCorrect)
    setStep(4) // Move to QuizResult component
  }

  const handleFinish = async () => {
    try {
      // await updateUserPreferences(user._id, {
      //   language: selectedLanguage,
      //   preferredCategories: selectedCategories,
      // })
      // await completeOnboarding(user._id)
      // dispatch(setOnboardingCompleted())
      // dispatch(setPreferredCategories(selectedCategories))
      navigate('/home/all')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const steps = [
    <LanguageSelection onLanguageSelect={handleLanguageSelect} />,
    <Welcome />,
    <CategorySelection
      selectedCategories={selectedCategories}
      onCategoryToggle={handleCategoryToggle}
    />,
    <QuizQuestion onComplete={handleQuizComplete} />,
    <QuizResult isCorrect={initialQuizCorrect} onNext={handleNext} />,
    <ArticleReading onNext={handleNext} />,
    <ArticleQuiz onComplete={handleFinish} />,
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
                // display={
                //   (step === 2 && selectedCategories.length === 5) || step === 1
                //     ? 'block'
                //     : 'none'
                // }
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
