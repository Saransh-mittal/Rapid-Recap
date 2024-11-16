import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HStack, Text, Box, Flex, Tooltip, IconButton } from '@chakra-ui/react'
import { Sparkles, Timer, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const TimeIndicatorBadge = ({ currentStep, STEP_SEQUENCE }) => {
  const { t } = useTranslation('OnboardingProcess')
  const [isVisible, setIsVisible] = useState(true)
  const [autoHideTimer, setAutoHideTimer] = useState(null)

  const currentStepIndex = STEP_SEQUENCE.indexOf(currentStep) + 1
  const totalSteps = STEP_SEQUENCE.length

  const STEP_CONFIG = {
    language: {
      time: '10 sec',
      message: t('timeIndicator.steps.language'),
    },
    welcome: {
      time: '10 sec',
      message: t('timeIndicator.steps.welcome'),
    },
    categories: {
      time: '45 sec',
      message: t('timeIndicator.steps.categories'),
    },
    article_selection: {
      time: '30 sec',
      message: t('timeIndicator.steps.articleSelection'),
    },
    quiz_question: {
      time: '20 sec',
      message: t('timeIndicator.steps.quizQuestion'),
    },
    quiz_result: {
      time: '20 sec',
      message: t('timeIndicator.steps.quizResult'),
    },
    article_reading: {
      time: '2 min',
      message: t('timeIndicator.steps.articleReading'),
    },
    leaderboard: {
      time: '30 sec',
      message: t('timeIndicator.steps.leaderboard'),
    },
  }

  const stepInfo = STEP_CONFIG[currentStep] || {
    time: '1 min',
    message: t('timeIndicator.processing'),
  }

  const getEstimatedTime = () => {
    let totalSecs = 0
    const remainingSteps = STEP_SEQUENCE.slice(currentStepIndex - 1)

    remainingSteps.forEach(step => {
      const time = STEP_CONFIG[step]?.time || '1 min'
      const [value, unit] = time.split(' ')
      totalSecs += unit === 'sec' ? Number(value) : Number(value) * 60
    })

    return totalSecs <= 60
      ? `~${totalSecs} sec`
      : `~${Math.ceil(totalSecs / 60)} min`
  }

  useEffect(() => {
    setIsVisible(true)

    if (autoHideTimer) {
      clearTimeout(autoHideTimer)
    }

    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 4000)

    setAutoHideTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [currentStep])

  const handleClose = () => {
    setIsVisible(false)
    if (autoHideTimer) {
      clearTimeout(autoHideTimer)
    }
  }

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      pt={2}
      pr={2}
      zIndex={1000}
      overflow="hidden"
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              mass: 1,
            }}
          >
            <Box
              bg="rgba(88, 65, 137, 0.35)"
              borderRadius="xl"
              backdropFilter="blur(12px)"
              border="1px solid"
              borderColor="rgba(139, 92, 246, 0.35)"
              p={1}
              boxShadow="0 4px 25px rgba(139, 92, 246, 0.25)"
              _hover={{
                borderColor: 'rgba(139, 92, 246, 0.5)',
                bg: 'rgba(88, 65, 137, 0.45)',
              }}
              transition="all 0.3s ease"
              position="relative"
            >
              {/* Close Button */}
              <IconButton
                icon={<X size={14} />}
                size="xs"
                position="absolute"
                top={-2}
                right={-2}
                borderRadius="full"
                bg="rgba(139, 92, 246, 0.3)"
                color="white"
                _hover={{
                  bg: 'rgba(139, 92, 246, 0.5)',
                }}
                onClick={handleClose}
                zIndex={2000}
              />

              <HStack spacing={4} px={5} py={2.5}>
                {/* Time Estimation Display */}
                <Tooltip
                  label={t('timeIndicator.tooltipText')}
                  placement="bottom"
                  hasArrow
                >
                  <Flex align="center" gap={2.5}>
                    <Timer size={18} color="#D6BCFA" />
                    <HStack spacing={1.5}>
                      <Text
                        color="purple.200"
                        fontSize="sm"
                        fontWeight="semibold"
                      >
                        {getEstimatedTime()}
                      </Text>
                      <Text color="whiteAlpha.700" fontSize="sm">
                        {t('timeIndicator.estimated')}
                      </Text>
                    </HStack>
                  </Flex>
                </Tooltip>

                {/* Elegant Divider */}
                <Box
                  w="1px"
                  h="24px"
                  bgGradient="linear(to-b, whiteAlpha.100, whiteAlpha.400, whiteAlpha.100)"
                />

                {/* Progress Indicator */}
                <HStack spacing={2.5}>
                  <Sparkles size={16} color="#F0ABFC" />
                  <Text color="white" fontSize="sm" fontWeight="semibold">
                    {t('timeIndicator.stepProgress', {
                      current: currentStepIndex,
                      total: totalSteps,
                    })}
                  </Text>
                </HStack>
              </HStack>

              {/* Animated Progress Bar */}
              <Box
                h="2px"
                w="full"
                bg="whiteAlpha.200"
                mt={1}
                overflow="hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStepIndex / totalSteps) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    h="full"
                    bgGradient="linear(to-r, purple.400, pink.400, purple.300)"
                    borderRadius="full"
                  />
                </motion.div>
              </Box>
            </Box>

            {/* Step Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              key={currentStep}
            >
              <Text
                fontSize="xs"
                color="whiteAlpha.800"
                textAlign="center"
                mt={2.5}
                fontWeight="medium"
                letterSpacing="wide"
              >
                {stepInfo.message}
              </Text>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default TimeIndicatorBadge
