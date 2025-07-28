import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Text,
  Button,
  Progress,
  VStack,
  HStack,
  Icon,
  useMediaQuery,
  IconButton,
  CloseButton,
} from '@chakra-ui/react'
import {
  ChevronRightIcon,
  StarIcon,
  UnlockIcon,
  LockIcon,
} from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import { keyframes } from '@emotion/react'
import GuestLogin from '../authComponents/GuestLogin'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const shimmer = keyframes`
  from { transform: translateX(-100%) }
  25% { transform: translateX(100%) }
  to { transform: translateX(100%) }
`

const PremiumCTA = ({ readProgress }) => {
  const [showCTA, setShowCTA] = useState(false)
  const [ctaVariant, setCtaVariant] = useState('initial')
  const [againShowCTA, setAgainShowCTA] = useState(false)
  const dispatch = useDispatch()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const { t } = useTranslation('GetStarted')

  useEffect(() => {
    const timer = setTimeout(() => setShowCTA(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let timer
    if (againShowCTA) {
      timer = setTimeout(() => {
        setShowCTA(true)
        setAgainShowCTA(false)
      }, 30000)
    }
    return () => clearTimeout(timer)
  }, [againShowCTA])

  useEffect(() => {
    if (readProgress > 30 && readProgress <= 50) {
      setCtaVariant('engaged')
    } else if (readProgress > 50 && readProgress <= 75) {
      setCtaVariant('quiz')
    } else if (readProgress > 80) {
      setCtaVariant('completion')
    }
  }, [readProgress])

  const ctaContent = {
    initial: {
      title: t('premiumCTA.initial.title'),
      subtitle: t('premiumCTA.initial.subtitle'),
      icon: UnlockIcon,
      buttonText: t('premiumCTA.initial.buttonText'),
    },
    engaged: {
      title: t('premiumCTA.engaged.title'),
      subtitle: t('premiumCTA.engaged.subtitle'),
      icon: StarIcon,
      buttonText: t('premiumCTA.engaged.buttonText'),
    },
    quiz: {
      title: t('premiumCTA.quiz.title'),
      subtitle: t('premiumCTA.quiz.subtitle'),
      icon: LockIcon,
      buttonText: t('premiumCTA.quiz.buttonText'),
    },
    completion: {
      title: t('premiumCTA.completion.title'),
      subtitle: t('premiumCTA.completion.subtitle'),
      icon: LockIcon,
      buttonText: t('premiumCTA.completion.buttonText'),
    },
  }

  return (
    <AnimatePresence>
      {showCTA && (
        <MotionBox
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 100 },
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          position="fixed"
          bottom={isLargerThan768 ? 6 : 0}
          left={isLargerThan768 ? 'auto' : 0}
          right={isLargerThan768 ? 6 : 0}
          width={isLargerThan768 ? '320px' : '100%'}
          transform="none"
          zIndex={50}
        >
          <Box
            bg="rgba(17, 17, 27, 0.95)"
            borderRadius={isLargerThan768 ? 'xl' : 'xl xl 0 0'}
            border="1px solid"
            borderColor="purple.500"
            overflow="hidden"
            backdropFilter="blur(12px)"
            boxShadow="lg"
            position="relative"
            p={4}
          >
            {readProgress > 0 && (
              <Box position="absolute" top={0} left={0} right={0}>
                <Progress
                  value={readProgress}
                  size="xs"
                  colorScheme="purple"
                  bg="whiteAlpha.100"
                  borderRadius="0"
                />
              </Box>
            )}
            <CloseButton
              position={'absolute'}
              right={1}
              top={1}
              onClick={() => {
                setShowCTA(false)
                setAgainShowCTA(true)
              }}
            />
            <VStack spacing={4} align="stretch" pt={2}>
              <HStack spacing={3}>
                <Box p={2} bg="whiteAlpha.100" borderRadius="lg">
                  <Icon
                    as={ctaContent[ctaVariant].icon}
                    w={5}
                    h={5}
                    color="yellow.200"
                  />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="600" color="yellow.200">
                    {ctaContent[ctaVariant].title}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    {ctaContent[ctaVariant].subtitle}
                  </Text>
                </VStack>
              </HStack>

              <Box position="relative">
                <Button
                  w="100%"
                  size="lg"
                  bg="rgb(124, 58, 237)"
                  color="white"
                  _hover={{
                    bg: 'rgb(139, 92, 246)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}
                  _active={{
                    bg: 'rgb(109, 40, 217)',
                  }}
                  onClick={() => dispatch(setIsSigninOpen(true))}
                  rightIcon={<ChevronRightIcon />}
                  position="relative"
                  overflow="hidden"
                >
                  {ctaContent[ctaVariant].buttonText}
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)"
                    animation={`${shimmer} 3s infinite`}
                  />
                </Button>
              </Box>

              {/* <GuestLogin
                premiumCTA={true}
                premiumCTAText={t('premiumCTA.guestUser')}
              /> */}
            </VStack>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default PremiumCTA
