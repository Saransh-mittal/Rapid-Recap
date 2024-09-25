// File: QuizFeedbackNoteMessage.jsx
import React, { lazy } from 'react'
import { useTranslation } from 'react-i18next'

const UnifiedFeedbackNoteMessage = lazy(() =>
  import('../UnifiedFeedbackNoteMessage'),
)

const QuizFeedbackNoteMessage = props => {
  const { t } = useTranslation('UnifiedFeedbackNoteMessage')
  return (
    <UnifiedFeedbackNoteMessage
      {...props}
      feedbackType="quiz"
      feedbackId={props.quizId}
      feedbackTitle={t('QuizBodyTitle')}
      t={t}
    />
  )
}

export default QuizFeedbackNoteMessage
