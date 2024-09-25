// File: UnifiedFeedbackNoteMessage.jsx
import React, { useState, useMemo, lazy, Suspense } from 'react'
import { Text, VStack, Box, Flex, Textarea } from '@chakra-ui/react'

// Lazy load the StarRating component
const StarRating = lazy(() => import('./StarRating'))
const NoteMessage = lazy(() => import('./NoteMessage'))

const UnifiedFeedbackNoteMessage = ({
  messageId,
  title,
  onClose,
  duration,
  width = '320px',
  feedbackId, // Can be quizId or storyId
  feedbackType, // 'quiz' or 'storytheme'
  FeedbackTitle = null,
  t,
}) => {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  const customContent = useMemo(
    () => (
      <Flex direction="column" align="center" w="100%" position="relative">
        <VStack spacing={4} align="center" w="100%">
          <Text fontSize="lg" fontWeight="bold" color="purple.300">
            {FeedbackTitle !== null ? FeedbackTitle : t('rateYourExperience')}
          </Text>
          <Suspense fallback={<Box h="40px" />}>
            <StarRating rating={rating} onRatingChange={setRating} />
          </Suspense>
          <Textarea
            placeholder={t('feedbackPlaceholder')}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
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
    ),
    [rating, feedback, t],
  )

  return (
    <NoteMessage
      messageId={messageId}
      title={title || t('feedbackRequest')}
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={[
        {
          actionType:
            feedbackType === 'quiz'
              ? 'SUBMIT_QUIZ_FEEDBACK'
              : 'SUBMIT_RATING_FEEDBACK',
        },
      ]}
      feedbackContent={{
        rating,
        feedback,
        feedbackId, // This can be either quizId or storyId
      }}
    />
  )
}

export default UnifiedFeedbackNoteMessage
