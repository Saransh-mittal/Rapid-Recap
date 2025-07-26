// components/quickClashComponents/ui/ResultBanner.jsx
import React from 'react'
import {
  Flex,
  Badge,
  HStack,
  Text,
  Icon,
  Box,
  Button,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Shield, Swords, AlertCircle } from 'lucide-react'
import { css } from '@emotion/react'

const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

// Define keyframe animations for shine effect
const resultBannerAnimations = css`
  @keyframes shineEffect {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`

/**
 * Enhanced banner showing the result of a completed challenge without trophy displays
 * Protection information moved to VSLine component
 */
const ResultBanner = ({
  isWinner,
  isTie,
  isDefeat,
  expiresAt,
  category,
  onRevenge,
  revengeStatus,
  revengeLoading,
}) => {
  const { t } = useTranslation('QuickClash')
  const isExpired = new Date(expiresAt) < new Date()

  // Adjust the condition to always show the banner for completed challenges
  if (isExpired && !isWinner && !isTie && !isDefeat) return null

  const getCategoryStyle = category => {
    const categoryColors = {
      World: 'blue',
      Politics: 'red',
      Business: 'green',
      Technology: 'cyan',
      Sports: 'orange',
      Health: 'teal',
      Science: 'purple',
      Environment: 'green',
      LIFESTYLE: 'purple',
      FOOD: 'orange',
    }
    return categoryColors[category] || 'purple'
  }

  // Enhanced premium gradients - sleek but visible
  const bgGradient = isWinner
    ? 'linear-gradient(135deg, rgba(128, 90, 213, 0.9), rgba(66, 153, 225, 0.9))'
    : isTie
    ? 'linear-gradient(135deg, rgba(236, 201, 75, 0.9), rgba(237, 137, 54, 0.9))'
    : 'linear-gradient(135deg, rgba(229, 62, 62, 0.9), rgba(159, 18, 57, 0.9))'

  // Shine overlay gradient for premium effect
  const shineGradient =
    'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'

  // Select appropriate icon for result
  const resultIcon = isWinner ? Trophy : isTie ? Shield : AlertCircle

  return (
    <MotionFlex
      position="relative"
      py={{ base: 2, md: 2.5 }}
      px={{ base: 3, md: 4 }}
      bg={bgGradient}
      backgroundSize="200% 100%"
      overflow="hidden"
      borderBottomRadius="lg"
      alignItems="center"
      justifyContent="space-between"
      color="white"
      fontWeight="bold"
      boxShadow="0 2px 8px rgba(0,0,0,0.2)"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      css={resultBannerAnimations}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: shineGradient,
        backgroundSize: '200% 100%',
        animation: 'shineEffect 3s infinite linear',
        zIndex: 0,
      }}
    >
      <HStack spacing={2} position="relative" zIndex={1}>
        <Icon
          as={resultIcon}
          color={isWinner ? 'yellow.300' : isTie ? 'yellow.100' : 'red.100'}
          boxSize={{ base: 4, md: 4.5 }}
        />
        <Text
          textTransform="uppercase"
          letterSpacing="wide"
          fontSize={{ base: 'sm', md: 'sm' }}
          fontWeight="bold"
        >
          {isWinner ? t('Victory!') : isTie ? t('Tie!') : t('Defeat!')}
        </Text>
      </HStack>

      <HStack spacing={1} position="relative" zIndex={1}>
        {/* Category badge - appropriately sized */}
        <Badge
          colorScheme={getCategoryStyle(category)}
          fontSize={{ base: '2xs', md: 'xs' }}
          borderRadius="full"
          px={2}
          py={0.5}
          fontWeight="medium"
        >
          {category}
        </Badge>

        {/* Inline revenge button for defeats - bigger for better usability */}
        {isDefeat && onRevenge && !revengeStatus && (
          <MotionButton
            size={{ base: 'sm', md: 'sm' }}
            colorScheme="red"
            bg="#e15b5b"
            leftIcon={<Icon as={Swords} boxSize={{ base: 3, md: 3.5 }} />}
            onClick={onRevenge}
            borderRadius="full"
            px={4}
            py={1}
            height={{ base: '28px', md: '32px' }}
            minW="auto"
            isLoading={revengeLoading}
            fontWeight="bold"
            fontSize={{ base: 'xs', md: 'sm' }}
            boxShadow="0 0 10px rgba(229, 62, 62, 0.4)"
            _hover={{
              bg: '#d43c3c',
              boxShadow: '0 0 12px rgba(229, 62, 62, 0.6)',
              transform: 'translateY(-1px)',
            }}
            _active={{
              bg: '#c83c3c',
              transform: 'translateY(0)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 10px rgba(229, 62, 62, 0.4)',
                '0 0 15px rgba(229, 62, 62, 0.7)',
                '0 0 10px rgba(229, 62, 62, 0.4)',
              ],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              },
            }}
          >
            {t('Revenge')}
          </MotionButton>
        )}
        {isDefeat && revengeStatus && (
          <Text fontSize="xs" color="whiteAlpha.600" textAlign="center">
            {t('Revenge sent')}
          </Text>
        )}
      </HStack>
    </MotionFlex>
  )
}

export default ResultBanner
