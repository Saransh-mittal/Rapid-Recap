import React, { lazy } from 'react'
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
      feedbackTitle={t('StoryBodyTitle')}
      t={t}
    />
  )
}

export default StoryFeedbackNoteMessage
