import React from 'react'
import { Flex, VStack, Text, Textarea } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import StarRating from '../noteMessages/StarRating'
import { useNoteMessageSummary } from '../../../customHooks/useNoteMessageSummary'

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
        }
      case 'quiz':
        return {
          title: UnifiedFeedbackTranslate('QuizBodyTitle'),
          currentRating: quizRating,
          setCurrentRating: setQuizRating,
          currentFeedback: quizFeedback,
          setCurrentFeedback: setQuizFeedback,
        }
      case 'tournamentQuiz':
        return {
          title: UnifiedFeedbackTranslate('TournamentQuizBodyTitle'),
          currentRating: tournamentQuizRating,
          setCurrentRating: setTournamentQuizRating,
          currentFeedback: tournamentQuizFeedback,
          setCurrentFeedback: setTournamentQuizFeedback,
        }
      default:
        return {
          title: '',
          currentRating: 0,
          setCurrentRating: () => {},
          currentFeedback: '',
          setCurrentFeedback: () => {},
        }
    }
  }

  const {
    title,
    currentRating,
    setCurrentRating,
    currentFeedback,
    setCurrentFeedback,
  } = getFeedbackProps()

  return (
    <Flex direction="column" align="center" w="100%" position="relative">
      <VStack spacing={4} align="center" w="100%">
        <Text fontSize="lg" fontWeight="bold" color="purple.300">
          {title}
        </Text>
        <StarRating rating={currentRating} onRatingChange={setCurrentRating} />
        <Textarea
          placeholder={t('feedbackPlaceholder')}
          value={currentFeedback}
          onChange={e => setCurrentFeedback(e.target.value)}
          bg="gray.700"
          color="white"
          border="1px solid"
          borderColor="purple.500"
          _hover={{ borderColor: 'purple.400' }}
          _focus={{
            borderColor: 'purple.300',
            boxShadow: '0 0 0 1px #805AD5',
          }}
          resize="vertical"
        />
      </VStack>
    </Flex>
  )
}

export default FeedbackContent
