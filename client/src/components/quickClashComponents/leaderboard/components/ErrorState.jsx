// components/quickClashComponents/leaderboard/components/ErrorState.jsx
import React from 'react'
import { Center, VStack, Text, Icon, Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { X, ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion.div

const ErrorState = React.memo(({ error, onRetry }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center py={10} h="50vh">
      <VStack spacing={4}>
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon as={X} color="red.400" boxSize={8} />
        </MotionBox>
        <Text color="white" fontSize="sm" textAlign="center" px={6}>
          {error}
        </Text>
        <Button
          onClick={onRetry}
          colorScheme="purple"
          size="sm"
          mt={2}
          leftIcon={<Icon as={ChevronLeft} boxSize={4} />}
        >
          {t('Try Again')}
        </Button>
      </VStack>
    </Center>
  )
})

ErrorState.displayName = 'ErrorState'

export default ErrorState
