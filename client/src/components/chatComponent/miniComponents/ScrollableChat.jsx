import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  useMemo,
} from 'react'
import { useDisclosure, useMediaQuery, Spinner, Flex } from '@chakra-ui/react'
import ScrollableFeed from 'react-scrollable-feed'
import { ChatState } from '../../../contextAPI/ChatProvider'
import throttle from 'lodash.throttle'
import useSound from '../../../customHooks/useSound'

// Lazy load components
const ContextMenu = lazy(() => import('./ContextMenu'))
const ReactionModal = lazy(() =>
  import('./scrollableChatComponents/ReactionModal'),
)
const GroupedMessages = lazy(() =>
  import('./scrollableChatComponents/GroupedMessages'),
)

import { groupMessagesByDate, formatTime } from '../../../utils/chat.utils'
import { isMessageDeletedForUser } from '../config/ChatLogics'

const ScrollableChat = ({
  messages,
  handleDeleteMessage,
  MessageStatus,
  loadMoreMessages,
  handleAddReaction,
  handleRemoveReaction,
  hasMore,
  setHasMore,
}) => {
  const { user } = ChatState()
  const [loading, setLoading] = useState(false)
  const scrollableFeedRef = useRef(null)
  const [page, setPage] = useState(1)
  const lastScrollTop = useRef(0)
  const loadingRef = useRef(false)
  const isScrolling = useRef(false)
  const scrollTimeout = useRef(null)
  const { playClick } = useSound()

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    messageId: null,
    position: { x: 0, y: 0 },
    messageRect: null, // Add this to store the message's position
  })
  const longPressTimer = useRef(null)
  const longPressDelay = 500 // ms

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedReactions, setSelectedReactions] = useState(null)

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages],
  )
  const isScreenSmallerThan600px = useMediaQuery('(max-width: 600px)')[0]

  const disableScroll = useCallback(() => {
    const scrollableDiv = scrollableFeedRef.current?.wrapperRef?.current
    if (scrollableDiv) {
      scrollableDiv.style.overflow = 'hidden'
    }
  }, [])

  const enableScroll = useCallback(() => {
    const scrollableDiv = scrollableFeedRef.current?.wrapperRef?.current
    if (scrollableDiv) {
      scrollableDiv.style.overflow = 'auto'
    }
  }, [])

  const handleContextMenu = useCallback(
    (event, messageId, messageElement) => {
      if (isScrolling.current) return
      playClick()
      event.preventDefault()
      const messageRect = messageElement.getBoundingClientRect()
      setContextMenu({
        isOpen: true,
        messageId,
        position: { x: event.clientX, y: event.clientY },
        messageRect,
      })
      disableScroll()
    },
    [playClick, disableScroll],
  )

  const handleTouchStart = useCallback((event, messageId) => {
    if (isScrolling.current) return
    event.preventDefault()
    longPressTimer.current = setTimeout(() => {
      const touch = event.touches[0]
      setContextMenu({
        isOpen: true,
        position: { x: touch.clientX, y: touch.clientY },
        messageId,
      })
    }, longPressDelay)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    playClick()
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      messageId: null,
    })
    enableScroll()
  }, [playClick, enableScroll])

  const handleReactionClick = useCallback(
    message => {
      playClick()
      setSelectedReactions({ reactions: message.reactions, message })
      onOpen()
    },
    [playClick, onOpen],
  )

  const handleDelete = useCallback(
    type => {
      playClick()
      handleDeleteMessage(contextMenu.messageId, type)
      handleCloseContextMenu()
    },
    [
      handleDeleteMessage,
      contextMenu.messageId,
      handleCloseContextMenu,
      playClick,
    ],
  )

  const handleCopy = useCallback(() => {
    playClick()
    const message = messages?.find(m => m._id === contextMenu.messageId)
    if (message) {
      navigator.clipboard.writeText(message.content)
    }
    handleCloseContextMenu()
  }, [messages, contextMenu.messageId, handleCloseContextMenu, playClick])

  const throttledScrollHandler = useCallback(
    throttle(async (scrollTop, scrollHeight, clientHeight) => {
      isScrolling.current = true
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false
      }, 150)
      const SCROLL_THRESHOLD = 500
      const isScrollingUp = scrollTop < lastScrollTop.current
      const isNearTop = scrollTop <= SCROLL_THRESHOLD

      if (isNearTop && !loadingRef.current && hasMore) {
        try {
          loadingRef.current = true
          setLoading(true)
          const scrollableDiv = scrollableFeedRef.current?.wrapperRef?.current

          const newMessages = await loadMoreMessages(page + 1)

          if (newMessages?.length === 0) {
            setHasMore(false)
          } else {
            setPage(prevPage => prevPage + 1)
            requestAnimationFrame(() => {
              if (scrollableDiv) {
                const newScrollHeight = scrollableDiv.scrollHeight
                const scrollDiff = newScrollHeight - scrollHeight
                scrollableDiv.scrollTop = scrollDiff
              }
            })
          }
        } catch (error) {
          console.error('Error loading more messages:', error)
        } finally {
          await new Promise(resolve => setTimeout(resolve, 300))
          const scrollableDiv = scrollableFeedRef.current?.wrapperRef?.current
          if (scrollableDiv) scrollableDiv.style.overflowY = 'auto'
          loadingRef.current = false
          setLoading(false)
        }
      }

      lastScrollTop.current = scrollTop
    }, 200),
    [loadMoreMessages, page, hasMore, setHasMore],
  )

  // Scroll event handler
  const handleScroll = useCallback(() => {
    const scrollableDiv = scrollableFeedRef.current?.wrapperRef?.current
    if (scrollableDiv) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableDiv
      throttledScrollHandler(scrollTop, scrollHeight, clientHeight)
    }
  }, [throttledScrollHandler])

  // Set up scroll listener
  useEffect(() => {
    const scrollableDiv = scrollableFeedRef.current?.wrapperRef?.current
    if (!scrollableDiv) return
    scrollableDiv.addEventListener('scroll', handleScroll)

    return () => {
      scrollableDiv.removeEventListener('scroll', handleScroll)
      throttledScrollHandler.cancel()
    }
  }, [handleScroll, throttledScrollHandler])

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])
  useEffect(() => {
    return () => {
      // Make sure to re-enable scroll when component unmounts
      enableScroll()
    }
  }, [enableScroll])

  const handleReact = useCallback(
    ({ emoji, messageId }) => {
      playClick()
      handleAddReaction(messageId, emoji)
      handleCloseContextMenu()
    },
    [handleAddReaction, handleCloseContextMenu, playClick],
  )

  return (
    <>
      <style>{`
        div::-webkit-scrollbar { display: none; }
        .scroll-disabled { overflow: hidden !important; }
      `}</style>
      <ScrollableFeed
        ref={scrollableFeedRef}
        className={contextMenu.isOpen ? 'scroll-disabled' : ''}
      >
        {loadingRef.current && (
          <Flex w={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Spinner color="white" />
          </Flex>
        )}
        <GroupedMessages
          groupedMessages={groupedMessages}
          handleContextMenu={handleContextMenu}
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
          handleReactionClick={handleReactionClick}
          formatTime={formatTime}
          MessageStatus={MessageStatus}
          user={user}
          isScreenSmallerThan600px={isScreenSmallerThan600px}
        />
        <Suspense fallback={<Spinner color="white" />}>
          <ContextMenu
            isOpen={contextMenu.isOpen}
            onClose={handleCloseContextMenu}
            messageRect={contextMenu.messageRect}
            position={contextMenu.position}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onReact={handleReact}
            isSender={
              messages?.find(m => m._id === contextMenu.messageId)?.sender
                ._id === user._id
            }
            messageTime={
              messages?.find(m => m._id === contextMenu.messageId)?.createdAt
            }
            isMessageDeleted={
              messages?.find(m => m._id === contextMenu.messageId)?.isDeleted ||
              isMessageDeletedForUser(
                messages?.find(m => m._id === contextMenu.messageId),
                user._id.toString(),
              )
            }
            messageId={contextMenu.messageId}
          />
          <ReactionModal
            isOpen={isOpen}
            onClose={onClose}
            selectedReactions={selectedReactions}
            handleRemoveReaction={handleRemoveReaction}
            user={user}
          />
        </Suspense>
      </ScrollableFeed>
    </>
  )
}

export default React.memo(ScrollableChat)
