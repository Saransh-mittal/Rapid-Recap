import React, { useCallback, useEffect, useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isClient } from '../../utils/environment'
import useSafeSound from '../../customHooks/useSafeSound'
import { useFeatureDetection } from '../../utils/featureDetection'
import SafeErrorBoundary from '../SSR-Safety-Components/SafeErrorBoundary'
import {
  SafeBox,
  SafeHeading,
  SafeText,
  SafeButton,
} from '../SSR-Safety-Components/SafeChakra'

const Hero = ({ isWeakDevice }) => {
  const { t } = useTranslation('GetStarted')
  const [isClientSide, setIsClientSide] = useState(false)
  const features = useFeatureDetection()

  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  const { user, isAuthenticated } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isClient) {
      setIsClientSide(true)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (isClientSide && features.hasAudioSupport) {
      playClick()
    }
    if (isAuthenticated && user) {
      navigate('/home')
      return
    }
    dispatch(setIsSigninOpen(true))
  }, [
    isAuthenticated,
    user,
    navigate,
    playClick,
    dispatch,
    isWeakDevice,
    isClientSide,
    features,
  ])

  // Only enable animations if supported and not reduced motion
  const shouldAnimate =
    isClientSide &&
    !isWeakDevice &&
    features.hasAnimationSupport &&
    !features.hasMotionReduction

  const ContentWrapper = isWeakDevice ? Box : SafeBox
  const HeadingComponent = isWeakDevice ? Box : SafeHeading
  const TextComponent = isWeakDevice ? Box : SafeText
  const ButtonComponent = isWeakDevice ? Box : SafeButton

  const animations = shouldAnimate
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
      }
    : {}

  return (
    <SafeErrorBoundary>
      <ContentWrapper
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        {...animations}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.5)"
        />
        <VStack
          spacing={8}
          textAlign="center"
          maxWidth="800px"
          px={4}
          zIndex={1}
        >
          <HeadingComponent
            fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
            {...(shouldAnimate
              ? {
                  initial: { y: 20, opacity: 0 },
                  animate: { y: 0, opacity: 1 },
                  transition: { duration: 0.5 },
                }
              : {})}
          >
            {t('Hero.title')}
          </HeadingComponent>
          <TextComponent
            fontSize={{ base: 'xl', md: '2xl' }}
            {...(shouldAnimate
              ? {
                  initial: { y: 20, opacity: 0 },
                  animate: { y: 0, opacity: 1 },
                  transition: { duration: 0.5, delay: 0.2 },
                }
              : {})}
          >
            {t('Hero.subtitle')}
          </TextComponent>
          <ButtonComponent
            colorScheme="brand"
            size="lg"
            onClick={handleClick}
            {...(shouldAnimate
              ? {
                  initial: { y: 20, opacity: 0 },
                  animate: { y: 0, opacity: 1 },
                  transition: { duration: 0.5, delay: 0.4 },
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 },
                }
              : {})}
          >
            {t('Hero.getStartedButton')}
          </ButtonComponent>
        </VStack>
      </ContentWrapper>
    </SafeErrorBoundary>
  )
}

export default Hero
