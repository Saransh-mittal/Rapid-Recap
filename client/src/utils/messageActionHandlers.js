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
  // Add more action handlers as needed
}

export const createHandleMessageAction = (dispatch, actions) => {
  return (actionType, messageId) => {
    if (messageActionHandlers[actionType]) {
      if (actionType === 'VIEW_ALL') {
        messageActionHandlers[actionType](() =>
          dispatch(actions.setShowingSummaryForNoteMessages(true)),
        )
      } else if (actionType === 'DISMISS') {
        messageActionHandlers[actionType](dispatch, actions, messageId)
      } else {
        messageActionHandlers[actionType]()
      }
    } else {
      console.log('Unknown action type:', actionType)
    }

    // Automatically dismiss the message after handling any action except VIEW_ALL and DISMISS
    if (actionType !== 'VIEW_ALL' && actionType !== 'DISMISS' && messageId) {
      dispatch(actions.removeNoteMessageWithId(messageId))
    }
  }
}

// You can also export individual handlers if needed
export const { CONFIRM, CANCEL, VIEW_ALL, DISMISS } = messageActionHandlers
