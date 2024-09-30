// src/utils/messageActionHandlers.js

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
  SIGN_IN: () => {},
  GUEST: () => {},
  VIEW_EXPERIENCE: setShowXpLevelModal => {
    setShowXpLevelModal(true)
  },
  INBOX: (setSelectedNotificationId, payload) => {
    console.log(payload)
    if (payload && payload.weeklyReportId) {
      setSelectedNotificationId(payload.weeklyReportId)
    }
  },
  VIEW_REPORT: () => {},

  // Add more action handlers as needed
}

export const createHandleMessageAction = (dispatch, actions) => {
  return (actionType, messageId, profileId, payload) => {
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
export const { CONFIRM, CANCEL, VIEW_ALL, DISMISS } = messageActionHandlers
