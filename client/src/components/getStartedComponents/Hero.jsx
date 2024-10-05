import React, { useCallback } from 'react'
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import useSound from '../../customHooks/useSound'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionButton = motion(Button)

const Hero = ({ isWeakDevice }) => {
  const { t } = useTranslation('GetStarted')
  const { playClick } = useSound()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    if (isAuthenticated && user) {
      navigate('/home')
      return
    }
    if (!isWeakDevice) {
      playClick()
    }
    dispatch(setIsSigninOpen(true))
  }, [isAuthenticated, user, navigate, playClick, dispatch, isWeakDevice])

  const ContentWrapper = isWeakDevice ? Box : MotionBox
  const HeadingComponent = isWeakDevice ? Heading : MotionHeading
  const TextComponent = isWeakDevice ? Text : MotionText
  const ButtonComponent = isWeakDevice ? Button : MotionButton

  return (
    <ContentWrapper
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      {...(isWeakDevice
        ? {}
        : {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { duration: 0.5 },
          })}
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
        <HeadingComponent
          fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
          {...(isWeakDevice
            ? {}
            : {
                initial: { y: 20, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                transition: { duration: 0.5 },
              })}
        >
          {t('Hero.title')}
        </HeadingComponent>
        <TextComponent
          fontSize={{ base: 'xl', md: '2xl' }}
          {...(isWeakDevice
            ? {}
            : {
                initial: { y: 20, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                transition: { duration: 0.5, delay: 0.2 },
              })}
        >
          {t('Hero.subtitle')}
        </TextComponent>
        <ButtonComponent
          colorScheme="brand"
          size="lg"
          onClick={handleClick}
          {...(isWeakDevice
            ? {}
            : {
                initial: { y: 20, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                transition: { duration: 0.5, delay: 0.4 },
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 },
              })}
        >
          {t('Hero.getStartedButton')}
        </ButtonComponent>
      </VStack>
    </ContentWrapper>
  )
}

export default Hero
