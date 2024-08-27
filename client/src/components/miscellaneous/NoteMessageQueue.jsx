import React, { useMemo, useCallback, lazy, Suspense } from 'react'
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

const NoteMessageQueue = () => {
  const dispatch = useDispatch()
  const noteMessageQueue = useSelector(state => state.app.noteMessageQueue)
  const showingSummaryForNoteMessages = useSelector(
    state => state.app.showingSummaryForNoteMessages,
  )

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
          title={`You have ${noteMessageQueue.length} new messages.`}
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
            width={message.width}
            isMilestone={message.isMilestone}
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
