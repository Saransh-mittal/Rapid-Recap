// components/quickClashComponents/modals/newChallengeComponents/ChallengeCreationAnimation.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  Text,
  HStack,
  Icon,
  Spinner,
  Button,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Sparkles,
  FlaskConical,
  Swords,
  ScrollText,
  Lightbulb,
  Hourglass,
  Target,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

const ChallengeCreationAnimation = ({ onClose, categories = [] }) => {
  const { t } = useTranslation('QuickClash')
  const [currentStep, setCurrentStep] = useState(0)
  const stepIntervalRef = useRef(null)
  const isSmallScreen = useBreakpointValue({ base: true, md: false })

  // Animation messages showing different stages of AI processing
  const processingSteps = [
    {
      text: t('AI is analyzing selected categories...'),
      icon: Brain,
      color: 'purple.400',
    },
    {
      text: t('Generating mixed article content...'),
      icon: ScrollText,
      color: 'blue.400',
    },
    {
      text: t('Crafting the perfect questions...'),
      icon: Lightbulb,
      color: 'yellow.400',
    },
    {
      text: t('Balancing difficulty levels...'),
      icon: FlaskConical,
      color: 'teal.400',
    },
    {
      text: t('Analyzing content readability...'),
      icon: Sparkles,
      color: 'pink.400',
    },
    {
      text: t('Creating knowledge challenge...'),
      icon: Swords,
      color: 'orange.400',
    },
    {
      text: t('Finalizing your challenge...'),
      icon: Target,
      color: 'green.400',
    },
  ]

  // Cycle through the messages every 4 seconds
  useEffect(() => {
    stepIntervalRef.current = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % processingSteps.length)
    }, 4000)

    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current)
      }
    }
  }, [processingSteps.length])

  const currentAnimation = processingSteps[currentStep]

  return (
    <VStack spacing={6} align="stretch" pt={4} pb={6}>
      {/* Challenge categories */}
      {categories.length > 0 && (
        <HStack justify="center" flexWrap="wrap" spacing={2}>
          {categories.map(category => (
            <Badge
              key={category}
              colorScheme="purple"
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="md"
            >
              {category}
            </Badge>
          ))}
        </HStack>
      )}

      {/* Animated steps */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={`step-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          textAlign="center"
          px={6}
          py={8}
        >
          <VStack spacing={6}>
            <MotionIcon
              as={currentAnimation.icon}
              color={currentAnimation.color}
              boxSize={{ base: 12, md: 16 }}
              initial={{ scale: 0.8 }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />

            <MotionText
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="medium"
              color="white"
            >
              {currentAnimation.text}
            </MotionText>

            <HStack justify="center" spacing={2}>
              <Spinner size="sm" color="purple.400" />
              <Text color="whiteAlpha.800" fontSize="sm">
                {t('This takes about 30-45 seconds')}
              </Text>
            </HStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>

      {/* Information banner */}
      <Box
        bg="rgba(45, 27, 84, 0.3)"
        p={4}
        borderRadius="md"
        borderLeft="4px solid"
        borderColor="blue.400"
        mx={isSmallScreen ? 4 : 12}
      >
        <HStack spacing={3} align="flex-start">
          <Icon as={Hourglass} color="blue.400" mt={1} />
          <Text fontSize="sm" color="whiteAlpha.900">
            {t(
              "You can close this window. We'll notify you when your challenge is ready to play!",
            )}
          </Text>
        </HStack>
      </Box>

      {/* Close button */}
      <Box textAlign="center" pt={2}>
        <Button
          onClick={onClose}
          variant="ghost"
          color="whiteAlpha.800"
          _hover={{ bg: 'whiteAlpha.100' }}
          size="md"
        >
          {t('Close')}
        </Button>
      </Box>
    </VStack>
  )
}

export default ChallengeCreationAnimation
