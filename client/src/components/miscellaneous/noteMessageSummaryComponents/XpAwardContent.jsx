// XpAwardContent.jsx
import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Flex,
  Icon,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getMilestoneInfo } from '../noteMessages/milestones'
import { StarIcon, ArrowRightIcon } from '@chakra-ui/icons'
import { Award, Zap, Trophy } from 'lucide-react'
import { useSelector } from 'react-redux'

// Import SVG components
import TrophySVG from '../../../assets/svg/TrophySVG'

// Motion components
const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionHStack = motion(HStack)
const MotionBadge = motion(Badge)
const MotionIcon = motion(Icon)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { y: 5, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 120,
    },
  },
}

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: 'reverse',
  },
}

const XpAwardContent = ({ message }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const { user } = useSelector(state => state.auth)
  const milestoneInfo = message.milestoneName
    ? getMilestoneInfo(message.milestoneName)
    : null
  const totalXp = message.xpAwarded + (milestoneInfo?.xpReward || 0)

  // Determine badge color and icon based on type
  const getBadgeProps = () => {
    if (message.isLevelUp) {
      return {
        color: 'blue.400',
        gradientColors: 'blue.500, cyan.400',
        icon: Zap,
      }
    } else if (message.isMilestone || message.milestoneName) {
      return {
        color: 'yellow.400',
        gradientColors: 'yellow.500, orange.400',
        icon: Trophy,
      }
    } else {
      return {
        color: 'green.400',
        gradientColors: 'green.500, teal.400',
        icon: Award,
      }
    }
  }

  const { color, gradientColors, icon } = getBadgeProps()

  return (
    <MotionFlex
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      direction="column"
      spacing={3}
    >
      <MotionHStack spacing={3} variants={itemVariants}>
        <MotionBox
          bg={
            message.isLevelUp
              ? 'blue.500'
              : message.isMilestone || message.milestoneName
              ? 'yellow.500'
              : 'green.500'
          }
          borderRadius="full"
          p={2}
          boxShadow={`0 0 15px ${color}`}
          animate={
            message.isLevelUp
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }
              : message.isMilestone || message.milestoneName
              ? { scale: [1, 1.1, 1] }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat:
              message.isLevelUp || message.isMilestone || message.milestoneName
                ? Infinity
                : 0,
            repeatType: 'reverse',
          }}
        >
          <MotionIcon as={icon} color="white" boxSize={6} />
        </MotionBox>

        <VStack align="start" spacing={0.5}>
          <MotionText
            fontWeight="bold"
            fontSize="md"
            bgGradient={`linear(to-r, ${gradientColors})`}
            bgClip="text"
            variants={itemVariants}
          >
            {message.isLevelUp
              ? t('epicLevelUp')
              : message.isMilestone || message.milestoneName
              ? t('milestoneAchieved')
              : t('xpAward')}
          </MotionText>

          <MotionHStack variants={itemVariants}>
            <Badge
              colorScheme={color.split('.')[0]}
              variant="subtle"
              fontSize="xs"
              px={2}
              py={0.5}
              borderRadius="full"
            >
              {message.isLevelUp
                ? t('levelUp')
                : message.isMilestone || message.milestoneName
                ? t('milestone')
                : t('experience')}
            </Badge>

            <MotionText fontSize="sm" color={`${color}`} fontWeight="bold">
              {t('xpEarned', { totalXp })}
            </MotionText>
          </MotionHStack>
        </VStack>
      </MotionHStack>

      {/* Level up animation */}
      {message.isLevelUp && (
        <MotionBox
          variants={itemVariants}
          bg="rgba(66, 153, 225, 0.08)"
          p={3}
          borderRadius="md"
          mt={1}
        >
          <Flex align="center" justify="center">
            <MotionFlex
              align="center"
              justify="center"
              direction="column"
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Text fontSize="lg" fontWeight="bold" color="blue.300">
                {user.level - 1}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                {t('level')}
              </Text>
            </MotionFlex>

            <MotionIcon
              as={ArrowRightIcon}
              color="blue.300"
              mx={4}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: {
                  delay: 0.3,
                  type: 'spring',
                  stiffness: 200,
                },
              }}
            />

            <MotionFlex
              align="center"
              justify="center"
              direction="column"
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{
                scale: [1, 1.2, 1],
                transition: {
                  delay: 0.5,
                  duration: 0.8,
                  times: [0, 0.5, 1],
                },
              }}
            >
              <Text
                fontSize="2xl"
                fontWeight="extrabold"
                color="blue.300"
                textShadow="0 0 10px rgba(66, 153, 225, 0.5)"
              >
                {user.level}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                {t('level')}
              </Text>
            </MotionFlex>
          </Flex>
        </MotionBox>
      )}

      {/* Milestone information */}
      {message.milestoneName && milestoneInfo && (
        <MotionBox
          variants={itemVariants}
          bg="rgba(255, 255, 255, 0.03)"
          borderRadius="md"
          p={2}
          mt={1}
          borderLeft="2px solid"
          borderColor="yellow.400"
        >
          <VStack spacing={1} align="start">
            <Text fontSize="sm" fontWeight="semibold" color="yellow.400">
              {milestoneInfo.name}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.800">
              {milestoneInfo.description}
            </Text>
            <HStack spacing={1}>
              <StarIcon color="yellow.400" boxSize={3} />
              <Text fontSize="xs" fontWeight="bold" color="yellow.400">
                +{milestoneInfo.xpReward} XP
              </Text>
            </HStack>
          </VStack>
        </MotionBox>
      )}

      {/* Milestone content for non-named milestones */}
      {message.isMilestone &&
        !message.milestoneName &&
        message.milestoneContent && (
          <MotionBox
            variants={itemVariants}
            bg="rgba(255, 255, 255, 0.03)"
            borderRadius="md"
            p={2}
            mt={1}
            borderLeft="2px solid"
            borderColor="green.400"
          >
            <VStack spacing={1} align="start">
              <Text fontSize="sm" fontWeight="semibold" color="green.400">
                {t('milestoneContent')}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.800">
                {message.milestoneContent}
              </Text>
            </VStack>
          </MotionBox>
        )}

      {/* Source information when available */}
      {message.xpSource && (
        <MotionBox variants={itemVariants}>
          <HStack spacing={2} fontSize="xs" color="whiteAlpha.600" mt={1}>
            <Text>{t('source')}:</Text>
            <Text color="whiteAlpha.800">{message.xpSource}</Text>
          </HStack>
        </MotionBox>
      )}
    </MotionFlex>
  )
}

export default XpAwardContent
