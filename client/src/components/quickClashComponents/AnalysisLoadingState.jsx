// components/quickClashComponents/AnalysisLoadingState.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Icon,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Sparkles,
  Zap,
  AtomIcon,
  Lightbulb,
  Microscope,
  ServerCrash,
  BookOpen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)

const AnalysisLoadingState = ({ challenge, onGenerate }) => {
  const { t } = useTranslation('QuickClash')
  const [messageIndex, setMessageIndex] = useState(0)
  const cardBg = useColorModeValue(
    'rgba(26, 21, 39, 0.85)',
    'rgba(26, 21, 39, 0.85)',
  )

  // Array of engaging loading messages
  const loadingMessages = [
    {
      text: t('AI is analyzing your battle performance...'),
      icon: Brain,
      color: 'purple.400',
    },
    {
      text: t('Comparing your answers with your opponent...'),
      icon: Microscope,
      color: 'blue.400',
    },
    {
      text: t('Examining your knowledge patterns...'),
      icon: Lightbulb,
      color: 'yellow.400',
    },
    {
      text: t('Creating personalized learning recommendations...'),
      icon: BookOpen,
      color: 'green.400',
    },
    {
      text: t('Processing battle data for insights...'),
      icon: AtomIcon,
      color: 'cyan.400',
    },
    {
      text: t('Quantifying your intellectual strengths...'),
      icon: Sparkles,
      color: 'pink.400',
    },
  ]

  // Rotate through messages every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [loadingMessages.length])

  const currentMessage = loadingMessages[messageIndex]

  return (
    <MotionBox
      p={4}
      borderRadius="lg"
      bg={cardBg}
      border="1px solid"
      borderColor="purple.700"
      mb={4}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack>
            <Icon as={Brain} color="purple.400" boxSize={5} />
            <Text fontWeight="bold">{t('AI Analysis')}</Text>
          </HStack>
          <Badge colorScheme="purple" px={2} py={1}>
            {challenge.category}
          </Badge>
        </HStack>

        {/* Loading animation */}
        <AnimatePresence mode="wait">
          <MotionFlex
            key={`message-${messageIndex}`}
            justify="center"
            align="center"
            direction="column"
            py={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Box mb={4}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                color={currentMessage.color}
                size="xl"
                mb={4}
              />
            </Box>

            <HStack mb={3}>
              <Icon as={currentMessage.icon} color={currentMessage.color} />
              <MotionText
                fontSize="md"
                fontWeight="medium"
                textAlign="center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentMessage.text}
              </MotionText>
            </HStack>

            <Text fontSize="sm" color="whiteAlpha.600" textAlign="center">
              {t('This may take up to 30 seconds')}
            </Text>
          </MotionFlex>
        </AnimatePresence>

        {/* Footer text */}
        <Text fontSize="xs" color="whiteAlpha.600" textAlign="center">
          {t(
            'Advanced AI algorithms are evaluating your battle performance and creating personalized insights',
          )}
        </Text>
      </VStack>
    </MotionBox>
  )
}

export default AnalysisLoadingState
