import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import NoteMessage from './NoteMessage'
import NoteMessageSummary from './NoteMessageSummary'
import {
  clearNoteMessageQueue,
  setShowingSummaryForNoteMessages,
} from '../../redux/appSlice'
import { v4 as uuidv4 } from 'uuid'

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

  return (
    <NoteMessage
      messageId={noteMessageQueue[0].id}
      title={noteMessageQueue[0].title}
      content={noteMessageQueue[0].content}
      duration={noteMessageQueue[0].duration}
      width={noteMessageQueue[0].width}
      actions={noteMessageQueue[0].actions}
    />
  )
}

export default NoteMessageQueue
