// components/quickClashComponents/globalmatchmaking/components/BattleCreationDisplay.jsx
import React from 'react'
import { VStack, Text, Box, HStack, Icon, Spinner } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Loader, AlertTriangle, Users, FileText, Zap } from 'lucide-react'

const MotionFlex = motion(Box)

/**
 * Display component for battle creation states (creating/failed)
 */
const BattleCreationDisplay = React.memo(({ status, error }) => {
  const { t } = useTranslation('QuickClash')

  if (status === 'creating') {
    return (
      <VStack spacing={6} align="center">
        <MotionFlex
          justify="center"
          align="center"
          w="120px"
          h="120px"
          borderRadius="full"
          bg="rgba(128, 90, 213, 0.1)"
          border="2px solid"
          borderColor="purple.400"
          position="relative"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            },
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          <Icon as={Loader} color="purple.400" boxSize={12} />
        </MotionFlex>

        <VStack spacing={2} align="center">
          <Text color="purple.400" fontSize="2xl" fontWeight="bold">
            {t('Creating Your Battle')}
          </Text>
          <Text color="whiteAlpha.800" fontSize="md" textAlign="center">
            {t('Please wait while we set up your 4v4 team battle')}
          </Text>
        </VStack>

        <Box
          w="100%"
          bg="rgba(128, 90, 213, 0.1)"
          borderRadius="md"
          p={4}
          borderWidth="1px"
          borderColor="purple.500"
        >
          <VStack spacing={3}>
            <Text color="purple.400" fontWeight="bold" fontSize="md">
              {t('Setting Up Battle')}
            </Text>
            <VStack spacing={2} w="100%">
              <HStack justify="space-between" w="100%">
                <HStack>
                  <Icon as={Users} color="purple.300" boxSize={4} />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('Preparing teams')}
                  </Text>
                </HStack>
                <Spinner size="sm" color="purple.400" />
              </HStack>
              <HStack justify="space-between" w="100%">
                <HStack>
                  <Icon as={FileText} color="purple.300" boxSize={4} />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('Generating questions')}
                  </Text>
                </HStack>
                <Spinner size="sm" color="purple.400" />
              </HStack>
              <HStack justify="space-between" w="100%">
                <HStack>
                  <Icon as={Zap} color="purple.300" boxSize={4} />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('Almost ready')}
                  </Text>
                </HStack>
                <Spinner size="sm" color="purple.400" />
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Box
          w="100%"
          bg="rgba(245, 166, 35, 0.1)"
          borderRadius="md"
          p={3}
          borderWidth="1px"
          borderColor="orange.400"
        >
          <HStack>
            <Icon as={AlertTriangle} color="orange.400" boxSize={5} />
            <Text color="orange.300" fontSize="sm" fontWeight="bold">
              {t('Cannot leave during battle creation')}
            </Text>
          </HStack>
          <Text color="whiteAlpha.700" fontSize="xs" mt={1}>
            {t('Your battle will be ready shortly')}
          </Text>
        </Box>
      </VStack>
    )
  }

  if (status === 'failed') {
    return (
      <VStack spacing={6} align="center">
        <MotionFlex
          justify="center"
          align="center"
          w="120px"
          h="120px"
          borderRadius="full"
          bg="rgba(245, 101, 101, 0.1)"
          border="2px solid"
          borderColor="red.400"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Icon as={AlertTriangle} color="red.400" boxSize={12} />
        </MotionFlex>

        <VStack spacing={2} align="center">
          <Text color="red.400" fontSize="2xl" fontWeight="bold">
            {t('Battle Creation Failed')}
          </Text>
          <Text color="whiteAlpha.800" fontSize="md" textAlign="center">
            {error || t('Something went wrong while creating your battle')}
          </Text>
        </VStack>

        <Box
          w="100%"
          bg="rgba(245, 101, 101, 0.1)"
          borderRadius="md"
          p={4}
          borderWidth="1px"
          borderColor="red.500"
        >
          <Text color="red.300" fontWeight="bold" fontSize="sm" mb={2}>
            {t('What happened?')}
          </Text>
          <Text color="whiteAlpha.700" fontSize="sm">
            {t(
              'We encountered an issue while setting up your battle. You can try joining matchmaking again.',
            )}
          </Text>
        </Box>
      </VStack>
    )
  }

  return null
})

BattleCreationDisplay.displayName = 'BattleCreationDisplay'

export default BattleCreationDisplay
