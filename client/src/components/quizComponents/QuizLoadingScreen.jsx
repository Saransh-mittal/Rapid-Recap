import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Box, Text, Progress, VStack, Checkbox, Flex } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

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

const QuizLoadingScreen = React.memo(
  ({ socket, isQuizGenerating, isSubmitting }) => {
    const [progress, setProgress] = useState(0)
    const [stepProgress, setStepProgress] = useState({})
    const [currentTip, setCurrentTip] = useState('')
    const { t } = useTranslation('LoadingScreen')
    const shownTips = useRef(new Set())
    const { user } = useSelector(state => state.auth)

    const tips = useMemo(() => t('tips', { returnObjects: true }), [t])

    const submissionSteps = [
      {
        id: 'initializeCalculation',
        label: '🚀 Launching Brain Power',
        weight: 10,
      },
      {
        id: 'calculateRQM',
        label: '🧠 Measuring Rapid Quiz Mastery',
        weight: 20,
      },
      { id: 'saveAttempt', label: '💾 Preserving Your Brilliance', weight: 15 },
      {
        id: 'updateStats',
        label: '📊 Crunching Numbers & Updating Stats',
        weight: 20,
      },
      {
        id: 'checkTournament',
        label: '🏆 Assessing Tournament Eligibility',
        weight: 15,
      },
      {
        id: 'finalizeAttempt',
        label: '🎉 Wrapping Up Your Achievement',
        weight: 20,
      },
    ]

    useEffect(() => {
      if (socket && user) {
        if (isQuizGenerating) {
          socket.emit('join quiz progress', user._id)
          socket.on('quiz_generation_progress', data => {
            setProgress(data.progress)
          })
        } else if (isSubmitting) {
          socket.emit('join quiz submission progress', user._id)
          socket.on('quiz_submission_progress', data => {
            setStepProgress(prev => ({ ...prev, [data.stepId]: data.progress }))
          })
        }

        return () => {
          socket.off('quiz_generation_progress')
          socket.off('quiz_submission_progress')
        }
      }
    }, [socket, isQuizGenerating, isSubmitting, user])

    useEffect(() => {
      if (isSubmitting) {
        const totalWeight = submissionSteps.reduce(
          (sum, step) => sum + step.weight,
          0,
        )
        const weightedProgress = submissionSteps.reduce((sum, step) => {
          const stepProgressValue = stepProgress[step.id] || 0
          return sum + (stepProgressValue * step.weight) / 100
        }, 0)
        setProgress((weightedProgress / totalWeight) * 100)
      }
    }, [isSubmitting, stepProgress, submissionSteps])

    useEffect(() => {
      const getRandomTip = () => {
        if (shownTips.current.size === tips.length) {
          shownTips.current.clear()
        }
        let newTip
        do {
          newTip = tips[Math.floor(Math.random() * tips.length)]
        } while (shownTips.current.has(newTip))
        return newTip
      }

      const showNewTip = () => {
        const newTip = getRandomTip()
        setCurrentTip(newTip)
        shownTips.current.add(newTip)
      }

      showNewTip()
      const tipInterval = setInterval(showNewTip, 8000)

      return () => clearInterval(tipInterval)
    }, [tips])

    const stars = useMemo(
      () =>
        Array(25)
          .fill()
          .map(() => ({
            size: Math.random() * 3 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
          })),
      [],
    )

    return (
      <Box
        height="100vh"
        w={'100vw'}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgGradient="linear(to-b, purple.900, black)"
        color="white"
        position={'fixed'}
        zIndex={10000}
        overflow="hidden"
      >
        {stars.map((star, index) => (
          <Star key={index} {...star} />
        ))}

        <motion.div
          style={{
            position: 'absolute',
            top: '8%',
            left: '45%',
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Text fontSize={{ base: '70px', md: '100px' }}>🧠</Text>
        </motion.div>

        <VStack spacing={12} width="80%" maxWidth="600px" zIndex={1}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Text
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
              fontFamily="'Playfair Display', serif"
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
            >
              {isQuizGenerating
                ? t('preparingYourQuiz')
                : t('submittingYourQuiz')}
            </Text>
          </motion.div>

          <Box width="100%" position="relative">
            <Progress
              value={progress}
              size="sm"
              width="100%"
              colorScheme="purple"
              isAnimated
              hasStripe
              borderRadius="full"
            />
          </Box>

          {isSubmitting && (
            <VStack align="start" spacing={2} width="100%">
              {submissionSteps.map(step => (
                <Checkbox
                  key={step.id}
                  isChecked={stepProgress[step.id] === 100}
                  isReadOnly
                  colorScheme="purple"
                >
                  {t(`submissionSteps.${step.id}`)}
                </Checkbox>
              ))}
            </VStack>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                textAlign="center"
                p={4}
                borderRadius="lg"
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(10px)"
                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                border="1px solid rgba(255, 255, 255, 0.18)"
                maxWidth="600px"
              >
                <Text
                  fontSize={{ base: 'md', md: 'xl' }}
                  fontStyle="italic"
                  fontFamily="'Cormorant Garamond', serif"
                  lineHeight="1.6"
                >
                  "{currentTip}"
                </Text>
              </Box>
            </motion.div>
          </AnimatePresence>
        </VStack>
      </Box>
    )
  },
)

export default QuizLoadingScreen
