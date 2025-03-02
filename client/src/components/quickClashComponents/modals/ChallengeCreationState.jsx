// components/quickClashComponents/modals/ChallengeCreationState.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  VStack,
  Box,
  Text,
  Progress,
  Icon,
  HStack,
  Spinner,
  Button,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  Sparkles,
  Zap,
  Atom,
  Lightbulb,
  Dices,
  Target,
  Users,
  FileText,
  Swords,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionText = motion(Text)

const ChallengeCreationState = ({ onCancel, progress = 0 }) => {
  const { t } = useTranslation('QuickClash')
  const [messageIndex, setMessageIndex] = useState(0)
  const [showDismissOption, setShowDismissOption] = useState(false)

  // After 15 seconds, show the option to dismiss the modal
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDismissOption(true)
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  // Array of engaging loading messages that show the AI generation process
  const loadingMessages = [
    {
      text: t('AI is initializing challenge parameters...'),
      icon: BrainCircuit,
      color: 'purple.400',
    },
    {
      text: t('Generating article content from selected categories...'),
      icon: FileText,
      color: 'blue.400',
    },
    {
      text: t('Analyzing knowledge patterns for balanced questions...'),
      icon: Lightbulb,
      color: 'yellow.400',
    },
    {
      text: t('Crafting thought-provoking questions...'),
      icon: Dices,
      color: 'green.400',
    },
    {
      text: t('Creating multi-language support...'),
      icon: Atom,
      color: 'cyan.400',
    },
    {
      text: t('Balancing difficulty levels for fair competition...'),
      icon: Swords,
      color: 'red.400',
    },
    {
      text: t('Generating dictionary terms and key highlights...'),
      icon: Sparkles,
      color: 'pink.400',
    },
    {
      text: t('Preparing battle environment for both players...'),
      icon: Target,
      color: 'orange.400',
    },
  ]

  // Rotate through messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [loadingMessages.length])

  const currentMessage = loadingMessages[messageIndex]

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      width="100%"
    >
      <VStack spacing={6} align="stretch">
        {/* Progress bar */}
        <Box>
          <Text fontSize="sm" color="whiteAlpha.700" mb={2} textAlign="center">
            {progress < 100
              ? t('Creating your challenge...')
              : t('Challenge created successfully!')}
          </Text>
          <Progress
            value={progress}
            size="sm"
            colorScheme="purple"
            borderRadius="full"
            hasStripe
            isAnimated
          />
        </Box>

        {/* Loading animation */}
        <AnimatePresence mode="wait">
          <MotionBox
            key={`message-${messageIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            py={8}
          >
            <VStack>
              <Box mb={4} position="relative">
                <Spinner
                  thickness="4px"
                  speed="0.75s"
                  color={currentMessage.color}
                  size="xl"
                  position="absolute"
                  left="50%"
                  top="50%"
                  transform="translate(-50%, -50%)"
                />
                <Icon
                  as={currentMessage.icon}
                  color={currentMessage.color}
                  boxSize={{ base: 10, md: 12 }}
                  position="relative"
                  zIndex={2}
                  mx="auto"
                />
              </Box>

              <MotionText
                fontSize="md"
                fontWeight="medium"
                textAlign="center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                color="white"
              >
                {currentMessage.text}
              </MotionText>

              <Text
                fontSize="sm"
                color="whiteAlpha.600"
                textAlign="center"
                mt={2}
              >
                {t('This may take up to 30-45 seconds')}
              </Text>
            </VStack>
          </MotionBox>
        </AnimatePresence>

        {/* Option to dismiss modal */}
        {showDismissOption && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
          >
            <VStack spacing={2}>
              <Text fontSize="sm" color="whiteAlpha.800">
                {t('You can close this window.')}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.600">
                {t('You will be notified once the challenge is ready.')}
              </Text>
              <Button
                variant="outline"
                size="sm"
                colorScheme="whiteAlpha"
                mt={2}
                onClick={onCancel}
              >
                {t('Close Window')}
              </Button>
            </VStack>
          </MotionBox>
        )}
      </VStack>
    </MotionBox>
  )
}

export default ChallengeCreationState
