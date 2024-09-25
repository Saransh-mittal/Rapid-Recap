// File: RatingFeedbackNoteMessage.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'

const UnifiedFeedbackNoteMessage = lazy(() =>
  import('../UnifiedFeedbackNoteMessage'),
)

const StoryFeedbackNoteMessage = props => {
  const { t } = useTranslation('UnifiedFeedbackNoteMessage')
  return (
    <UnifiedFeedbackNoteMessage
      {...props}
      feedbackType="storytheme"
      feedbackId={props.storyId}
      FeedbackTitle="How is story theme feature?"
      t={t}
    />
  )
}

export default StoryFeedbackNoteMessage
