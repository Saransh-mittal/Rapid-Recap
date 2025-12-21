// src/components/WiseWeb/WiseWeb.jsx - Updated with improved chat integration
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from 'react'
import { createPortal } from 'react-dom'
import {
  Users,
  UserPlus,
  Search,
  X,
  WifiOff,
  RefreshCw,
  MessageCircle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useFriends from '../../customHooks/useFriends'
import { QUICK_CLASH_CLASSES } from '../quickClashComponents/utils/quickClashColors'
import './styles/WiseWebChat.css'

// Audio feedback
import { quizAudioService } from '../../services/quizAudioService'

// Lazy loaded components for better performance
const FriendCard = lazy(() => import('./components/FriendCard'))
const FriendRequestCard = lazy(() => import('./components/FriendRequestCard'))
const SearchUserCard = lazy(() => import('./components/SearchUserCard'))
const WiseWebChat = lazy(() => import('./components/chat/WiseWebChat'))

// Simplified loading components
const LoadingSpinner = () => (
  <div className="flex justify-center py-4">
    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
  </div>
)

const SkeletonCard = () => (
  <div className="bg-slate-800/30 rounded-xl p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
      <div className="flex-1">
        <div className="h-4 bg-slate-700/50 rounded mb-2" />
        <div className="h-3 bg-slate-700/50 rounded w-3/4" />
      </div>
    </div>
  </div>
)

// Optimized tab button
const TabButton = React.memo(
  ({ isActive, onClick, icon: Icon, children, badge = 0 }) => (
    <button
      onClick={() => { quizAudioService.playButtonClick(); onClick() }}
      className={`
      relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium
      transition-all duration-200 flex-1
      ${
        isActive
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
          : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-700/30'
      }
    `}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline text-sm">{children}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold bg-red-500 border-2 border-slate-800">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  ),
)

// Optimized search input
const SearchInput = React.memo(
  ({ value, onChange, placeholder, isLoading, networkStatus }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-cyan-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={
          networkStatus === 'offline'
            ? 'Search unavailable offline'
            : placeholder
        }
        disabled={networkStatus === 'offline'}
        className={`
        w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-slate-400
        bg-slate-800/60 border border-slate-600/50
        focus:border-cyan-500/50 focus:outline-none
        transition-all duration-200 disabled:opacity-50
      `}
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  ),
)

// Optimized header stats
const HeaderStats = React.memo(
  ({
    totalFriends,
    onlineCount,
    totalRequests,
    isLoading,
    socketConnected,
  }) => {
    const { t } = useTranslation('WiseWeb')

    if (isLoading) {
      return (
        <div className="flex items-center gap-4">
          <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
        </div>
      )
    }

    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-300 font-medium">{totalFriends}</span>
          <span className="text-slate-400">
            {totalFriends === 1 ? 'friend' : 'friends'}
          </span>
        </div>
        {onlineCount > 0 && (
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                socketConnected ? 'bg-green-400' : 'bg-orange-400'
              }`}
            />
            <span className="text-green-300 font-medium">{onlineCount}</span>
            <span className="text-slate-400">online</span>
          </div>
        )}
        {totalRequests > 0 && (
          <div className="flex items-center gap-1">
            <UserPlus className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-medium">{totalRequests}</span>
            <span className="text-slate-400">pending</span>
          </div>
        )}
      </div>
    )
  },
)

// Empty state component
const EmptyState = React.memo(
  ({ icon: Icon, title, description, action, networkStatus }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
        <Icon className="w-8 h-8 text-cyan-300" />
      </div>
      <h3 className="text-lg font-bold text-cyan-200 mb-3">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-4">
        {description}
      </p>
      {networkStatus === 'offline' && (
        <div className="flex items-center gap-2 text-orange-400 text-sm mb-4">
          <WifiOff className="w-4 h-4" />
          <span>Offline mode</span>
        </div>
      )}
      {action}
    </div>
  ),
)

// Main WiseWeb modal component
const WiseWebModal = React.memo(({ isOpen, onClose }) => {
  const { t } = useTranslation('WiseWeb')
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInitialFriendId, setChatInitialFriendId] = useState(null)

  const {
    friends,
    onlineFriends,
    offlineFriends,
    friendRequests,
    searchResults,
    loading,
    error,
    networkStatus,
    totalFriends,
    totalRequests,
    onlineCount,
    handleSearchQueryChange,
    clearSearch,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRemoveFriend,
    closeWiseWeb,
    refreshData,
    hasPendingRequest,
  } = useFriends({
    autoFetch: true,
    enableOptimisticUpdates: true,
    enableAutoRetry: true,
  })

  // Socket status
  const globalFriendsSocket =
    typeof window !== 'undefined' ? window.friendsSocket : null
  const socketConnected = globalFriendsSocket?.isConnected || false

  // Chat handlers
  const handleOpenChatWithFriend = useCallback(friend => {
    setChatInitialFriendId(friend._id)
    setIsChatOpen(true)
  }, [])

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false)
    setChatInitialFriendId(null)
  }, [])

  // Enhanced search handling
  const handleSearchInput = useCallback(
    value => {
      setSearchQuery(value)
      if (networkStatus !== 'offline') {
        handleSearchQueryChange(value)
      }
    },
    [handleSearchQueryChange, networkStatus],
  )

  // Clear search when switching tabs
  useEffect(() => {
    if (activeTab !== 2) {
      setSearchQuery('')
      clearSearch()
    }
  }, [activeTab, clearSearch])

  const handleClose = useCallback(() => {
    quizAudioService.playDismiss() // Sound for closing modal
    closeWiseWeb()
    onClose()
  }, [closeWiseWeb, onClose])

  // Render friends list
  const renderFriendsList = useCallback(() => {
    if (loading.friends) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
    }

    if (error.friends) {
      return (
        <EmptyState
          icon={Users}
          title="Failed to load friends"
          description={error.friends}
          action={
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              Try Again
            </button>
          }
        />
      )
    }

    if (totalFriends === 0) {
      return (
        <EmptyState
          icon={Users}
          title={t('No Friends Yet')}
          description={t(
            'Start building your network by searching for players!',
          )}
          networkStatus={networkStatus}
          action={
            networkStatus !== 'offline' && (
              <button
                onClick={() => setActiveTab(2)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
              >
                {t('Search Players')}
              </button>
            )
          }
        />
      )
    }

    return (
      <div className="space-y-4">
        {onlineFriends.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider">
                {t('Online')} ({onlineFriends.length})
              </h3>
            </div>
            <div className="space-y-2">
              <Suspense fallback={<LoadingSpinner />}>
                {onlineFriends.map(friend => (
                  <FriendCard
                    key={friend._id}
                    friend={friend}
                    onRemove={handleRemoveFriend}
                    onStartChat={handleOpenChatWithFriend}
                    isOnline={true}
                  />
                ))}
              </Suspense>
            </div>
          </div>
        )}

        {offlineFriends.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                {t('Offline')} ({offlineFriends.length})
              </h3>
            </div>
            <div className="space-y-2">
              <Suspense fallback={<LoadingSpinner />}>
                {offlineFriends.map(friend => (
                  <FriendCard
                    key={friend._id}
                    friend={friend}
                    onRemove={handleRemoveFriend}
                    onStartChat={handleOpenChatWithFriend}
                    isOnline={false}
                  />
                ))}
              </Suspense>
            </div>
          </div>
        )}
      </div>
    )
  }, [
    loading.friends,
    error.friends,
    totalFriends,
    onlineFriends,
    offlineFriends,
    handleRemoveFriend,
    handleOpenChatWithFriend,
    refreshData,
    networkStatus,
    t,
  ])

  // Render friend requests
  const renderFriendRequests = useCallback(() => {
    if (loading.requests) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
    }

    if (error.requests) {
      return (
        <EmptyState
          icon={UserPlus}
          title="Failed to load requests"
          description={error.requests}
          action={
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              Try Again
            </button>
          }
        />
      )
    }

    if (totalRequests === 0) {
      return (
        <EmptyState
          icon={UserPlus}
          title={t('No Friend Requests')}
          description={t(
            'When players send you friend requests, they will appear here.',
          )}
          networkStatus={networkStatus}
        />
      )
    }

    return (
      <div className="space-y-3">
        <Suspense fallback={<LoadingSpinner />}>
          {friendRequests.map(request => (
            <FriendRequestCard
              key={request._id}
              request={request}
              onAccept={handleAcceptFriendRequest}
              onReject={handleRejectFriendRequest}
              loading={loading.acceptRequest || loading.rejectRequest}
            />
          ))}
        </Suspense>
      </div>
    )
  }, [
    loading.requests,
    loading.acceptRequest,
    loading.rejectRequest,
    error.requests,
    totalRequests,
    friendRequests,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    refreshData,
    networkStatus,
    t,
  ])

  // Render search results
  const renderSearchResults = useCallback(() => {
    if (networkStatus === 'offline') {
      return (
        <EmptyState
          icon={WifiOff}
          title={t('Search Unavailable')}
          description={t(
            'Search functionality is not available while offline.',
          )}
          networkStatus={networkStatus}
        />
      )
    }

    if (loading.search) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )
    }

    if (error.search) {
      return (
        <EmptyState
          icon={Search}
          title="Search failed"
          description={error.search}
          action={
            <button
              onClick={() =>
                searchQuery.trim() && handleSearchQueryChange(searchQuery)
              }
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              Try Again
            </button>
          }
        />
      )
    }

    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon={Search}
          title={t('Search Players')}
          description={t(
            'Enter a name or username to search for players to add as friends.',
          )}
          networkStatus={networkStatus}
        />
      )
    }

    if (searchResults.length === 0) {
      return (
        <EmptyState
          icon={Search}
          title={t('No Results Found')}
          description={t('Try searching with different keywords.')}
          networkStatus={networkStatus}
        />
      )
    }

    return (
      <div className="space-y-3">
        <Suspense fallback={<LoadingSpinner />}>
          {searchResults.map(user => (
            <SearchUserCard
              key={user._id}
              user={user}
              onSendRequest={handleSendFriendRequest}
              onStartChat={handleOpenChatWithFriend}
              hasPendingRequest={hasPendingRequest(user._id)}
              loading={loading.sendRequest}
            />
          ))}
        </Suspense>
      </div>
    )
  }, [
    networkStatus,
    loading.search,
    loading.sendRequest,
    error.search,
    searchQuery,
    searchResults,
    handleSendFriendRequest,
    handleOpenChatWithFriend,
    handleSearchQueryChange,
    hasPendingRequest,
    t,
  ])

  return (
    <>
      <div
        className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          onClick={e => e.stopPropagation()}
          className={`
            w-full max-w-md max-h-[85vh] rounded-2xl overflow-hidden
            ${QUICK_CLASH_CLASSES.modalContainer} shadow-2xl
          `}
          style={{
            background:
              'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-cyan-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/30">
                  <Users className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cyan-200">
                    {t('WiseWeb')}
                  </h2>
                  <HeaderStats
                    totalFriends={totalFriends}
                    onlineCount={onlineCount}
                    totalRequests={totalRequests}
                    isLoading={loading.friends || loading.requests}
                    socketConnected={socketConnected}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Chat button */}
                <button
                  onClick={() => { quizAudioService.playButtonClick(); setIsChatOpen(true) }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                  title={t('Open Chat')}
                >
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                </button>

                {/* Refresh button */}
                {(error.friends || error.requests) && (
                  <button
                    onClick={() => { quizAudioService.playButtonClick(); refreshData() }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                    title={t('Refresh')}
                  >
                    <RefreshCw className="w-5 h-5 text-cyan-400" />
                  </button>
                )}

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-800/60 border border-cyan-500/20">
              <TabButton
                isActive={activeTab === 0}
                onClick={() => setActiveTab(0)}
                icon={Users}
                badge={0}
              >
                {t('Friends')}
              </TabButton>
              <TabButton
                isActive={activeTab === 1}
                onClick={() => setActiveTab(1)}
                icon={UserPlus}
                badge={totalRequests}
              >
                {t('Requests')}
              </TabButton>
              <TabButton
                isActive={activeTab === 2}
                onClick={() => setActiveTab(2)}
                icon={Search}
                badge={0}
              >
                {t('Search')}
              </TabButton>
            </div>
          </div>

          {/* Search Input for Search Tab */}
          {activeTab === 2 && (
            <div className="p-4 border-b border-cyan-500/10">
              <SearchInput
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder={t('Search by name or username...')}
                isLoading={loading.search}
                networkStatus={networkStatus}
              />
            </div>
          )}

          {/* Content */}
          <div
            className="flex-1 p-4 overflow-y-auto chat-scroll"
            style={{ maxHeight: '400px' }}
          >
            {activeTab === 0 && renderFriendsList()}
            {activeTab === 1 && renderFriendRequests()}
            {activeTab === 2 && renderSearchResults()}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {isChatOpen && (
        <Suspense fallback={null}>
          <WiseWebChat
            isOpen={isChatOpen}
            onClose={handleCloseChat}
            initialFriendId={chatInitialFriendId}
            friends={friends}
          />
        </Suspense>
      )}
    </>
  )
})

// Main WiseWeb component with portal rendering
const WiseWeb = React.memo(({ isOpen, onClose }) => {
  if (!isOpen) return null

  return createPortal(
    <WiseWebModal isOpen={isOpen} onClose={onClose} />,
    document.body,
  )
})

// Set display names
TabButton.displayName = 'TabButton'
SearchInput.displayName = 'SearchInput'
HeaderStats.displayName = 'HeaderStats'
EmptyState.displayName = 'EmptyState'
WiseWebModal.displayName = 'WiseWebModal'
WiseWeb.displayName = 'WiseWeb'

export default WiseWeb
