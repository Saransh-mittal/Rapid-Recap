// components/quickClashComponents/team/battleAnalysis/components/LoadingScreen.jsx
import React, { useState, useEffect } from 'react'
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
 * Optimized Loading Screen with AI Processing Animation
 * Memoized to prevent unnecessary re-renders
 */
const LoadingScreen = React.memo(() => {
  const { t } = useTranslation('QuickClash')
  const [progress, setProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState('')

  // Optimized loading steps
  const loadingSteps = React.useMemo(
    () => [
      { step: t('Connecting to battle data...'), progress: 15 },
      { step: t('Loading team performance metrics...'), progress: 30 },
      { step: t('Analyzing battle patterns...'), progress: 45 },
      { step: t('Processing team dynamics...'), progress: 60 },
      { step: t('Identifying key moments...'), progress: 75 },
      { step: t('Generating BattleSage AI insights...'), progress: 90 },
      { step: t('Finalizing personalized analysis...'), progress: 100 },
    ],
    [t],
  )

  useEffect(() => {
    let currentStepIndex = 0
    setAnalysisStep(loadingSteps[0].step)

    const stepInterval = setInterval(() => {
      currentStepIndex++
      if (currentStepIndex < loadingSteps.length) {
        setAnalysisStep(loadingSteps[currentStepIndex].step)
        setProgress(loadingSteps[currentStepIndex].progress)
      } else {
        clearInterval(stepInterval)
      }
    }, 400)

    return () => clearInterval(stepInterval)
  }, [loadingSteps])

  return (
    <Box minH="100vh" position="relative" bg="gray.900">
      <Center minH="100vh" p={4}>
        <VStack spacing={10} maxW="md" w="full">
          <MotionBox
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
              rotate: [0, 120, 240, 360],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Box
              position="relative"
              p={6}
              borderRadius="full"
              bg="rgba(139, 92, 246, 0.15)"
              border="3px solid"
              borderColor="purple.500"
              boxShadow="0 0 30px rgba(139, 92, 246, 0.5)"
            >
              <Spinner
                thickness="4px"
                speed="0.7s"
                emptyColor="rgba(255,255,255,0.05)"
                color="purple.400"
                size="xl"
              />
              <Icon
                as={Brain}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                color="purple.300"
                boxSize={10}
              />
            </Box>
          </MotionBox>

          <VStack spacing={5} textAlign="center" w="100%">
            <VStack spacing={2}>
              <Text
                color="whiteAlpha.900"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                letterSpacing="tight"
              >
                {t('Analyzing Battle')}
              </Text>
              <AnimatePresence mode="wait">
                <MotionBox
                  key={analysisStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Text
                    color="whiteAlpha.700"
                    fontSize={{ base: 'md', md: 'lg' }}
                  >
                    {analysisStep}
                  </Text>
                </MotionBox>
              </AnimatePresence>
            </VStack>

            <Box w="100%">
              <Progress
                value={progress}
                size="lg"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
                sx={{
                  '& > div': {
                    background:
                      'linear-gradient(90deg, #A855F7, #C084FC, #D8B4FE)',
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
                  },
                }}
              />
              <HStack justify="space-between" mt={2.5}>
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
              mt={6}
              p={4}
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="xl"
              border="1px solid rgba(255, 255, 255, 0.1)"
              w="full"
            >
              <HStack spacing={3}>
                <Icon as={Sparkles} color="purple.400" boxSize={5} />
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
