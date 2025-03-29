// components/quickClashComponents/user/UserLevelDisplay.jsx
import React from 'react'
import {
  Box,
  Text,
  HStack,
  VStack,
  Tooltip,
  Icon,
  CircularProgress,
  CircularProgressLabel,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Award, Star, Crown, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionIcon = motion(Icon)
const MotionText = motion(Text)

/**
 * Component to display user level and XP with a nice visualization
 * Can be used in headers, profiles, etc.
 */
const UserLevelDisplay = ({
  size = 'md',
  isCompact = false,
  showXPValue = true,
  animated = true,
  onClick = null,
}) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  // If no user, return empty component
  if (!user) return null

  // Derive level and XP values from user object
  const level = user.level || 0
  const xp = user.xp || 0

  // Calculate XP for next level
  const xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2
  const xpForNextLevel = (level + 1) * 10
  const totalXpNeeded = xpBaseAtCurrLevel + xpForNextLevel
  const xpProgress = xp - xpBaseAtCurrLevel
  const progressPercentage = Math.min(
    100,
    Math.round((xpProgress / xpForNextLevel) * 100),
  )

  // Determine size
  const sizeConfig = {
    sm: {
      iconSize: 3,
      fontSize: 'xs',
      badgeSize: '16px',
      circleSize: '36px',
      circleFontSize: 'xs',
      circleThickness: 3,
    },
    md: {
      iconSize: 4,
      fontSize: 'sm',
      badgeSize: '20px',
      circleSize: '44px',
      circleFontSize: 'sm',
      circleThickness: 4,
    },
    lg: {
      iconSize: 5,
      fontSize: 'md',
      badgeSize: '24px',
      circleSize: '52px',
      circleFontSize: 'md',
      circleThickness: 5,
    },
  }

  const currentSize = sizeConfig[size] || sizeConfig.md

  // Get the appropriate icon based on level
  const getLevelIcon = level => {
    if (level >= 30) return Crown
    if (level >= 15) return Star
    return Award
  }

  const LevelIcon = getLevelIcon(level)

  return (
    <MotionBox
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <Tooltip
        label={`${t('XP')}: ${xp} | ${t('Level')}: ${level} | ${t(
          'Next level',
        )}: ${xpProgress}/${xpForNextLevel} XP`}
        placement="bottom"
        hasArrow
      >
        <HStack spacing={2} align="center">
          {/* Level Circle */}
          <CircularProgress
            value={progressPercentage}
            size={currentSize.circleSize}
            thickness={currentSize.circleThickness}
            color="purple.400"
            trackColor="whiteAlpha.200"
            capIsRound
          >
            <CircularProgressLabel>
              <Flex direction="column" align="center" justify="center">
                <MotionIcon
                  as={LevelIcon}
                  color="yellow.400"
                  boxSize={currentSize.iconSize}
                  animate={
                    animated
                      ? {
                          rotate: [0, 10, 0, -10, 0],
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={{
                    repeat: Infinity,
                    repeatType: 'reverse',
                    duration: 5,
                  }}
                />
                <MotionText
                  fontSize={currentSize.circleFontSize}
                  fontWeight="bold"
                  color="white"
                  lineHeight="1"
                >
                  {level}
                </MotionText>
              </Flex>
            </CircularProgressLabel>
          </CircularProgress>

          {/* XP Info - only show in non-compact mode */}
          {!isCompact && (
            <VStack spacing={0} align="flex-start">
              <Text
                color="whiteAlpha.900"
                fontSize={currentSize.fontSize}
                fontWeight="bold"
              >
                {t('Level')} {level}
              </Text>

              {showXPValue && (
                <Flex align="center">
                  <Text color="whiteAlpha.600" fontSize="xs">
                    {t('XP')}: {xpProgress}/{xpForNextLevel}
                  </Text>
                  <MotionIcon
                    as={Info}
                    boxSize={2.5}
                    ml={1}
                    color="whiteAlpha.500"
                    _hover={{ color: 'whiteAlpha.800' }}
                  />
                </Flex>
              )}
            </VStack>
          )}
        </HStack>
      </Tooltip>
    </MotionBox>
  )
}

export default UserLevelDisplay
