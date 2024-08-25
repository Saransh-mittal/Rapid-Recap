import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import NoteMessage from './NoteMessage'

import NoteMessageSummary from './NoteMessageSummary'
import {
  clearNoteMessageQueue,
  setShowingSummaryForNoteMessages,
} from '../../redux/appSlice'
import { v4 as uuidv4 } from 'uuid'
import XPAwardNoteMessage from './noteMessages/XPAwardNoteMessage'

const NoteMessageQueue = () => {
  const dispatch = useDispatch()
  const noteMessageQueue = useSelector(state => state.app.noteMessageQueue)
  const showingSummaryForNoteMessages = useSelector(
    state => state.app.showingSummaryForNoteMessages,
  )

  if (noteMessageQueue.length === 0) {
    return null
  }

  if (noteMessageQueue.length > 1 && !showingSummaryForNoteMessages) {
    const actions = [
      {
        text: 'View All',
        actionType: 'VIEW_ALL',
        colorScheme: 'blue',
      },
    ]
    return (
      <NoteMessage
        messageId={uuidv4()}
        title={`You have ${noteMessageQueue.length} new messages.`}
        actions={actions}
        onClose={() => {
          dispatch(clearNoteMessageQueue())
        }}
        duration={null}
      />
    )
  }

  if (showingSummaryForNoteMessages) {
    return (
      <NoteMessageSummary
        key="summary-note-message"
        messages={noteMessageQueue}
        onClose={() => {
          dispatch(setShowingSummaryForNoteMessages(false))
          dispatch(clearNoteMessageQueue())
        }}
      />
    )
  }

  const message = noteMessageQueue[0]

  switch (message.messageType) {
    case 'xpAward':
      return (
        <XPAwardNoteMessage
          messageId={message.id}
          xpAwarded={message.xpAwarded}
          quizName={message.quizName}
          duration={message.duration}
          width={message.width}
        />
      )
    default:
      return (
        <NoteMessage
          messageId={message.id}
          title={message.title}
          content={message.content}
          duration={message.duration}
          width={message.width}
          actions={message.actions}
        />
      )
  }
}

export default NoteMessageQueue
