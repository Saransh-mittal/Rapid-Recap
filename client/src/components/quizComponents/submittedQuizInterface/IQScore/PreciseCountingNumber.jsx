import React, { useState, useEffect, useMemo } from 'react'
import { Flex, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { GuestBadge } from './GuestBadge'

const MotionFlex = motion(Flex)

export const PreciseCountingNumber = React.memo(
  ({
    from,
    to,
    duration = 2,
    isGuest,
    needsOnboarding,
    inGameName,
    boostMultiplier,
  }) => {
    const [displayNumber, setDisplayNumber] = useState(parseFloat(from) || 0)
    const { t } = useTranslation('SubmittedQuizInterface')

    useEffect(() => {
      if (isGuest) {
        setDisplayNumber(parseFloat(to))
        return
      }

      let frameId
      const startTime = performance.now()
      const totalDuration = duration * 1000

      const animate = currentTime => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / totalDuration, 1)
        setDisplayNumber(
          parseFloat(from) + (parseFloat(to) - parseFloat(from)) * progress,
        )
        if (progress < 1) {
          frameId = requestAnimationFrame(animate)
        }
      }

      frameId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(frameId)
    }, [from, to, duration, isGuest])

    const [integerPart, decimalPart] = useMemo(() => {
      const fixedNumber = displayNumber?.toFixed(1) || '0.0'
      return fixedNumber.split('.')
    }, [displayNumber])

    return (
      <VStack spacing={0} position="relative">
        <MotionFlex
          alignItems="baseline"
          gap="1px"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          position="relative"
        >
          <Text
            fontSize="4xl"
            fontWeight="bold"
            bgGradient="linear(to-r, yellow.400, orange.400)"
            bgClip="text"
          >
            {integerPart}
          </Text>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            bgGradient="linear(to-r, yellow.400, orange.400)"
            bgClip="text"
            opacity={0.8}
          >
            .{decimalPart}
          </Text>
        </MotionFlex>

        {isGuest && !needsOnboarding && (
          <GuestBadge t={t} inGameName={inGameName} />
        )}
      </VStack>
    )
  },
)
