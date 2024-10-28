import React, { useCallback, useEffect, useState } from 'react'
import { Box, VStack, Heading, Text, Button } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isClient } from '../../utils/environment'
import { useFeatureDetection } from '../../utils/featureDetection'

const Hero = ({ isWeakDevice }) => {
  const { t } = useTranslation('GetStarted')
  const [isHydrated, setIsHydrated] = useState(false)
  const features = useFeatureDetection()

  const { user, isAuthenticated } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isClient) {
      setIsHydrated(true)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (!isClient) return

    if (isAuthenticated && user) {
      navigate('/home')
      return
    }
    dispatch(setIsSigninOpen(true))
  }, [isAuthenticated, user, navigate, dispatch])

  // Only enable animations if we're on client and all conditions are met
  const shouldAnimate =
    isHydrated &&
    !isWeakDevice &&
    features.hasAnimationSupport &&
    !features.hasMotionReduction

  // Base styles that work on both server and client
  const baseStyles = {
    heading: {
      fontSize: { base: '4xl', md: '5xl', lg: '6xl' },
      color: 'white',
      textAlign: 'center',
    },
    text: {
      fontSize: { base: 'xl', md: '2xl' },
      color: 'white',
      textAlign: 'center',
    },
    button: {
      colorScheme: 'brand',
      size: 'lg',
    },
  }

  // Animation props only added on client if supported
  const animationProps = shouldAnimate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {}

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      {...animationProps}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0,0,0,0.5)"
      />
      <VStack spacing={8} textAlign="center" maxWidth="800px" px={4} zIndex={1}>
        <Heading {...baseStyles.heading}>{t('Hero.title')}</Heading>
        <Text {...baseStyles.text}>{t('Hero.subtitle')}</Text>
        <Button
          {...baseStyles.button}
          onClick={isClient ? handleClick : undefined}
          _hover={shouldAnimate ? { transform: 'scale(1.05)' } : undefined}
          _active={shouldAnimate ? { transform: 'scale(0.95)' } : undefined}
        >
          {t('Hero.getStartedButton')}
        </Button>
      </VStack>
    </Box>
  )
}

export default Hero
