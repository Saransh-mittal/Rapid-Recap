import React, { memo } from 'react'
import { Badge, HStack, Text, Icon } from '@chakra-ui/react'
import { Trophy, Shield, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBadge = motion(Badge)
const MotionIcon = motion(Icon)

const ResultBadge = ({ userIsWinner, isTie, customAnimation = true }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBadge
      px={2}
      py={1}
      borderRadius="full"
      bg={
        userIsWinner
          ? 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)'
          : isTie
          ? 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)'
          : 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)'
      }
      color="white"
      boxShadow={
        userIsWinner
          ? '0 0 10px rgba(72, 187, 120, 0.4)'
          : isTie
          ? '0 0 10px rgba(66, 153, 225, 0.3)'
          : '0 0 10px rgba(245, 101, 101, 0.4)'
      }
      animate={
        customAnimation && userIsWinner
          ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 5px rgba(72, 187, 120, 0.2)',
                '0 0 12px rgba(72, 187, 120, 0.6)',
                '0 0 5px rgba(72, 187, 120, 0.2)',
              ],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      display="flex"
      alignItems="center"
      fontWeight="bold"
      fontSize="xs"
    >
      <HStack spacing={1}>
        <MotionIcon
          as={userIsWinner ? Trophy : isTie ? Shield : XCircle}
          boxSize={3}
          animate={
            customAnimation && userIsWinner
              ? {
                  rotate: [-5, 0, 5, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <Text fontSize="xs" fontWeight="bold">
          {userIsWinner ? t('Victory!') : isTie ? t('Draw') : t('Defeat')}
        </Text>
      </HStack>
    </MotionBadge>
  )
}

export default memo(ResultBadge)
