// components/quickClashComponents/dailyTasks/LevelProgressBar.jsx
import React from 'react'
import {
  Box,
  Text,
  Flex,
  Icon,
  HStack,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Award, Crown, Star, ChevronRight, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

/**
 * Interactive level progress bar that shows current level and progress towards next level
 * @param {Object} props - Component props
 * @param {number} props.level - Current level
 * @param {number} props.xpProgress - Current XP progress towards next level
 * @param {number} props.xpForNextLevel - XP needed for next level
 * @param {boolean} props.levelUp - Whether the user just leveled up
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 * @param {boolean} props.animated - Whether to show animations
 */
const LevelProgressBar = ({
  level = 1,
  xpProgress = 0,
  xpForNextLevel = 10,
  levelUp = false,
  size = 'md',
  animated = true,
}) => {
  const { t } = useTranslation('QuickClash')

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round((xpProgress / xpForNextLevel) * 100),
  )

  // Size variations
  const sizeMappings = {
    sm: {
      height: '30px',
      fontSize: 'xs',
      iconSize: 4,
      badgeSize: '22px',
      levelFontSize: 'sm',
    },
    md: {
      height: '36px',
      fontSize: 'sm',
      iconSize: 5,
      badgeSize: '26px',
      levelFontSize: 'md',
    },
    lg: {
      height: '44px',
      fontSize: 'md',
      iconSize: 6,
      badgeSize: '32px',
      levelFontSize: 'lg',
    },
  }

  const currentSize = sizeMappings[size] || sizeMappings.md

  // Level icon based on level range
  const getLevelIcon = level => {
    if (level >= 30) return Crown
    if (level >= 15) return Star
    return Award
  }

  const LevelIcon = getLevelIcon(level)

  return (
    <MotionBox
      w="100%"
      initial={animated ? { opacity: 0, y: 10 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      position="relative"
    >
      {/* Level badges */}
      <Flex justify="space-between" mb={1} px={1}>
        <Tooltip label={t('Current Level')}>
          <HStack>
            <MotionBox
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bgGradient="linear(to-br, purple.500, blue.500)"
              width={currentSize.badgeSize}
              height={currentSize.badgeSize}
              color="white"
              fontWeight="bold"
              fontSize={currentSize.levelFontSize}
              boxShadow="0 0 10px rgba(128, 90, 213, 0.6)"
              initial={levelUp && animated ? { scale: 0.8 } : {}}
              animate={
                levelUp && animated
                  ? {
                      scale: [0.8, 1.3, 1],
                      boxShadow: [
                        '0 0 0px rgba(128, 90, 213, 0)',
                        '0 0 20px rgba(128, 90, 213, 0.8)',
                        '0 0 10px rgba(128, 90, 213, 0.6)',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 0.8 }}
            >
              <MotionIcon
                as={LevelIcon}
                boxSize={currentSize.iconSize}
                animate={
                  levelUp && animated
                    ? { rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }
                    : {}
                }
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </MotionBox>
            <MotionText
              fontSize={currentSize.fontSize}
              fontWeight="bold"
              color="white"
              initial={levelUp && animated ? { opacity: 0, x: -10 } : {}}
              animate={levelUp && animated ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {level}
            </MotionText>
          </HStack>
        </Tooltip>

        <Tooltip label={t('Next Level')}>
          <HStack
            opacity={0.7}
            transition="opacity 0.2s"
            _hover={{ opacity: 1 }}
          >
            <MotionText fontSize={currentSize.fontSize} color="whiteAlpha.800">
              {level + 1}
            </MotionText>
            <MotionIcon
              as={ChevronRight}
              boxSize={3}
              animate={animated ? { x: [0, 3, 0] } : {}}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                repeatType: 'reverse',
              }}
            />
          </HStack>
        </Tooltip>
      </Flex>

      {/* Progress bar */}
      <Box
        w="100%"
        h={currentSize.height}
        bg="rgba(0, 0, 0, 0.3)"
        borderRadius="full"
        overflow="hidden"
        boxShadow="inner"
        position="relative"
      >
        {/* Progress fill */}
        <MotionFlex
          h="100%"
          alignItems="center"
          borderRadius="full"
          bgGradient="linear(to-r, purple.500, blue.400)"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: 'easeOut',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            animation: 'shine 2s infinite linear',
            '@keyframes shine': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' },
            },
          }}
        >
          {/* Progress text inside the bar */}
          {progressPercentage >= 30 && (
            <MotionText
              color="white"
              fontSize={currentSize.fontSize}
              fontWeight="bold"
              textShadow="0 0 5px rgba(0, 0, 0, 0.5)"
              ml={3}
              initial={animated ? { opacity: 0 } : {}}
              animate={animated ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              {xpProgress}/{xpForNextLevel} XP
            </MotionText>
          )}
        </MotionFlex>

        {/* Progress text outside the bar - shown when percentage is low */}
        {progressPercentage < 30 && (
          <MotionText
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            color="white"
            fontSize={currentSize.fontSize}
            fontWeight="bold"
            textShadow="0 0 5px rgba(0, 0, 0, 0.5)"
            initial={animated ? { opacity: 0 } : {}}
            animate={animated ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            {xpProgress}/{xpForNextLevel} XP
          </MotionText>
        )}

        {/* Optional level up indicator effects */}
        {levelUp && animated && (
          <>
            <MotionIcon
              as={Zap}
              position="absolute"
              right={progressPercentage > 80 ? '10%' : '20%'}
              top="50%"
              transform="translateY(-50%)"
              color="yellow.300"
              boxSize={currentSize.iconSize}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -20, -40],
              }}
              transition={{
                duration: 1.5,
                delay: 0.2,
                times: [0, 0.3, 1],
              }}
            />

            <MotionIcon
              as={Star}
              position="absolute"
              left="30%"
              top="50%"
              transform="translateY(-50%)"
              color="yellow.300"
              boxSize={currentSize.iconSize}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -15, -30],
              }}
              transition={{
                duration: 1.2,
                delay: 0.5,
                times: [0, 0.3, 1],
              }}
            />
          </>
        )}
      </Box>

      {/* Level up label */}
      {levelUp && (
        <MotionBox
          position="absolute"
          top="-20px"
          left="50%"
          transform="translateX(-50%)"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 1, 0],
            y: [10, -5, -20],
            scale: [0.9, 1.2, 1],
          }}
          transition={{
            duration: 2,
            times: [0, 0.3, 1],
          }}
        >
          <Text
            color="yellow.300"
            fontWeight="bold"
            fontSize={currentSize.levelFontSize}
            textShadow="0 0 10px rgba(236, 201, 75, 0.8)"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {t('Level Up!')}
          </Text>
        </MotionBox>
      )}
    </MotionBox>
  )
}

export default LevelProgressBar
