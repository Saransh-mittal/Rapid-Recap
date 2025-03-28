// StreakContent.jsx
import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatRemainingTime } from '../../../utils/helper.utils'
import { InfoIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons'
import { Flame, Zap, X, Clock, AlertTriangle } from 'lucide-react'

// Import SVG components
import UnlinkSVG from '../../../assets/svg/UnlinkSVG'
import RevivalSVG from '../../../assets/svg/RevivalSVG'
import CheckCircle from '../../../assets/svg/CheckCircle'
import FireSVG from '../../../assets/svg/FireSVG'

// Motion components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionHStack = motion(HStack)
const MotionText = motion(Text)
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

const StreakContent = ({ message }) => {
  const { t } = useTranslation('NoteMessageSummary')

  const getStreakIcon = streakStatus => {
    switch (streakStatus) {
      case 'broken':
        return <Icon as={X} color="red.400" boxSize={6} />
      case 'revival':
        return <Icon as={Zap} color="yellow.400" boxSize={6} />
      case 'revived':
        return <Icon as={CheckCircle} color="green.400" boxSize={6} />
      default:
        return <Icon as={Flame} color="orange.400" boxSize={6} />
    }
  }

  const getStreakColorScheme = streakStatus => {
    switch (streakStatus) {
      case 'broken':
        return 'red'
      case 'revival':
        return 'yellow'
      case 'revived':
        return 'green'
      default:
        return 'orange'
    }
  }

  const colorScheme = getStreakColorScheme(message.streakStatus)

  return (
    <MotionFlex
      spacing={3}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      direction="column"
    >
      <MotionHStack spacing={3} variants={itemVariants}>
        <MotionBox
          bg={`${colorScheme}.400`}
          borderRadius="full"
          p={2}
          boxShadow={`0 0 12px ${colorScheme}.300`}
          initial={{ rotate: 0 }}
          animate={
            message.streakStatus === 'broken'
              ? { rotate: [0, -10, 10, -10, 0] }
              : message.streakStatus === 'revival'
              ? { scale: [1, 1.1, 1] }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: message.streakStatus === 'revival' ? Infinity : 0,
            repeatType: 'reverse',
          }}
        >
          {getStreakIcon(message.streakStatus)}
        </MotionBox>

        <VStack align="start" spacing={0.5}>
          <MotionText
            fontWeight="bold"
            fontSize="md"
            bgGradient={`linear(to-r, ${colorScheme}.400, ${
              colorScheme === 'yellow'
                ? 'orange.400'
                : colorScheme === 'red'
                ? 'orange.600'
                : colorScheme === 'green'
                ? 'teal.400'
                : 'red.400'
            })`}
            bgClip="text"
            variants={itemVariants}
          >
            {message.title}
          </MotionText>

          <MotionHStack variants={itemVariants}>
            <Badge
              colorScheme={colorScheme}
              variant="subtle"
              fontSize="xs"
              px={2}
              py={0.5}
              borderRadius="full"
            >
              {message.streakStatus === 'broken'
                ? t('broken')
                : message.streakStatus === 'revival'
                ? t('revival')
                : message.streakStatus === 'revived'
                ? t('revived')
                : t('active')}
            </Badge>

            <MotionText
              fontSize="sm"
              color={`${colorScheme}.400`}
              fontWeight="bold"
            >
              {message.streakStatus === 'broken'
                ? t('streakEnded', { count: message.streakCount })
                : t('streak', { count: message.streakCount })}
            </MotionText>
          </MotionHStack>
        </VStack>
      </MotionHStack>

      {message.streakStatus === 'revival' && message.remainingTime && (
        <MotionBox
          variants={itemVariants}
          bg={`rgba(${
            colorScheme === 'yellow' ? '250, 240, 137' : '255, 165, 0'
          }, 0.06)`}
          borderRadius="md"
          p={2}
          mt={1}
          borderLeft="2px solid"
          borderColor={`${colorScheme}.400`}
        >
          <VStack spacing={1} align="start">
            {message.remainingQuizzes > 0 && (
              <HStack spacing={2}>
                <MotionIcon
                  as={Zap}
                  color={`${colorScheme}.400`}
                  boxSize={4}
                  {...pulseAnimation}
                />
                <Text fontSize="sm" color="whiteAlpha.800">
                  {t('completeMoreQuizzes', {
                    count: message.remainingQuizzes,
                    quizCount:
                      message.remainingQuizzes === 1 ? t('quiz') : t('quizzes'),
                  })}
                </Text>
              </HStack>
            )}

            <HStack spacing={2}>
              <Icon as={Clock} color={`${colorScheme}.400`} boxSize={4} />
              <Text fontSize="sm" color="whiteAlpha.800">
                {t('timeToRevive', {
                  formattedTime: formatRemainingTime(
                    message.remainingTime * 1000,
                  ),
                })}
              </Text>
            </HStack>

            <Box w="100%" mt={1}>
              <Progress
                value={(message.remainingTime / (24 * 60 * 60)) * 100}
                size="xs"
                colorScheme={colorScheme}
                borderRadius="full"
                bg="rgba(255,255,255,0.1)"
              />
            </Box>
          </VStack>
        </MotionBox>
      )}

      {message.streakStatus === 'broken' && (
        <MotionBox
          variants={itemVariants}
          bg="rgba(254, 178, 178, 0.06)"
          borderRadius="md"
          p={2}
          mt={1}
          borderLeft="2px solid"
          borderColor="red.400"
        >
          <HStack spacing={2}>
            <Icon as={AlertTriangle} color="red.400" boxSize={4} />
            <Text fontSize="sm" color="whiteAlpha.800">
              {t('streakRestartTip')}
            </Text>
          </HStack>
        </MotionBox>
      )}

      {message.streakStatus === 'revived' && (
        <MotionBox
          variants={itemVariants}
          bg="rgba(154, 230, 180, 0.06)"
          borderRadius="md"
          p={2}
          mt={1}
          borderLeft="2px solid"
          borderColor="green.400"
        >
          <HStack spacing={2}>
            <Icon as={Zap} color="green.400" boxSize={4} />
            <Text fontSize="sm" color="whiteAlpha.800">
              {t('streakRevivedMessage')}
            </Text>
          </HStack>
        </MotionBox>
      )}
    </MotionFlex>
  )
}

export default StreakContent
