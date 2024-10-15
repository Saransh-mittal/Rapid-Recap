import React, { lazy } from 'react'
import { useTranslation } from 'react-i18next'

const UnifiedFeedbackNoteMessage = lazy(() =>
  import('../UnifiedFeedbackNoteMessage'),
)

const TournamentQuizFeedbackNoteMessage = props => {
  const { t } = useTranslation('UnifiedFeedbackNoteMessage')
  return (
    <UnifiedFeedbackNoteMessage
      {...props}
      feedbackType="tournamentQuiz"
      feedbackId={props.tournamentId}
      feedbackTitle={t('TournamentQuizBodyTitle')}
      t={t}
    />
  )
}

export default TournamentQuizFeedbackNoteMessage
