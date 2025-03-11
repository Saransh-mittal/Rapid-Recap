import React from 'react'
import {
  Box,
  HStack,
  Text,
  Button,
  Icon,
  Spinner,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Brain, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Simplified loading state component for challenge analysis
 */
const AnalysisLoadingState = ({ challenge, onGenerate }) => {
  const { t } = useTranslation('QuickClash')
  const cardBg = useColorModeValue(
    'rgba(26, 32, 58, 0.8)',
    'rgba(26, 32, 58, 0.8)',
  )

  return (
    <MotionBox
      p={3}
      borderRadius="lg"
      bg={cardBg}
      borderWidth="1px"
      borderColor="blue.700"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background pulse effect */}
      <MotionBox
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at center, rgba(66, 153, 225, 0.1), transparent 70%)"
        zIndex="0"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      <VStack spacing={3} align="stretch" position="relative" zIndex="1">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <MotionBox
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icon as={Brain} color="blue.400" boxSize={4} />
            </MotionBox>
            <Text fontWeight="medium" color="white" fontSize="sm">
              {t('AI Analysis')}
            </Text>
          </HStack>

          <HStack>
            <Spinner size="sm" color="blue.400" />
          </HStack>
        </HStack>

        {/* Loading message */}
        <HStack spacing={2} justify="center" py={1}>
          <Text color="whiteAlpha.800" fontSize="xs">
            {t('Analyzing challenge data...')}
          </Text>
          <MotionBox
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <Icon as={Zap} color="blue.300" boxSize={3} />
          </MotionBox>
        </HStack>

        {/* Generate button */}
        <MotionButton
          onClick={onGenerate}
          colorScheme="blue"
          size="sm"
          leftIcon={<Brain size={14} />}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {t('Generate Analysis')}
        </MotionButton>
      </VStack>
    </MotionBox>
  )
}

export default AnalysisLoadingState
