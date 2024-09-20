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
  VIEW_TOURNAMENT: actions => {
    actions.navigateToTournament()
  },
  REGISTER_TOURNAMENT: actions => {
    actions.navigateToTournament()
  },
  SIGN_IN: () => {},
  GUEST: () => {},
  VIEW_EXPERIENCE: setShowXpLevelModal => {
    setShowXpLevelModal(true)
  },
  INBOX: setIsNotifDrawerOpen => {
    setIsNotifDrawerOpen(true)
  },
  // Add more action handlers as needed
}

export const createHandleMessageAction = (dispatch, actions) => {
  return (actionType, messageId, profileId) => {
    if (messageActionHandlers[actionType]) {
      if (actionType === 'VIEW_ALL') {
        messageActionHandlers[actionType](() =>
          dispatch(actions.setShowingSummaryForNoteMessages(true)),
        )
      } else if (
        actionType === 'REGISTER_TOURNAMENT' ||
        actionType === 'VIEW_TOURNAMENT'
      ) {
        messageActionHandlers['VIEW_TOURNAMENT'](actions)
      } else if (actionType === 'VIEW_PROFILE') {
        messageActionHandlers[actionType](actions, profileId)
      } else if (actionType === 'DISMISS') {
        messageActionHandlers[actionType](dispatch, actions, messageId)
      } else if (actionType === 'VIEW_EXPERIENCE') {
        messageActionHandlers[actionType](() =>
          dispatch(actions.setShowXpLevelModal(true)),
        )
      } else if (actionType === 'INBOX') {
        messageActionHandlers[actionType](() =>
          dispatch(actions.setIsNotifDrawerOpen(true)),
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
