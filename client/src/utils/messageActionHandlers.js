// utils/messageActionHandlers.js

const messageActionHandlers = {
  CONFIRM: () => {
    console.log('Confirmed special action')
    // Add any specific logic here
  },
  CANCEL: () => {
    console.log('Cancelled special action')
    // Add any specific logic here
  },
  VIEW_ALL: setShowingSummaryForNoteMessages => {
    setShowingSummaryForNoteMessages(true)
  },
  DISMISS: (dispatch, actions, messageId) => {
    dispatch(actions.removeNoteMessageWithId(messageId))
  },
  VIEW_PROFILE: (actions, profileId) => {
    actions.navigateToProfile(profileId)
  },
  VIEW_TOURNAMENT: (dispatch, actions, messageId) => {
    actions.navigateToTournament()
    dispatch &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  REGISTER_TOURNAMENT: (dispatch, actions, messageId) => {
    actions.navigateToTournament()
    dispatch &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  SUBMIT_STORY_FEEDBACK: (dispatch, actions, messageId) => {
    actions.handleSubmitFeedback()
    dispatch &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  SUBMIT_QUIZ_FEEDBACK: (dispatch, actions, messageId) => {
    actions.handleQuizFeedback()
    dispatch &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  SUBMIT_TOURNAMENT_FEEDBACK: (dispatch, actions, messageId) => {
    actions.handleTournamentFeedback()
    dispatch &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  SIGN_IN: () => {},
  GUEST: () => {},
  VIEW_EXPERIENCE: setShowXpLevelModal => {
    setShowXpLevelModal(true)
  },
  INBOX: (setSelectedNotificationId, payload, actions, messageId, dispatch) => {
    if (payload && payload.weeklyReportId) {
      setSelectedNotificationId(payload.weeklyReportId)
    }
    dispatch &&
      actions &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  VIEW_REPORT: () => {},
  // Quick Clash specific actions
  NAVIGATE: (navigate, path, dispatch, actions, messageId) => {
    if (path) {
      navigate(path)
    }
    dispatch &&
      actions &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  PLAY_CHALLENGE: (navigate, challengeId, dispatch, actions, messageId) => {
    navigate(`/quickclash/session/${challengeId}`)
    dispatch &&
      actions &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
  VIEW_ANALYSIS: (navigate, challengeId, dispatch, actions, messageId) => {
    navigate(`/quickclash`)
    dispatch &&
      actions &&
      messageId &&
      dispatch(actions.removeNoteMessageWithId(messageId))
  },
}

export const createHandleMessageAction = (dispatch, actions) => {
  return (actionType, messageId, profileId, payload) => {
    const { navigate } = actions

    if (messageActionHandlers[actionType]) {
      if (actionType === 'VIEW_ALL') {
        messageActionHandlers[actionType](() =>
          dispatch(actions.setShowingSummaryForNoteMessages(true)),
        )
      } else if (
        actionType === 'REGISTER_TOURNAMENT' ||
        actionType === 'VIEW_TOURNAMENT'
      ) {
        messageActionHandlers['VIEW_TOURNAMENT'](dispatch, actions, messageId)
      } else if (actionType === 'VIEW_PROFILE') {
        messageActionHandlers[actionType](actions, profileId)
      } else if (actionType === 'SUBMIT_STORY_FEEDBACK') {
        messageActionHandlers[actionType](dispatch, actions, messageId)
      } else if (actionType === 'SUBMIT_QUIZ_FEEDBACK') {
        messageActionHandlers[actionType](dispatch, actions, messageId)
      } else if (actionType === 'SUBMIT_TOURNAMENT_FEEDBACK') {
        messageActionHandlers[actionType](dispatch, actions, messageId)
      } else if (actionType === 'DISMISS') {
        messageActionHandlers[actionType](dispatch, actions, messageId)
      } else if (actionType === 'VIEW_EXPERIENCE') {
        messageActionHandlers[actionType](() =>
          dispatch(actions.setShowXpLevelModal(true)),
        )
      } else if (actionType === 'INBOX') {
        messageActionHandlers[actionType](
          id => dispatch(actions.setSelectedNotificationId(id)),
          payload,
          actions,
          messageId,
          dispatch,
        )
      } else if (actionType === 'NAVIGATE' && payload && payload.path) {
        messageActionHandlers[actionType](
          navigate,
          payload.path,
          dispatch,
          actions,
          messageId,
        )
      } else if (
        actionType === 'PLAY_CHALLENGE' &&
        payload &&
        payload.challengeId
      ) {
        messageActionHandlers[actionType](
          navigate,
          payload.challengeId,
          dispatch,
          actions,
          messageId,
        )
      } else if (
        actionType === 'VIEW_ANALYSIS' &&
        payload &&
        payload.challengeId
      ) {
        messageActionHandlers[actionType](
          navigate,
          payload.challengeId,
          dispatch,
          actions,
          messageId,
        )
      } else {
        messageActionHandlers[actionType]()
      }
    } else {
      console.log('Unknown action type:', actionType)
    }
  }
}

// You can also export individual handlers if needed
export const { CONFIRM, CANCEL, VIEW_ALL, DISMISS, NAVIGATE } =
  messageActionHandlers
