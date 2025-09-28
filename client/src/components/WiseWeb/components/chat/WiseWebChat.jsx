// src/components/WiseWeb/components/chat/WiseWebChat.jsx - Removed minimize functionality
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, ArrowLeft, Plus, X, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import {
  setActiveConversation,
  clearActiveConversation,
  getOrCreateConversation,
  fetchConversations,
} from '../../../../redux/friendsChatSlice'
import { QUICK_CLASH_CLASSES } from '../../../quickClashComponents/utils/quickClashColors'
import ChatWindow from './ChatWindow'
import ConversationList from './ConversationList'

// Scroll lock utility
const useScrollLock = isLocked => {
  useEffect(() => {
    if (isLocked) {
      // Store original styles
      const originalStyle = window.getComputedStyle(document.body).overflow
      const originalPaddingRight = document.body.style.paddingRight

      // Calculate scrollbar width
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth

      // Apply scroll lock
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollBarWidth}px`

      return () => {
        // Restore original styles
        document.body.style.overflow = originalStyle
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isLocked])
}

// Optimized friend selector component
const FriendSelector = React.memo(({ friends, onSelectFriend, onClose }) => {
  const { t } = useTranslation('WiseWeb')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends
    const query = searchQuery.toLowerCase()
    return friends.filter(
      friend =>
        friend.name.toLowerCase().includes(query) ||
        friend.inGameName.toLowerCase().includes(query),
    )
  }, [friends, searchQuery])

  return (
    <div
      className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`
          w-full max-w-sm max-h-[400px] ${QUICK_CLASH_CLASSES.modalContainer}
          rounded-xl overflow-hidden flex flex-col
        `}
        style={{
          background:
            'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(6, 182, 212, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 flex-shrink-0">
          <h3 className="text-lg font-bold text-cyan-200">
            {t('Start New Chat')}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        {friends.length > 5 && (
          <div className="p-4 border-b border-slate-700/30 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('Search friends...')}
                className={`
                  w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-slate-400
                  bg-slate-800/60 border border-slate-600/30
                  focus:border-cyan-500/50 focus:outline-none transition-colors
                `}
              />
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredFriends.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {searchQuery
                  ? t('No friends found')
                  : t('No friends available')}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredFriends.map(friend => (
                <button
                  key={friend._id}
                  onClick={() => onSelectFriend(friend._id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-slate-700/30 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={friend.pic}
                      alt={friend.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={e => {
                        e.target.src =
                          'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
                      }}
                    />
                    {friend.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {friend.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      @{friend.inGameName}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    {friend.isOnline ? t('Online') : t('Offline')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

// Main chat component without minimize functionality
const WiseWebChat = ({
  isOpen,
  onClose,
  initialFriendId = null,
  friends = [],
}) => {
  const { t } = useTranslation('WiseWeb')
  const dispatch = useDispatch()

  const [showFriendSelector, setShowFriendSelector] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { conversations, activeConversationId, loading } = useSelector(
    state => state.friendsChat,
  )

  // Apply scroll lock when any modal is open
  useScrollLock(isOpen || showFriendSelector)

  // Find active conversation
  const activeConversation = useMemo(() => {
    return conversations.find(conv => conv._id === activeConversationId)
  }, [conversations, activeConversationId])

  // Get available friends for new chat
  const availableFriends = useMemo(() => {
    const conversationParticipantIds = new Set(
      conversations.map(conv => conv.participant._id),
    )
    return friends.filter(friend => !conversationParticipantIds.has(friend._id))
  }, [friends, conversations])

  // Handle initial friend (deep linking)
  useEffect(() => {
    if (initialFriendId && isOpen && !isLoading) {
      handleStartChatWithFriend(initialFriendId)
    }
  }, [initialFriendId, isOpen])

  // Fetch conversations when opening
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchConversations())
    }
  }, [isOpen, dispatch])

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    conversation => {
      dispatch(setActiveConversation(conversation._id))
    },
    [dispatch],
  )

  // Handle back to conversation list
  const handleBackToList = useCallback(() => {
    dispatch(clearActiveConversation())
  }, [dispatch])

  // Start chat with specific friend
  const handleStartChatWithFriend = useCallback(
    async friendId => {
      setIsLoading(true)
      try {
        const result = await dispatch(
          getOrCreateConversation({ friendId }),
        ).unwrap()
        dispatch(setActiveConversation(result.conversation._id))
        setShowFriendSelector(false)
      } catch (error) {
        console.error('Failed to start chat:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch],
  )

  // Handle close
  const handleClose = useCallback(() => {
    dispatch(clearActiveConversation())
    setShowFriendSelector(false)
    onClose()
  }, [dispatch, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    e => {
      if (e.target === e.currentTarget) {
        handleClose()
      }
    },
    [handleClose],
  )

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`
          w-full max-w-lg rounded-xl overflow-hidden flex flex-col
          ${QUICK_CLASH_CLASSES.modalContainer} shadow-2xl
          h-[500px] max-h-[80vh]
        `}
        style={{
          background:
            'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
          border: '1px solid rgba(6, 182, 212, 0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {activeConversationId && (
              <button
                onClick={handleBackToList}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-cyan-400" />
              </button>
            )}

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/30">
                <MessageCircle className="w-4 h-4 text-cyan-300" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-cyan-200 truncate">
                  {activeConversation
                    ? activeConversation.participant.name
                    : t('Chats')}
                </h2>
                {activeConversation && (
                  <p className="text-xs text-slate-400">
                    {activeConversation.participant.isOnline
                      ? t('Online')
                      : t('Offline')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!activeConversationId && availableFriends.length > 0 && (
              <button
                onClick={() => setShowFriendSelector(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                title={t('Start New Chat')}
              >
                <Plus className="w-4 h-4 text-cyan-400" />
              </button>
            )}

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeConversationId && activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              onBack={handleBackToList}
            />
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <ConversationList
                  onConversationSelect={handleConversationSelect}
                  activeConversationId={activeConversationId}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Friend Selector Modal */}
      {showFriendSelector && (
        <FriendSelector
          friends={availableFriends}
          onSelectFriend={handleStartChatWithFriend}
          onClose={() => setShowFriendSelector(false)}
        />
      )}
    </div>
  )

  return createPortal(modalContent, document.body)
}

FriendSelector.displayName = 'FriendSelector'
WiseWebChat.displayName = 'WiseWebChat'

export default WiseWebChat
