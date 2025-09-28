// src/components/WiseWeb/components/chat/ConversationList.jsx - Fixed with proper height management
import React, { useEffect, useMemo, useCallback } from 'react'
import { MessageCircle, Check, CheckCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { fetchConversations } from '../../../../redux/friendsChatSlice'
import { QUICK_CLASH_CLASSES } from '../../../quickClashComponents/utils/quickClashColors'

// Optimized conversation item
const ConversationItem = React.memo(({ conversation, onClick, isActive }) => {
  const { t } = useTranslation('WiseWeb')

  const formatTime = useMemo(() => {
    const timestamp = conversation.lastMessageAt
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)

    if (diffMs < 60000) return t('now')
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    if (diffWeeks < 4) return `${diffWeeks}w`

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }, [conversation.lastMessageAt, t])

  const lastMessagePreview = useMemo(() => {
    const lastMessage = conversation.lastMessage
    if (!lastMessage) return t('No messages yet')

    const content = lastMessage.content
    if (content.length > 35) {
      return content.substring(0, 32) + '...'
    }
    return content
  }, [conversation.lastMessage, t])

  const handleClick = useCallback(() => {
    onClick(conversation)
  }, [onClick, conversation])

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-3 rounded-xl cursor-pointer transition-all duration-200 group
        ${
          isActive
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40'
            : 'hover:bg-slate-700/30 border border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <img
            src={conversation.participant.pic}
            alt={conversation.participant.name}
            className="w-12 h-12 rounded-xl object-cover"
            onError={e => {
              e.target.src =
                'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
            }}
          />
          {conversation.participant.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-800 rounded-full" />
          )}
        </div>

        {/* Conversation info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`
              font-semibold truncate
              ${isActive ? 'text-cyan-200' : 'text-white'}
            `}
            >
              {conversation.participant.name}
            </h3>

            <div className="flex items-center gap-2">
              {formatTime && (
                <span
                  className={`
                  text-xs
                  ${isActive ? 'text-cyan-300' : 'text-slate-400'}
                `}
                >
                  {formatTime}
                </span>
              )}

              {conversation.unreadCount > 0 && (
                <div className="min-w-[18px] h-[18px] bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {conversation.unreadCount > 99
                    ? '99+'
                    : conversation.unreadCount}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`
              text-sm truncate flex-1 mr-2
              ${isActive ? 'text-cyan-100' : 'text-slate-300'}
            `}
            >
              {lastMessagePreview}
            </p>

            {/* Message status for last message if sent by user */}
            {conversation.lastMessage?.sender._id ===
              conversation.currentUserId && (
              <div className="flex-shrink-0">
                {conversation.lastMessage.status === 'read' ? (
                  <CheckCheck className="w-3 h-3 text-cyan-400" />
                ) : conversation.lastMessage.status === 'delivered' ? (
                  <CheckCheck className="w-3 h-3 text-slate-400" />
                ) : (
                  <Check className="w-3 h-3 text-slate-400" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

// Loading skeleton for conversations
const ConversationSkeleton = React.memo(() => (
  <div className="p-3 rounded-xl bg-slate-800/30 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
      <div className="flex-1">
        <div className="h-4 bg-slate-700/50 rounded mb-2 w-3/4" />
        <div className="h-3 bg-slate-700/50 rounded w-1/2" />
      </div>
    </div>
  </div>
))

// Empty state component
const EmptyConversations = React.memo(() => {
  const { t } = useTranslation('WiseWeb')

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full min-h-[200px]">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
        <MessageCircle className="w-8 h-8 text-cyan-300" />
      </div>
      <h3 className="text-lg font-bold text-cyan-200 mb-2">
        {t('No Chats Yet')}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
        {t('Start a conversation with your friends to see it here')}
      </p>
    </div>
  )
})

// Error state component
const ConversationError = React.memo(({ error, onRetry }) => {
  const { t } = useTranslation('WiseWeb')

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full min-h-[200px]">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-red-500/20 border border-red-400/30">
        <MessageCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-red-400 mb-2">
        {t('Failed to Load')}
      </h3>
      <p className="text-slate-400 text-sm mb-4 max-w-xs">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
      >
        {t('Try Again')}
      </button>
    </div>
  )
})

// Main conversation list component with proper height management
const ConversationList = ({ onConversationSelect, activeConversationId }) => {
  const { t } = useTranslation('WiseWeb')
  const dispatch = useDispatch()

  const { conversations, loading, error } = useSelector(
    state => state.friendsChat,
  )
  const { user } = useSelector(state => state.auth)

  // Fetch conversations on mount
  useEffect(() => {
    if (conversations.length === 0) {
      dispatch(fetchConversations())
    }
  }, [conversations.length])

  // Sort conversations by last message time
  const sortedConversations = useMemo(() => {
    return [...conversations]
      .map(conv => ({
        ...conv,
        currentUserId: user?._id,
      }))
      .sort((a, b) => {
        const aTime = new Date(a.lastMessageAt || 0)
        const bTime = new Date(b.lastMessageAt || 0)
        return bTime - aTime
      })
  }, [conversations, user?._id])

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    conversation => {
      onConversationSelect(conversation)
    },
    [onConversationSelect],
  )

  // Handle retry
  const handleRetry = useCallback(() => {
    dispatch(fetchConversations())
  }, [dispatch])

  // Render loading state
  if (loading.conversations && conversations.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-3 p-1">
          {Array.from({ length: 4 }, (_, i) => (
            <ConversationSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Render error state
  if (error.conversations) {
    return (
      <ConversationError error={error.conversations} onRetry={handleRetry} />
    )
  }

  // Render empty state
  if (sortedConversations.length === 0) {
    return <EmptyConversations />
  }

  // Render conversation list with proper scrolling
  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        scrollBehavior: 'smooth',
        overscrollBehavior: 'contain',
      }}
    >
      <div className="space-y-2 p-1">
        {sortedConversations.map(conversation => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            onClick={handleConversationSelect}
            isActive={activeConversationId === conversation._id}
          />
        ))}
      </div>
    </div>
  )
}

ConversationItem.displayName = 'ConversationItem'
ConversationSkeleton.displayName = 'ConversationSkeleton'
ConversationError.displayName = 'ConversationError'
EmptyConversations.displayName = 'EmptyConversations'
ConversationList.displayName = 'ConversationList'

export default ConversationList
