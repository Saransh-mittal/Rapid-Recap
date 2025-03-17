import React from 'react'
import { Box, Text, Icon, VStack, Button } from '@chakra-ui/react'
import { AlertOctagon, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Utility to check if an error is retryable based on its message
 */
export const isRetryableError = errorMessage => {
  if (!errorMessage) return false

  // List of error substrings that indicate a non-retryable error
  const nonRetryableErrors = [
    'did not complete the challenge',
    'not completed',
    'player has not completed',
    'challenge not completed',
    'opponent has not completed',
    'incomplete challenge',
  ]

  // Check if any non-retryable error substring exists in the message
  return !nonRetryableErrors.some(substring =>
    errorMessage.toLowerCase().includes(substring.toLowerCase()),
  )
}

/**
 * Displays an error state when analysis fetching fails
 */
const AnalysisErrorCard = ({ error, onRetry }) => {
  const { t } = useTranslation('QuickClash')

  // Determine if the error is retryable
  const canRetry = isRetryableError(error)

  // Create a more user-friendly message if needed
  const friendlyErrorMessage = error || t('Failed to load analysis')

  return (
    <MotionBox
      width={'100%'}
      p={3}
      height={{ base: '100%', md: '225px' }}
      borderRadius="lg"
      bg="rgba(26, 21, 39, 0.7)"
      borderWidth="1.5px"
      borderColor={canRetry ? 'red.500' : 'orange.500'}
      boxShadow={`0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px ${
        canRetry ? 'rgba(245, 101, 101, 0.1)' : 'rgba(251, 146, 60, 0.1)'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background error effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={`radial(circle at top right, ${
          canRetry ? 'rgba(245, 101, 101, 0.1)' : 'rgba(251, 146, 60, 0.1)'
        }, transparent 70%)`}
        zIndex="0"
      />

      <VStack spacing={3} position="relative" zIndex="1" textAlign="center">
        <Icon
          as={canRetry ? AlertOctagon : AlertCircle}
          color={canRetry ? 'red.400' : 'orange.400'}
          boxSize={8}
        />

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
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Try Again')}
          </MotionButton>
        )}
      </VStack>
    </MotionBox>
  )
}

export default AnalysisErrorCard
