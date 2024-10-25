import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Box, Text, Progress, VStack, Checkbox, Flex } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import QuizBG from './QuizBG'

const Star = React.memo(({ size, top, left }) => (
  <motion.div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(255, 215, 0, 0.8)', // Golden color for tournament theme
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

const TournamentQuizSubmitLoadingScreen = React.memo(({ socket }) => {
  const [progress, setProgress] = useState(0)
  const [stepProgress, setStepProgress] = useState({})
  const [currentTip, setCurrentTip] = useState('')
  const { t } = useTranslation('TournamentLoadingScreen')
  const shownTips = useRef(new Set())
  const { user } = useSelector(state => state.auth)

  const tips = useMemo(() => t('tips', { returnObjects: true }), [t])

  const submissionSteps = [
    {
      id: 'initializeCalculation',
      label: '🚀 Launching Tournament Power',
      weight: 15,
    },
    {
      id: 'calculateRQM',
      label: '🏆 Measuring Rapid Quiz Mastery',
      weight: 25,
    },
    {
      id: 'saveAttempt',
      label: '💾 Preserving Your Tournament Performance',
      weight: 20,
    },
    {
      id: 'updateStats',
      label: '📊 Updating Tournament Standings',
      weight: 20,
    },
    {
      id: 'finalizeAttempt',
      label: '🎉 Concluding Your Tournament Round',
      weight: 20,
    },
  ]

  useEffect(() => {
    if (socket && user) {
      socket.emit('join tournament quiz submission progress', user._id)
      socket.on('tournament_quiz_submission_progress', data => {
        setStepProgress(prev => ({ ...prev, [data.stepId]: data.progress }))
      })
    }

    return () => {
      if (socket) {
        socket.off('tournament_quiz_submission_progress')
      }
    }
  }, [socket, user])

  useEffect(() => {
    const totalWeight = submissionSteps.reduce(
      (sum, step) => sum + step.weight,
      0,
    )
    const weightedProgress = submissionSteps.reduce((sum, step) => {
      const stepProgressValue = stepProgress[step.id] || 0
      return sum + (stepProgressValue * step.weight) / 100
    }, 0)
    setProgress((weightedProgress / totalWeight) * 100)
  }, [stepProgress, submissionSteps])

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
      bgSize="cover"
      bgPosition="center"
      color="white"
      position={'fixed'}
      zIndex={100000}
      overflow="hidden"
    >
      <QuizBG />
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
        <Text fontSize={{ base: '70px', md: '100px' }}>🏆</Text>
      </motion.div>

      <VStack spacing={12} width="80%" maxWidth="600px" zIndex={1}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Text
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight="bold"
            fontFamily="'Playfair Display', serif"
            bgGradient="linear(to-r, yellow.400, orange.400)"
            bgClip="text"
          >
            {t('submittingYourTournamentQuiz')}
          </Text>
        </motion.div>

        <Box width="100%" position="relative">
          <Progress
            value={progress}
            size="sm"
            width="100%"
            colorScheme="yellow"
            isAnimated
            hasStripe
            borderRadius="full"
          />
        </Box>

        <VStack align="start" spacing={2} width="100%">
          {submissionSteps.map(step => (
            <Checkbox
              key={step.id}
              isChecked={stepProgress[step.id] === 100}
              isReadOnly
              colorScheme="yellow"
            >
              {t(`submissionSteps.${step.id}`)}
            </Checkbox>
          ))}
        </VStack>

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
              bg="rgba(0, 0, 0, 0.6)"
              boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
              border="1px solid rgba(255, 215, 0, 0.18)"
              maxWidth="600px"
            >
              <Text
                fontSize={{ base: 'md', md: 'xl' }}
                fontStyle="italic"
                fontFamily="'Cormorant Garamond', serif"
                lineHeight="1.6"
                color="yellow.200"
              >
                "{currentTip}"
              </Text>
            </Box>
          </motion.div>
        </AnimatePresence>
      </VStack>
    </Box>
  )
})

export default TournamentQuizSubmitLoadingScreen
