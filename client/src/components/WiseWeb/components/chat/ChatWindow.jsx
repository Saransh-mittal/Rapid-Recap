// src/components/WiseWeb/components/chat/ChatWindow.jsx - Complete file with fixes and read more
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Send,
  MoreVertical,
  Trash2,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  setDraftMessage,
  clearDraftMessage,
  addOptimisticMessage,
  replaceOptimisticMessage,
  removeOptimisticMessage,
} from '../../../../redux/friendsChatSlice'
import { QUICK_CLASH_CLASSES } from '../../../quickClashComponents/utils/quickClashColors'
import {
  validateMessage,
  MESSAGE_LIMITS,
  getValidationStatus,
  formatValidationErrors,
} from '../../../../utils/messageValidation'

// Simple validation feedback component - only shows when there's actual invalid content
const SimpleValidationFeedback = React.memo(({ validation, messageText }) => {
  const { t } = useTranslation('WiseWeb')

  // Don't show anything if message is empty or valid
  if (!messageText.trim() || !validation || validation.isValid) return null

  const status = getValidationStatus(validation)
  const isError = status === 'error'
  const isWarning = status === 'warning'

  return (
    <div className="flex items-center justify-between text-xs mb-2">
      {/* Error/Warning message */}
      <div className="flex items-center gap-2">
        <AlertCircle
          className={`w-3 h-3 ${isError ? 'text-red-400' : 'text-orange-400'}`}
        />
        <span className={`${isError ? 'text-red-400' : 'text-orange-400'}`}>
          {isError ? t('Message too long') : t('Approaching limit')}
        </span>
      </div>

      {/* Counter */}
      <div
        className={`font-mono flex items-center gap-3 ${
          isError
            ? 'text-red-400'
            : isWarning
            ? 'text-orange-400'
            : 'text-slate-500'
        }`}
      >
        <span>
          {validation.wordCount}/{MESSAGE_LIMITS.MAX_WORDS}
        </span>
        <span className="text-slate-600">•</span>
        <span>
          {validation.charCount}/{MESSAGE_LIMITS.MAX_CHARACTERS}
        </span>
      </div>
    </div>
  )
})

// Message status component
const MessageStatus = React.memo(({ status }) => {
  const statusConfig = {
    sending: { icon: Clock, className: 'text-slate-400 animate-pulse' },
    sent: { icon: Check, className: 'text-slate-300' },
    delivered: { icon: CheckCheck, className: 'text-slate-300' },
    read: { icon: CheckCheck, className: 'text-cyan-300' },
  }

  const config = statusConfig[status]
  if (!config) return null

  const Icon = config.icon
  return <Icon className={`w-3.5 h-3.5 ${config.className}`} />
})

// Message bubble component with read more functionality
const MessageBubble = React.memo(
  ({ message, isOwn, onDelete, showTime = false, isLastInGroup = false }) => {
    const { t } = useTranslation('WiseWeb')
    const [showMenu, setShowMenu] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    // Character limit for showing "read more"
    const CHAR_LIMIT = 300

    const formatTime = useCallback(timestamp => {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    }, [])

    const formatDate = useCallback(
      timestamp => {
        const date = new Date(timestamp)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
          return t('Today')
        } else if (date.toDateString() === yesterday.toDateString()) {
          return t('Yesterday')
        } else {
          return date.toLocaleDateString()
        }
      },
      [t],
    )

    const handleDelete = useCallback(() => {
      onDelete(message._id)
      setShowMenu(false)
    }, [message._id, onDelete])

    const toggleExpanded = useCallback(() => {
      setIsExpanded(!isExpanded)
    }, [isExpanded])

    // Check if message is long enough to need truncation
    const isLongMessage = message.content.length > CHAR_LIMIT
    const displayContent = useMemo(() => {
      if (!isLongMessage || isExpanded) {
        return message.content
      }
      return message.content.substring(0, CHAR_LIMIT) + '...'
    }, [message.content, isLongMessage, isExpanded])

    return (
      <>
        {showTime && (
          <div className="flex justify-center my-6">
            <div className="px-3 py-1.5 bg-slate-800/60 backdrop-blur-sm text-slate-300 text-xs rounded-full border border-slate-700/50">
              {formatDate(message.createdAt)}
            </div>
          </div>
        )}

        <div
          className={`flex items-end gap-1 mb-1 group ${
            isOwn ? 'justify-end' : 'justify-start'
          } ${isLastInGroup ? 'mb-4' : ''}`}
        >
          <div
            className={`
          relative max-w-[85%] min-w-[60px] px-3 py-2 rounded-2xl shadow-sm
          ${
            isOwn
              ? `bg-gradient-to-br from-cyan-500 to-cyan-600 text-white ml-12
               ${isLastInGroup ? 'rounded-br-md' : ''}
               ${message.isOptimistic ? 'opacity-80' : ''}`
              : `bg-slate-800 text-white mr-12 border border-slate-700/30
               ${isLastInGroup ? 'rounded-bl-md' : ''}`
          }
          transition-all duration-200 hover:shadow-lg
        `}
          >
            <div className="text-[15px] leading-[1.4] mb-1 break-words hyphens-auto overflow-wrap-anywhere whitespace-pre-wrap">
              {displayContent}
            </div>

            {/* Read more/less button */}
            {isLongMessage && (
              <button
                onClick={toggleExpanded}
                className={`
                  text-xs font-medium mt-1 mb-1
                  ${
                    isOwn
                      ? 'text-cyan-100 hover:text-white'
                      : 'text-cyan-400 hover:text-cyan-300'
                  }
                  transition-colors underline
                `}
              >
                {isExpanded ? t('Read less') : t('Read more')}
              </button>
            )}

            <div
              className={`
            flex items-center justify-end gap-1 text-xs leading-none
            ${isOwn ? 'text-cyan-100/80' : 'text-slate-400'}
          `}
            >
              <span className="font-medium">
                {formatTime(message.createdAt)}
              </span>
              {isOwn && <MessageStatus status={message.status} />}
            </div>

            {isOwn && !message.isOptimistic && (
              <div className="absolute -top-1 -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-7 h-7 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 flex items-center justify-center hover:bg-slate-700/80 transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-slate-300" />
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute left-0 top-8 w-32 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-xl z-20 overflow-hidden">
                        <button
                          onClick={handleDelete}
                          className="w-full px-3 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t('Delete')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  },
)

// Typing indicator
const TypingIndicator = React.memo(({ conversation }) => {
  const { t } = useTranslation('WiseWeb')

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md border border-slate-700/30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {conversation?.participant.name} {t('is typing')}
          </span>
        </div>
      </div>
    </div>
  )
})

// Main ChatWindow component with fixed input handling and border colors
const ChatWindow = ({ conversation }) => {
  const { t } = useTranslation('WiseWeb')
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)

  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)

  const { user } = useSelector(state => state.auth)
  const { messages, loading, typingUsers, draftMessages } = useSelector(
    state => state.friendsChat,
  )

  const conversationMessages = messages[conversation._id] || []
  const isTyping = (typingUsers[conversation._id] || []).length > 0

  // Simple validation without interfering with input
  const validation = useMemo(() => validateMessage(messageText), [messageText])
  const validationStatus = useMemo(
    () => getValidationStatus(validation),
    [validation],
  )

  // Process messages with grouping logic
  const processedMessages = useMemo(() => {
    const messageMap = new Map()

    conversationMessages.forEach(message => {
      const existing = messageMap.get(message._id)
      if (!existing || !message.isOptimistic) {
        messageMap.set(message._id, message)
      }
    })

    const sortedMessages = Array.from(messageMap.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    )

    const grouped = []
    let lastDate = null

    sortedMessages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString()
      const showTime = messageDate !== lastDate
      const isLastInGroup =
        index === sortedMessages.length - 1 ||
        sortedMessages[index + 1]?.sender._id !== message.sender._id ||
        new Date(sortedMessages[index + 1]?.createdAt) -
          new Date(message.createdAt) >
          300000

      grouped.push({
        ...message,
        showTime,
        isLastInGroup,
      })

      lastDate = messageDate
    })

    return grouped
  }, [conversationMessages])

  // Get border color based on validation - only show error/warning when there's actual content
  const getBorderColor = useCallback(() => {
    if (!messageText.trim() || validationStatus === 'empty') {
      // Empty message - show normal border
      return 'border-slate-600/50 focus:border-cyan-500/50'
    }

    if (validationStatus === 'error') {
      return 'border-red-500/50 focus:border-red-500/70'
    } else if (validationStatus === 'warning') {
      return 'border-orange-500/50 focus:border-orange-500/70'
    } else {
      return 'border-slate-600/50 focus:border-cyan-500/50'
    }
  }, [messageText, validationStatus])

  // Load draft message
  useEffect(() => {
    const draft = draftMessages[conversation._id]
    if (draft) setMessageText(draft)
  }, [conversation._id, draftMessages])

  // Save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messageText.trim()) {
        dispatch(
          setDraftMessage({
            conversationId: conversation._id,
            content: messageText,
          }),
        )
      } else {
        dispatch(clearDraftMessage(conversation._id))
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [messageText, conversation._id, dispatch])

  // Fetch messages
  useEffect(() => {
    if (conversation._id) {
      dispatch(fetchMessages({ conversationId: conversation._id }))
    }
  }, [conversation._id, dispatch])

  // Auto scroll
  const scrollToBottom = useCallback(() => {
    if (autoScroll && messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      })
    }
  }, [autoScroll])

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current
    setAutoScroll(scrollHeight - scrollTop <= clientHeight + 100)
  }, [])

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [processedMessages.length, scrollToBottom])

  // Mark as read
  useEffect(() => {
    if (conversation._id && processedMessages.length > 0) {
      const timer = setTimeout(() => {
        dispatch(markMessagesAsRead({ conversationId: conversation._id }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [conversation._id, processedMessages.length, dispatch])

  // Fixed input handling - don't interfere with natural typing
  const handleInputChange = useCallback(e => {
    const value = e.target.value
    setMessageText(value) // Direct assignment without sanitization during typing
  }, [])

  // Fixed key press handling - only handle Enter key properly
  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Allow shift+enter for new lines - don't prevent default
          return
        } else {
          // Plain enter sends message
          e.preventDefault()
          handleSendMessage()
        }
      }
      // For all other keys (including space), do nothing - let them work naturally
    },
    [
      messageText,
      validation.isValid,
      isSending,
      user,
      conversation._id,
      dispatch,
    ],
  )

  // Send message function
  const handleSendMessage = useCallback(async () => {
    if (!validation.isValid || isSending || !messageText.trim()) {
      return
    }

    const content = messageText.trim()
    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    setIsSending(true)
    setMessageText('')
    dispatch(clearDraftMessage(conversation._id))

    const optimisticMessage = {
      _id: tempId,
      content,
      sender: { _id: user._id, name: user.name, pic: user.pic },
      messageType: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    }

    dispatch(
      addOptimisticMessage({
        conversationId: conversation._id,
        message: optimisticMessage,
      }),
    )

    try {
      const result = await dispatch(
        sendMessage({
          conversationId: conversation._id,
          content,
        }),
      ).unwrap()

      dispatch(
        replaceOptimisticMessage({
          conversationId: conversation._id,
          tempId,
          realMessage: result.message,
        }),
      )
    } catch (error) {
      dispatch(
        removeOptimisticMessage({
          conversationId: conversation._id,
          tempId,
        }),
      )
    } finally {
      setIsSending(false)
    }
  }, [
    validation.isValid,
    isSending,
    messageText,
    user,
    conversation._id,
    dispatch,
  ])

  const handleDeleteMessage = useCallback(
    messageId => {
      dispatch(deleteMessage({ messageId, conversationId: conversation._id }))
    },
    [dispatch, conversation._id],
  )

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(textarea => {
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      adjustTextareaHeight(inputRef.current)
    }
  }, [messageText, adjustTextareaHeight])

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-900/95">
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden py-4 min-h-0 px-4"
        style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}
      >
        {loading.messages && processedMessages.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {processedMessages.map(message => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === user._id}
                onDelete={handleDeleteMessage}
                showTime={message.showTime}
                isLastInGroup={message.isLastInGroup}
              />
            ))}

            {isTyping && <TypingIndicator conversation={conversation} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area with fixed border colors */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm p-4">
        {/* Simple validation feedback - only shows when there's actual invalid content */}
        <SimpleValidationFeedback
          validation={validation}
          messageText={messageText}
        />

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onInput={e => adjustTextareaHeight(e.target)}
              placeholder={t('Message...')}
              disabled={isSending}
              className={`
                w-full px-4 py-3 rounded-2xl resize-none text-white placeholder-slate-400
                bg-slate-800/80 backdrop-blur-sm transition-all duration-200
                min-h-[48px] max-h-[120px] text-[15px] leading-[1.4]
                border focus:outline-none overflow-x-hidden
                ${getBorderColor()}
                ${isSending ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              rows="1"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!validation.isValid || isSending || !messageText.trim()}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
              shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
              ${
                validation.isValid && !isSending && messageText.trim()
                  ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Set display names
MessageStatus.displayName = 'MessageStatus'
MessageBubble.displayName = 'MessageBubble'
TypingIndicator.displayName = 'TypingIndicator'
SimpleValidationFeedback.displayName = 'SimpleValidationFeedback'
ChatWindow.displayName = 'ChatWindow'

export default ChatWindow
