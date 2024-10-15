import React from 'react'
import { Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import XpAwardContent from './XpAwardContent'
import StreakContent from './StreakContent'
import FeedbackContent from './FeedbackContent'
import TournamentContent from './TournamentContent'

const MessageContent = ({ message }) => {
  const { t } = useTranslation('NoteMessageSummary')

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
    default:
      return (
        <>
          <Text fontWeight="bold">{message.title}</Text>
          <Text>{message.content}</Text>
        </>
      )
  }
}

export default MessageContent
