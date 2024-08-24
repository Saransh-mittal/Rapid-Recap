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
  // Add more action handlers as needed
}

export const createHandleMessageAction = (dispatch, actions) => {
  return (actionType, messageId, profileId) => {
    if (messageActionHandlers[actionType]) {
      if (actionType === 'VIEW_ALL') {
        messageActionHandlers[actionType](() =>
          dispatch(actions.setShowingSummaryForNoteMessages(true)),
        )
      } else if (actionType === 'VIEW_PROFILE') {
        messageActionHandlers[actionType](actions, profileId)
      } else if (actionType === 'DISMISS') {
        messageActionHandlers[actionType](dispatch, actions, messageId)
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
