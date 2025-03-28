// MessageContent.jsx
import React from 'react'
import { Text, Box, Flex, Icon, Divider } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { InfoIcon } from '@chakra-ui/icons'
import { Bell } from 'lucide-react'

// Import the specialized content components
import XpAwardContent from './XpAwardContent'
import StreakContent from './StreakContent'
import FeedbackContent from './FeedbackContent'
import TournamentContent from './TournamentContent'
import QuickClashContent from './QuickClashContent'

// Motion components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)

// Animation variants
const contentVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    },
  },
}

const MessageContent = ({ message }) => {
  const { t } = useTranslation('NoteMessageSummary')

  // Determine badge color based on message type
  const getBadgeProps = () => {
    switch (message.messageType) {
      case 'xpAward':
        return {
          color: 'yellow.400',
          icon: 'trophy',
          bgGradient: 'linear(to-r, yellow.500, orange.400)',
        }
      case 'streak':
        return {
          color: 'orange.400',
          icon: 'flame',
          bgGradient: 'linear(to-r, orange.500, red.400)',
        }
      case 'tournament':
        return {
          color: 'purple.400',
          icon: 'tournament',
          bgGradient: 'linear(to-r, purple.500, blue.400)',
        }
      case 'storyFeedback':
      case 'quizFeedback':
      case 'tournamentQuizFeedback':
        return {
          color: 'green.400',
          icon: 'feedback',
          bgGradient: 'linear(to-r, green.500, teal.400)',
        }
      case 'quickClash':
        return {
          color: 'blue.400',
          icon: 'swords',
          bgGradient: 'linear(to-r, blue.500, cyan.400)',
        }
      default:
        return {
          color: 'gray.400',
          icon: 'info',
          bgGradient: 'linear(to-r, gray.500, blue.400)',
        }
    }
  }

  // Generic wrapper for messages without specialized components
  const GenericMessageContent = () => (
    <MotionFlex
      direction="column"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      gap={2}
    >
      <Flex justify="space-between" align="center">
        <MotionText
          fontWeight="bold"
          fontSize="md"
          bgGradient={getBadgeProps().bgGradient}
          bgClip="text"
        >
          {message.title}
        </MotionText>
        <Box
          px={2}
          py={1}
          borderRadius="full"
          bg={`${getBadgeProps().color}30`}
          display="flex"
          alignItems="center"
        >
          <Icon
            as={getBadgeProps().icon === 'info' ? InfoIcon : Bell}
            color={getBadgeProps().color}
            mr={1}
            boxSize="0.8em"
          />
          <Text color={getBadgeProps().color} fontSize="xs" fontWeight="medium">
            {t('notification')}
          </Text>
        </Box>
      </Flex>

      <Divider borderColor="rgba(255, 255, 255, 0.06)" my={1} />

      <Text color="whiteAlpha.800" fontSize="sm">
        {message.content}
      </Text>
    </MotionFlex>
  )

  // Return the appropriate content component based on message type
  switch (message.messageType) {
    case 'xpAward':
      return <XpAwardContent message={message} />
    case 'streak':
      return <StreakContent message={message} />
    case 'storyFeedback':
      return <FeedbackContent type="story" />
    case 'quizFeedback':
      return <FeedbackContent type="quiz" />
    case 'tournamentQuizFeedback':
      return <FeedbackContent type="tournamentQuiz" />
    case 'tournament':
      return <TournamentContent message={message} />
    case 'quickClash':
      return <QuickClashContent message={message} />
    default:
      return <GenericMessageContent />
  }
}

export default MessageContent
