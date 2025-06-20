// Create this file: src/components/onboarding/TutorialChoice.jsx

import React from 'react'
import {
  Box,
  Text,
  Button,
  VStack,
  Container,
  HStack,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ArrowRight,
  Play,
  SkipForward,
  Star,
  CheckCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const TutorialChoice = ({ onChoice }) => {
  const { t } = useTranslation('OnboardingProcess')
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const containerPadding = useBreakpointValue({ base: 4, md: 8 })

  const handleTutorialChoice = takeTutorial => {
    onChoice({ takeTutorial })
  }

  return (
    <Container
      maxW="2xl"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={containerPadding}
    >
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        w="100%"
        textAlign="center"
      >
        <VStack spacing={{ base: 8, md: 10 }}>
          {/* Header Section */}
          <VStack spacing={4}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Box
                bg="rgba(128, 90, 213, 0.15)"
                borderRadius="full"
                p={6}
                border="2px solid"
                borderColor="purple.400"
                display="inline-block"
              >
                <BookOpen size={48} color="#9F7AEA" />
              </Box>
            </MotionBox>

            <VStack spacing={3}>
              <Text
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
                lineHeight="shorter"
              >
                {t('tutorialChoice.title', 'Ready to Learn?')}
              </Text>

              <Text
                color="whiteAlpha.800"
                fontSize={{ base: 'md', md: 'lg' }}
                maxW="500px"
                lineHeight="tall"
              >
                {t(
                  'tutorialChoice.subtitle',
                  'Would you like a quick tutorial on how to read articles and take quizzes?',
                )}
              </Text>
            </VStack>
          </VStack>

          {/* Tutorial Benefits */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            bg="rgba(26, 21, 39, 0.6)"
            borderRadius="2xl"
            p={6}
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            w="100%"
            maxW="500px"
          >
            <VStack spacing={4}>
              <HStack spacing={2}>
                <Star size={20} color="#9F7AEA" />
                <Text color="purple.300" fontWeight="semibold" fontSize="md">
                  {t('tutorialChoice.benefitsTitle', 'Tutorial Includes')}
                </Text>
              </HStack>

              <VStack spacing={2} align="stretch">
                <HStack spacing={3}>
                  <CheckCircle size={16} color="#48BB78" />
                  <Text color="whiteAlpha.800" fontSize="sm" textAlign="left">
                    {t(
                      'tutorialChoice.benefit1',
                      'How to effectively read articles',
                    )}
                  </Text>
                </HStack>
                <HStack spacing={3}>
                  <CheckCircle size={16} color="#48BB78" />
                  <Text color="whiteAlpha.800" fontSize="sm" textAlign="left">
                    {t(
                      'tutorialChoice.benefit2',
                      'Understanding the quiz format',
                    )}
                  </Text>
                </HStack>
                <HStack spacing={3}>
                  <CheckCircle size={16} color="#48BB78" />
                  <Text color="whiteAlpha.800" fontSize="sm" textAlign="left">
                    {t('tutorialChoice.benefit3', 'Tips for better scores')}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </MotionBox>

          {/* Action Buttons */}
          <VStack spacing={4} w="100%" maxW="400px">
            <MotionButton
              onClick={() => handleTutorialChoice(true)}
              size={buttonSize}
              w="100%"
              h={{ base: '50px', md: '60px' }}
              bg="purple.600"
              color="white"
              rightIcon={<Play size={20} />}
              _hover={{
                bg: 'purple.700',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(128, 90, 213, 0.4)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="bold"
              borderRadius="xl"
              boxShadow="0 4px 15px rgba(128, 90, 213, 0.3)"
            >
              {t('tutorialChoice.takeTutorial', 'Yes, Take Tutorial')}
            </MotionButton>

            <MotionButton
              onClick={() => handleTutorialChoice(false)}
              size={buttonSize}
              w="100%"
              h={{ base: '45px', md: '50px' }}
              bg="whiteAlpha.100"
              color="white"
              rightIcon={<SkipForward size={18} />}
              _hover={{
                bg: 'whiteAlpha.200',
                transform: 'translateY(-1px)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="medium"
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              {t('tutorialChoice.skipTutorial', 'Skip Tutorial')}
            </MotionButton>
          </VStack>

          {/* Helper Text */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Text
              color="whiteAlpha.500"
              fontSize="xs"
              textAlign="center"
              maxW="350px"
            >
              {t(
                'tutorialChoice.helperText',
                'You can always access help guides later from the settings menu',
              )}
            </Text>
          </MotionBox>
        </VStack>
      </MotionBox>
    </Container>
  )
}

export default TutorialChoice
