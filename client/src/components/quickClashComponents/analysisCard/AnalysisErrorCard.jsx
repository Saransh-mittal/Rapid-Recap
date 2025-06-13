import React, { useMemo } from 'react'
import { Box, Text, Icon, VStack, Button } from '@chakra-ui/react'
import { AlertOctagon, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// These motion components are defined outside so they are not recreated on every render.
const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Utility to check if an error is retryable based on its message.
 * This function is pure and outside the component, which is good practice.
 */
export const isRetryableError = errorMessage => {
  if (!errorMessage) return false

  const nonRetryableErrors = [
    'did not complete the challenge',
    'not completed',
    'player has not completed',
    'challenge not completed',
    'opponent has not completed',
    'incomplete challenge',
  ]

  return !nonRetryableErrors.some(substring =>
    errorMessage.toLowerCase().includes(substring.toLowerCase()),
  )
}

/**
 * Displays an error state when analysis fetching fails.
 *
 * Wrapped in React.memo to prevent re-renders if props haven't changed.
 */
const AnalysisErrorCard = React.memo(({ error, onRetry }) => {
  const { t } = useTranslation('QuickClash')

  // useMemo caches the result of isRetryableError.
  // It will only re-calculate when the `error` prop changes.
  const canRetry = useMemo(() => isRetryableError(error), [error])

  // useMemo caches the friendly error message.
  // It will only be re-created if `error` or `t` function changes.
  const friendlyErrorMessage = useMemo(
    () => error || t('Failed to load analysis'),
    [error, t],
  )

  // Memoize values that depend on `canRetry` to avoid re-computing them on every render
  // and to pass stable props to the child components.
  const themeColor = canRetry ? 'red' : 'orange'
  const borderColor = `${themeColor}.500`
  const iconColor = `${themeColor}.400`
  const ErrorIcon = canRetry ? AlertOctagon : AlertCircle

  const boxShadow = useMemo(
    () =>
      `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px ${
        canRetry ? 'rgba(245, 101, 101, 0.1)' : 'rgba(251, 146, 60, 0.1)'
      }`,
    [canRetry],
  )

  const bgGradient = useMemo(
    () =>
      `radial(circle at top right, ${
        canRetry ? 'rgba(245, 101, 101, 0.1)' : 'rgba(251, 146, 60, 0.1)'
      }, transparent 70%)`,
    [canRetry],
  )

  // Static objects for framer-motion props don't need memoization as they
  // are constant, but it's good practice if they were dynamic.
  const motionBoxAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  }

  const motionButtonAnimation = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  }

  return (
    <MotionBox
      width="100%"
      p={3}
      height={{ base: '100%', md: '225px' }}
      borderRadius="lg"
      bg="rgba(26, 21, 39, 0.7)"
      borderWidth="1.5px"
      borderColor={borderColor}
      boxShadow={boxShadow}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
      {...motionBoxAnimation}
    >
      {/* Background error effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={bgGradient}
        zIndex="0"
      />

      <VStack spacing={3} position="relative" zIndex="1" textAlign="center">
        <Icon as={ErrorIcon} color={iconColor} boxSize={8} />

        <Text color="whiteAlpha.900" fontWeight="semibold">
          {canRetry ? t('Analysis Error') : t('Analysis Unavailable')}
        </Text>

        <Text color="whiteAlpha.700" fontSize="sm" maxW="85%">
          {friendlyErrorMessage}
        </Text>

        {canRetry && (
          <MotionButton
            mt={2}
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={onRetry} // `onRetry` should be wrapped in useCallback in the parent component
            {...motionButtonAnimation}
          >
            {t('Try Again')}
          </MotionButton>
        )}
      </VStack>
    </MotionBox>
  )
})

export default AnalysisErrorCard
