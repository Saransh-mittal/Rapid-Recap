import React, { useState, useEffect } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFeatureDetection } from '../../utils/featureDetection'
import useSafeSound from '../../hooks/useSafeSound'
import SafeErrorBoundary from '../SSR-Safety-Components/SafeErrorBoundary'
import { isClient } from '../../utils/environment'

const MotionBox = isClient ? motion(Box) : Box

const GetSetGoAnimation = ({ onComplete }) => {
  const [step, setStep] = useState(0)
  const steps = ['Get', 'Set', 'Go!']
  const features = useFeatureDetection()

  const { playGetSetGoSound, isReady } = useSafeSound({
    enabled: features.hasAudioSupport,
    soundEnabled: true,
    onError: err => console.warn('Sound error in GetSetGo:', err),
  })

  useEffect(() => {
    if (!isClient || !isReady || !features.hasAudioSupport) return

    try {
      playGetSetGoSound(1000, 0.2)
    } catch (err) {
      console.warn('Error playing initial GetSetGo sound:', err)
    }
  }, [isReady, features.hasAudioSupport])

  useEffect(() => {
    if (!isClient) return

    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1)
        if (isReady && features.hasAudioSupport) {
          try {
            setTimeout(
              () =>
                step === 0
                  ? playGetSetGoSound(1200, 0.4)
                  : playGetSetGoSound(1400, 0.8),
              400,
            )
          } catch (err) {
            console.warn('Error playing step sound:', err)
          }
        }
      } else {
        onComplete()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [
    step,
    steps.length,
    onComplete,
    playGetSetGoSound,
    isReady,
    features.hasAudioSupport,
  ])

  const shouldAnimate =
    isClient && features.hasAnimationSupport && !features.hasMotionReduction

  const getAnimationProps = step => {
    if (!shouldAnimate) return {}

    return {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 2, opacity: 0 },
      transition: { duration: 0.5 },
    }
  }

  return (
    <SafeErrorBoundary>
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        alignItems="center"
        justifyContent="center"
        zIndex="overlay"
        backdropFilter="blur(10px)"
        display="flex"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backdropFilter="blur(10px)"
          pointerEvents="none"
          alignItems="center"
          justifyContent="center"
          display="flex"
        >
          <AnimatePresence mode="wait">
            <MotionBox key={step} {...getAnimationProps(step)}>
              <Text
                fontSize="7xl"
                fontWeight="bold"
                color="purple.500"
                textShadow="2px 2px 4px rgba(0,0,0,0.5)"
              >
                {steps[step]}
              </Text>
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>
    </SafeErrorBoundary>
  )
}

export default GetSetGoAnimation
