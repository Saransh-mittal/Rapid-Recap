// components/quickClashComponents/team/battleAnalysis/components/ErrorScreen.jsx
import React from 'react'
import { Box, Center, VStack, Text, Button, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const MotionBox = motion(Box)

/**
 * Optimized Error Screen Component
 * Memoized to prevent unnecessary re-renders
 */
const ErrorScreen = React.memo(({ error, onRetry }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Box minH="100vh" position="relative" bg="gray.900">
      <Center minH="100vh" p={4}>
        <VStack spacing={8} maxW="md" textAlign="center">
          <MotionBox
            initial={{ scale: 0.5, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          >
            <Box
              p={6}
              borderRadius="full"
              bg="rgba(239, 68, 68, 0.15)"
              border="3px solid"
              borderColor="red.500"
              boxShadow="0 0 30px rgba(239, 68, 68, 0.5)"
            >
              <Icon as={AlertTriangle} color="red.400" boxSize={12} />
            </Box>
          </MotionBox>
          <VStack spacing={4}>
            <Text
              color="red.400"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
            >
              {t('Analysis Failed')}
            </Text>
            <Text
              color="whiteAlpha.800"
              fontSize={{ base: 'md', md: 'lg' }}
              maxW="sm"
            >
              {error}
            </Text>
            <Button
              leftIcon={<ArrowLeft size={18} />}
              colorScheme="purple"
              size="lg"
              onClick={onRetry}
              bgGradient="linear(to-r, purple.500, purple.600)"
              borderRadius="xl"
              px={8}
              py={6}
              mt={4}
              _hover={{
                bgGradient: 'linear(to-r, purple.600, purple.700)',
                transform: 'translateY(-3px)',
                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
              }}
              _active={{ transform: 'translateY(-1px)' }}
              transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            >
              {t('Back to Battles')}
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Box>
  )
})

ErrorScreen.displayName = 'ErrorScreen'

export default ErrorScreen
