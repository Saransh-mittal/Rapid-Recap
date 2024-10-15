import { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  removeNoteMessageWithId,
  setIsNotifDrawerOpen,
  setSelectedNotificationId,
  setShowingSummaryForNoteMessages,
  setShowXpLevelModal,
  setWeakMode,
} from '../redux/appSlice'
import { createHandleMessageAction } from '../utils/messageActionHandlers'
import {
  handleSubmitFeedback,
  handleQuizFeedback,
  handleTournamentFeedback,
} from '../utils/helper.utils'
import {
  setFeedback,
  setQuizFeedback,
  setQuizRating,
  setRating,
  setTournamentQuizFeedback,
  setTournamentQuizRating,
} from '../redux/noteMessageSummarySlice'

export const useNoteMessageSummary = (messages, closeDisclosure, onClose) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [showConfetti, setShowConfetti] = useState(false)

  const [storyId, setStoryId] = useState(null)
  const [quizId, setQuizId] = useState(null)

  const [tournamentId, setTournamentId] = useState(null)
  const {
    rating,
    quizRating,
    tournamentQuizRating,
    feedback,
    quizFeedback,
    tournamentQuizFeedback,
  } = useSelector(state => state.noteMessageSummary)

  const handleMessageAction = useCallback(
    createHandleMessageAction(dispatch, {
      setShowingSummaryForNoteMessages,
      removeNoteMessageWithId,
      setShowXpLevelModal,
      setSelectedNotificationId,
      setIsNotifDrawerOpen,
      navigateToProfile: id => navigate(`/profile/${id}`),
      navigateToTournament: () => navigate(`/tournament`),
      handleSubmitFeedback: () =>
        handleSubmitFeedback(rating, feedback, storyId),
      handleQuizFeedback: () =>
        handleQuizFeedback(quizRating, quizFeedback, quizId),
      handleTournamentFeedback: () =>
        handleTournamentFeedback(
          tournamentQuizRating,
          tournamentQuizFeedback,
          tournamentId,
        ),
    }),
    [
      dispatch,
      navigate,
      rating,
      feedback,
      storyId,
      quizRating,
      quizFeedback,
      quizId,
      tournamentQuizRating,
      tournamentQuizFeedback,
      tournamentId,
    ],
  )

  const handleDismiss = useCallback(
    id => {
      handleMessageAction('DISMISS', id)
    },
    [handleMessageAction],
  )

  const handleAction = useCallback(
    (actionType, messageId, payload) => {
      if (actionType === 'SWITCH_TO_WEAK_MODE') {
        dispatch(setWeakMode(true))
        handleMessageAction('DISMISS', messageId, user?.inGameName, payload)
      } else if (actionType === 'STAY_IN_NORMAL_MODE') {
        dispatch(setWeakMode(false))
        handleMessageAction('DISMISS', messageId, user?.inGameName, payload)
      } else {
        handleMessageAction(actionType, messageId, user?.inGameName, payload)
      }
    },
    [handleMessageAction, user?.inGameName],
  )

  const handleClose = useCallback(() => {
    closeDisclosure()
    setTimeout(onClose, 500)
  }, [closeDisclosure, onClose])

  useEffect(() => {
    const hasMilestone = messages?.some(
      message =>
        (message.messageType === 'xpAward' &&
          (message.isMilestone || message.milestoneName)) ||
        (message.messageType === 'streak' &&
          message.streakStatus === 'revived'),
    )
    if (hasMilestone) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
    const feedbackMessage = messages?.find(
      message => message.messageType === 'storyFeedback',
    )
    if (feedbackMessage) {
      setStoryId(feedbackMessage.storyId)
    }
    const quizFeedbackMessage = messages?.find(
      message => message.messageType === 'quizFeedback',
    )
    if (quizFeedbackMessage) {
      setQuizId(quizFeedbackMessage.quizId)
    }
    const tournamentQuizFeedbackMessage = messages?.find(
      message => message.messageType === 'tournamentQuizFeedback',
    )
    if (tournamentQuizFeedbackMessage) {
      setTournamentId(tournamentQuizFeedbackMessage.tournamentId)
    }
  }, [messages])

  return {
    showConfetti,
    handleClose,
    handleDismiss,
    handleAction,
    rating,
    setRating: val => dispatch(setRating(val)),
    quizRating,
    setQuizRating: val => dispatch(setQuizRating(val)),
    feedback,
    setFeedback: val => dispatch(setFeedback(val)),
    quizFeedback,
    setQuizFeedback: val => dispatch(setQuizFeedback(val)),
    tournamentQuizRating,
    setTournamentQuizRating: val => dispatch(setTournamentQuizRating(val)),
    tournamentQuizFeedback,
    setTournamentQuizFeedback: val => dispatch(setTournamentQuizFeedback(val)),
  }
}
