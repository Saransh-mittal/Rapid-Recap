import React, { useMemo, useCallback, lazy, Suspense, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  clearNoteMessageQueue,
  setShowingSummaryForNoteMessages,
} from '../../redux/appSlice'
import { v4 as uuidv4 } from 'uuid'

// Lazy load components
const NoteMessage = lazy(() => import('./NoteMessage'))
const NoteMessageSummary = lazy(() => import('./NoteMessageSummary'))
const XPAwardNoteMessage = lazy(() =>
  import('./noteMessages/XPAwardNoteMessage'),
)
const StreakNoteMessage = lazy(() => import('./noteMessages/StreakNoteMessage'))
const StoryFeedbackNoteMessage = lazy(() =>
  import('./noteMessages/feedbackNoteMessages/StoryFeedbackNoteMessage'),
)
const QuizFeedbackNoteMessage = lazy(() =>
  import('./noteMessages/feedbackNoteMessages/QuizFeedbackNoteMessage'),
)
import { SOUND_TYPES } from '../../models/soundSettings'
import useSound from '../../customHooks/useSound'
import { useTranslation } from 'react-i18next'
import TournamentNoteMessage from './noteMessages/TournamentNoteMessage'
const NoteMessageQueue = () => {
  const dispatch = useDispatch()
  const noteMessageQueue = useSelector(state => state.app.noteMessageQueue)
  const showingSummaryForNoteMessages = useSelector(
    state => state.app.showingSummaryForNoteMessages,
  )
  const { playNoteMessageSound, playMilestoneSound } = useSound()
  const { t } = useTranslation('NoteMessageQueue')

  // Memoize actions array to avoid recreating on each render
  const actions = useMemo(
    () => [
      {
        text: 'View All',
        actionType: 'VIEW_ALL',
        colorScheme: 'blue',
      },
    ],
    [],
  )

  useEffect(() => {
    if (noteMessageQueue.length > 0) {
      const latestMessage = noteMessageQueue[noteMessageQueue.length - 1]
      switch (latestMessage.messageType) {
        case 'xpAward':
          latestMessage.isMilestone
            ? playMilestoneSound()
            : playNoteMessageSound()
          break
        case 'streak':
          latestMessage.isMilestone
            ? playMilestoneSound()
            : playNoteMessageSound()
          break
        default:
          playNoteMessageSound()
      }
    }
  }, [noteMessageQueue])
  // Memoize onClose handler to avoid unnecessary re-renders
  const handleClose = useCallback(() => {
    dispatch(clearNoteMessageQueue())
  }, [dispatch])

  const handleSummaryClose = useCallback(() => {
    dispatch(setShowingSummaryForNoteMessages(false))
    dispatch(clearNoteMessageQueue())
  }, [dispatch])

  if (noteMessageQueue.length === 0) {
    return null
  }

  if (noteMessageQueue.length > 1 && !showingSummaryForNoteMessages) {
    return (
      <Suspense fallback={null}>
        <NoteMessage
          messageId={uuidv4()}
          title={t('newMessages', { number: noteMessageQueue.length })}
          actions={actions}
          onClose={handleClose}
          duration={null}
        />
      </Suspense>
    )
  }

  if (showingSummaryForNoteMessages) {
    return (
      <Suspense fallback={null}>
        <NoteMessageSummary
          key="summary-note-message"
          messages={noteMessageQueue}
          onClose={handleSummaryClose}
        />
      </Suspense>
    )
  }

  const message = noteMessageQueue[0]

  switch (message.messageType) {
    case 'xpAward':
      return (
        <Suspense fallback={null}>
          <XPAwardNoteMessage
            messageId={message.id}
            xpAwarded={message.xpAwarded}
            title={message.title}
            duration={message.duration}
            xpSource={message.xpSource}
            milestoneName={message.milestoneName}
            isMilestone={message.isMilestone}
            milestoneContent={message.milestoneContent}
          />
        </Suspense>
      )
    case 'streak':
      return (
        <Suspense fallback={null}>
          <StreakNoteMessage
            messageId={message.id}
            streakStatus={message.streakStatus}
            streakCount={message.streakCount}
            remainingTime={message.remainingTime}
            remainingQuizzes={message.remainingQuizzes}
            title={message.title}
            duration={message.duration}
            width={message.width}
          />
        </Suspense>
      )
    case 'tournament':
      return (
        <Suspense fallback={null}>
          <TournamentNoteMessage
            messageId={message.id}
            tournamentStatus={message.tournamentStatus}
            tournamentName={message.tournamentName}
            registrationEndTime={message.tournamentEndTime}
            userStreak={message.userStreak}
            requiredStreak={message.requiredStreak}
            title={message.title}
            duration={message.duration}
            width={message.width}
            onClose={handleClose}
            leaderboard={message.leaderboard}
          />
        </Suspense>
      )
    case 'storyFeedback':
      return (
        <Suspense fallback={null}>
          <StoryFeedbackNoteMessage
            messageId={message.id}
            title={message.title}
            duration={message.duration}
            width={message.width}
            onClose={handleClose}
            storyId={message.storyId}
          />
        </Suspense>
      )
    case 'quizFeedback':
      return (
        <Suspense fallback={null}>
          <QuizFeedbackNoteMessage
            messageId={message.id}
            title={message.title}
            duration={message.duration}
            width={message.width}
            onClose={handleClose}
            quizId={message.quizId}
          />
        </Suspense>
      )
    default:
      return (
        <Suspense fallback={null}>
          <NoteMessage
            messageId={message.id}
            title={message.title}
            content={message.content}
            duration={message.duration}
            width={message.width}
            actions={message.actions}
          />
        </Suspense>
      )
  }
}

export default NoteMessageQueue
