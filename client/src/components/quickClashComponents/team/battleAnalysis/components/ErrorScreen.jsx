// components/quickClashComponents/team/battleAnalysis/components/ErrorScreen.jsx
import React, { useMemo } from 'react'
import { Box, Center, VStack, Text, Button, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const MotionBox = motion(Box)

/**
 * Optimized Error Screen Component - simplified animations for better mobile performance
 */
const ErrorScreen = React.memo(({ error, onRetry }) => {
  const { t } = useTranslation('QuickClash')

  // Memoized responsive configuration - static values for performance
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
      titleSize: window.innerWidth < 768 ? 'xl' : '2xl',
      subtitleSize: window.innerWidth < 768 ? 'md' : 'lg',
      iconSize: window.innerWidth < 768 ? 10 : 12,
      containerPadding: window.innerWidth < 768 ? 6 : 8,
    }),
    [],
  )

  return (
    <Box minH="100vh" position="relative" bg="gray.900">
      <Center minH="100vh" p={4}>
        <VStack spacing={6} maxW="md" textAlign="center">
          {' '}
          {/* Reduced spacing */}
          <MotionBox
            initial={{ scale: 0.8, rotate: -45 }} // Reduced initial scale and rotation
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 100, // Reduced stiffness for smoother animation
              damping: 10, // Adjusted damping
            }}
          >
            <Box
              p={config.containerPadding}
              borderRadius="full"
              bg="rgba(239, 68, 68, 0.12)" // Reduced opacity
              border="3px solid"
              borderColor="red.500"
              boxShadow={
                config.isMobile
                  ? '0 0 20px rgba(239, 68, 68, 0.4)'
                  : '0 0 25px rgba(239, 68, 68, 0.5)' // Reduced shadow
              }
            >
              <Icon
                as={AlertTriangle}
                color="red.400"
                boxSize={config.iconSize}
              />
            </Box>
          </MotionBox>
          <VStack spacing={4}>
            <Text color="red.400" fontSize={config.titleSize} fontWeight="bold">
              {t('Analysis Failed')}
            </Text>
            <Text
              color="whiteAlpha.800"
              fontSize={config.subtitleSize}
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
                transform: 'translateY(-2px)', // Reduced movement
                boxShadow: config.isMobile
                  ? '0 8px 20px rgba(139, 92, 246, 0.3)'
                  : '0 10px 25px rgba(139, 92, 246, 0.4)', // Reduced shadow
              }}
              _active={{ transform: 'translateY(-1px)' }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" // Optimized easing
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
