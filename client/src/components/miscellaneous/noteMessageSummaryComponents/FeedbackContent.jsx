// FeedbackContent.jsx
import React from 'react'
import {
  Flex,
  VStack,
  Text,
  Textarea,
  Box,
  HStack,
  Icon,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { StarIcon, ChatIcon } from '@chakra-ui/icons'
import { Clipboard, MessageSquare, FileText, Award } from 'lucide-react'
import { useNoteMessageSummary } from '../../../customHooks/useNoteMessageSummary'
import { lazy } from 'react'

// Lazy load StarRating component
const StarRating = lazy(() => import('../noteMessages/StarRating'))

// Motion components
const MotionFlex = motion(Flex)
const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionHStack = motion(HStack)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const FeedbackContent = ({ type }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const { t: UnifiedFeedbackTranslate } = useTranslation(
    'UnifiedFeedbackNoteMessage',
  )

  const {
    rating,
    setRating,
    quizRating,
    setQuizRating,
    feedback,
    setFeedback,
    quizFeedback,
    setQuizFeedback,
    tournamentQuizRating,
    setTournamentQuizRating,
    tournamentQuizFeedback,
    setTournamentQuizFeedback,
  } = useNoteMessageSummary()

  const getFeedbackProps = () => {
    switch (type) {
      case 'story':
        return {
          title: UnifiedFeedbackTranslate('StoryBodyTitle'),
          currentRating: rating,
          setCurrentRating: setRating,
          currentFeedback: feedback,
          setCurrentFeedback: setFeedback,
          icon: FileText,
          color: 'green.400',
          gradientColors: 'green.500, teal.400',
          badgeText: 'Story',
        }
      case 'quiz':
        return {
          title: UnifiedFeedbackTranslate('QuizBodyTitle'),
          currentRating: quizRating,
          setCurrentRating: setQuizRating,
          currentFeedback: quizFeedback,
          setCurrentFeedback: setQuizFeedback,
          icon: Clipboard,
          color: 'blue.400',
          gradientColors: 'blue.500, cyan.400',
          badgeText: 'Quiz',
        }
      case 'tournamentQuiz':
        return {
          title: UnifiedFeedbackTranslate('TournamentQuizBodyTitle'),
          currentRating: tournamentQuizRating,
          setCurrentRating: setTournamentQuizRating,
          currentFeedback: tournamentQuizFeedback,
          setCurrentFeedback: setTournamentQuizFeedback,
          icon: Award,
          color: 'purple.400',
          gradientColors: 'purple.500, pink.400',
          badgeText: 'Tournament',
        }
      default:
        return {
          title: '',
          currentRating: 0,
          setCurrentRating: () => {},
          currentFeedback: '',
          setCurrentFeedback: () => {},
          icon: MessageSquare,
          color: 'gray.400',
          gradientColors: 'gray.500, blue.400',
          badgeText: 'Feedback',
        }
    }
  }

  const {
    title,
    currentRating,
    setCurrentRating,
    currentFeedback,
    setCurrentFeedback,
    icon,
    color,
    gradientColors,
    badgeText,
  } = getFeedbackProps()

  return (
    <MotionFlex
      direction="column"
      align="center"
      w="100%"
      position="relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MotionHStack
        spacing={2}
        mb={2}
        variants={itemVariants}
        w="100%"
        justify="space-between"
      >
        <HStack>
          <Icon as={icon} color={color} boxSize={5} />
          <MotionText
            fontWeight="bold"
            bgGradient={`linear(to-r, ${gradientColors})`}
            bgClip="text"
          >
            {title}
          </MotionText>
        </HStack>
        <Badge colorScheme={color.split('.')[0]} fontSize="xs">
          {badgeText}
        </Badge>
      </MotionHStack>

      <Divider mb={3} borderColor="rgba(255, 255, 255, 0.06)" />

      <VStack spacing={4} align="center" w="100%">
        <MotionBox variants={itemVariants} w="100%" align="center">
          <StarRating
            rating={currentRating}
            onRatingChange={setCurrentRating}
            size="md"
          />
        </MotionBox>

        <MotionBox variants={itemVariants} w="100%">
          <Textarea
            placeholder={t('feedbackPlaceholder')}
            value={currentFeedback}
            onChange={e => setCurrentFeedback(e.target.value)}
            bg="rgba(255, 255, 255, 0.03)"
            color="white"
            border="1px solid"
            borderColor={`${color.split('.')[0]}.500`}
            _hover={{ borderColor: `${color.split('.')[0]}.400` }}
            _focus={{
              borderColor: `${color.split('.')[0]}.300`,
              boxShadow: `0 0 0 1px ${color}`,
            }}
            resize="vertical"
            fontSize="sm"
            height="80px"
            borderRadius="md"
          />
        </MotionBox>

        {/* Rating guide */}
        <MotionBox
          variants={itemVariants}
          w="100%"
          bg={`${color.split('.')[0]}.50`}
          borderRadius="md"
          p={2}
          opacity={0.7}
        >
          <HStack spacing={1} justify="space-between">
            <MotionText fontSize="xs" color={`${color.split('.')[0]}.500`}>
              1 ★ {t('poor')}
            </MotionText>
            <MotionText fontSize="xs" color={`${color.split('.')[0]}.500`}>
              5 ★ {t('excellent')}
            </MotionText>
          </HStack>
        </MotionBox>
      </VStack>
    </MotionFlex>
  )
}

export default FeedbackContent
