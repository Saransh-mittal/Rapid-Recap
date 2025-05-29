// components/quickClashComponents/team/battleAnalysis/components/LoadingScreen.jsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Center,
  VStack,
  HStack,
  Text,
  Spinner,
  Progress,
  Icon,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Brain, Sparkles } from 'lucide-react'

const MotionBox = motion(Box)

/**
 * Optimized Loading Screen with simplified animations for better mobile performance
 */
const LoadingScreen = React.memo(() => {
  const { t } = useTranslation('QuickClash')
  const [progress, setProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState('')

  // Memoized responsive configuration - static values for performance
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
    }),
    [],
  )

  // Optimized loading steps - fewer steps for faster loading
  const loadingSteps = React.useMemo(
    () => [
      { step: t('Connecting to battle data...'), progress: 20 },
      { step: t('Loading team performance metrics...'), progress: 40 },
      { step: t('Analyzing battle patterns...'), progress: 60 },
      { step: t('Generating BattleSage AI insights...'), progress: 80 },
      { step: t('Finalizing analysis...'), progress: 100 },
    ],
    [t],
  )

  useEffect(() => {
    let currentStepIndex = 0
    setAnalysisStep(loadingSteps[0].step)

    const stepInterval = setInterval(
      () => {
        currentStepIndex++
        if (currentStepIndex < loadingSteps.length) {
          setAnalysisStep(loadingSteps[currentStepIndex].step)
          setProgress(loadingSteps[currentStepIndex].progress)
        } else {
          clearInterval(stepInterval)
        }
      },
      config.isMobile ? 300 : 400,
    ) // Faster on mobile

    return () => clearInterval(stepInterval)
  }, [loadingSteps, config.isMobile])

  return (
    <Box minH="100vh" position="relative" bg="gray.900">
      <Center minH="100vh" p={4}>
        <VStack spacing={8} maxW="md" w="full">
          {' '}
          {/* Reduced spacing */}
          <MotionBox
            animate={{
              scale: config.isMobile ? [1] : [1, 1.05, 1], // No animation on mobile
              opacity: [0.8, 1, 0.8],
              rotate: config.isMobile ? [0] : [0, 180, 360], // No rotation on mobile
            }}
            transition={{
              duration: config.isMobile ? 2 : 3, // Faster on mobile
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Box
              position="relative"
              p={5} // Reduced padding
              borderRadius="full"
              bg="rgba(139, 92, 246, 0.12)" // Reduced opacity
              border="3px solid"
              borderColor="purple.500"
              boxShadow={
                config.isMobile
                  ? '0 0 20px rgba(139, 92, 246, 0.4)'
                  : '0 0 25px rgba(139, 92, 246, 0.5)' // Reduced shadow
              }
            >
              <Spinner
                thickness="3px" // Reduced thickness
                speed="0.8s" // Slightly faster
                emptyColor="rgba(255,255,255,0.05)"
                color="purple.400"
                size="lg" // Reduced from xl
              />
              <Icon
                as={Brain}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                color="purple.300"
                boxSize={8} // Reduced from 10
              />
            </Box>
          </MotionBox>
          <VStack spacing={4} textAlign="center" w="100%">
            {' '}
            {/* Reduced spacing */}
            <VStack spacing={2}>
              <Text
                color="whiteAlpha.900"
                fontSize={{ base: 'lg', md: 'xl' }} // Reduced sizes
                fontWeight="bold"
                letterSpacing="tight"
              >
                {t('Analyzing Battle')}
              </Text>
              <AnimatePresence mode="wait">
                <MotionBox
                  key={analysisStep}
                  initial={{ opacity: 0, y: 6 }} // Reduced movement
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }} // Faster transition
                >
                  <Text
                    color="whiteAlpha.700"
                    fontSize={{ base: 'sm', md: 'md' }} // Reduced sizes
                  >
                    {analysisStep}
                  </Text>
                </MotionBox>
              </AnimatePresence>
            </VStack>
            <Box w="100%">
              <Progress
                value={progress}
                size="md" // Reduced from lg
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
                sx={{
                  '& > div': {
                    background:
                      'linear-gradient(90deg, #A855F7, #C084FC, #D8B4FE)',
                    boxShadow: config.isMobile
                      ? '0 0 10px rgba(168, 85, 247, 0.4)'
                      : '0 0 12px rgba(168, 85, 247, 0.5)', // Reduced shadow
                  },
                }}
              />
              <HStack justify="space-between" mt={2}>
                <Text fontSize="xs" color="whiteAlpha.600">
                  0%
                </Text>
                <Text fontSize="xs" color="purple.300" fontWeight="bold">
                  {progress}%
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  100%
                </Text>
              </HStack>
            </Box>
            <Box
              mt={4} // Reduced margin
              p={3} // Reduced padding
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg" // Reduced from xl
              border="1px solid rgba(255, 255, 255, 0.1)"
              w="full"
            >
              <HStack spacing={2.5}>
                {' '}
                {/* Reduced spacing */}
                <Icon as={Sparkles} color="purple.400" boxSize={4} />{' '}
                {/* Reduced size */}
                <Text fontSize="sm" color="whiteAlpha.800">
                  {t('BattleSage AI is preparing personalized insights')}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </VStack>
      </Center>
    </Box>
  )
})

LoadingScreen.displayName = 'LoadingScreen'

export default LoadingScreen
