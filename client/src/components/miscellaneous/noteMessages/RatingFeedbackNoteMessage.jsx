import React, { useState, useMemo, lazy, Suspense } from 'react'
import { Text, VStack, Box, Flex, Textarea } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import NoteMessage from '../NoteMessage'

// Lazy load components
const StarRating = lazy(() => import('./StarRating'))

const RatingFeedbackNoteMessage = ({
  messageId,
  title,
  onClose,
  duration,
  width = '320px',
}) => {
  const { t } = useTranslation('RatingFeedbackNoteMessage')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  const customContent = useMemo(
    () => (
      <Flex direction="column" align="center" w="100%" position="relative">
        <VStack spacing={4} align="center" w="100%">
          <Text fontSize="lg" fontWeight="bold" color="purple.300">
            {t('rateYourExperience')}
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
      actions={[{ actionType: 'SUBMIT_FEEDBACK' }]} // Added translation
      feedbackContent={{
        rating,
        feedback,
      }}
    />
  )
}

export default RatingFeedbackNoteMessage
