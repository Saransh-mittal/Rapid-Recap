import React from 'react'
import { Center, HStack, Spinner, Text, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Ensuring MotionBox is defined if not already
const MotionBoxComponent = motion(Box)

/**
 * Loading state component for analysis card
 */
const AnalysisCardLoading = () => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBoxComponent
      p={2.5}
      borderRadius="lg"
      bg="rgba(26, 21, 39, 0.85)"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      borderWidth="1.5px"
      borderColor="blue.500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      position="relative"
      overflow="hidden"
    >
      <Center py={2}>
        <HStack spacing={3}>
          <Spinner size="sm" color="blue.400" />
          <Text color="whiteAlpha.800" fontSize="xs">
            {t('Analyzing challenge data...')}
          </Text>
        </HStack>
      </Center>
    </MotionBoxComponent>
  )
}

export default AnalysisCardLoading
