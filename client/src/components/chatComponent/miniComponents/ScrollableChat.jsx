// src/components/chat/ScrollableChat.js
import React, { useState, useRef, useEffect } from 'react'
import { Box, useDisclosure, useMediaQuery, Skeleton } from '@chakra-ui/react'
import ScrollableFeed from 'react-scrollable-feed'
import { ChatState } from '../../../contextAPI/ChatProvider'
import ContextMenu from './ContextMenu'
import ReactionModal from './scrollableChatComponents/ReactionModal'
import GroupedMessages from './scrollableChatComponents/GroupedMessages'
import {
  groupMessagesByDate,
  formatTime,
  checkScrollPosition,
} from '../../../utils/chat.utils'
import { isMessageDeletedForUser } from '../config/ChatLogics'

const ScrollableChat = ({
  messages,
  handleDeleteMessage,
  MessageStatus,
  loadMoreMessages,
  handleAddReaction,
  handleRemoveReaction,
  hasMore,
}) => {
  const { user } = ChatState()
  const [loading, setLoading] = useState(false)
  const scrollableFeedRef = useRef(null)
  const [page, setPage] = useState(1)
  const lastScrollTop = useRef(0)
  const loadingRef = useRef(false)

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    messageId: null,
  })
  const longPressTimer = useRef(null)
  const longPressDelay = 500 // ms

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedReactions, setSelectedReactions] = useState(null)

  const groupedMessages = groupMessagesByDate(messages)
  const isScreenSmallerThan600px = useMediaQuery('(max-width: 600px)')[0]

  const handleContextMenu = (event, messageId) => {
    event.preventDefault()
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      messageId,
    })
  }

  const handleTouchStart = (event, messageId) => {
    event.preventDefault()
    longPressTimer.current = setTimeout(() => {
      const touch = event.touches[0]
      setContextMenu({
        isOpen: true,
        position: { x: touch.clientX, y: touch.clientY },
        messageId,
      })
    }, longPressDelay)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const handleCloseContextMenu = () => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      messageId: null,
    })
  }

  const handleReactionClick = message => {
    setSelectedReactions({ reactions: message.reactions, message })
    onOpen()
  }

  const handleDelete = type => {
    handleDeleteMessage(contextMenu.messageId, type)
    handleCloseContextMenu()
  }

  const handleCopy = () => {
    const message = messages.find(m => m._id === contextMenu.messageId)
    if (message) {
      navigator.clipboard.writeText(message.content)
    }
    handleCloseContextMenu()
  }

  useEffect(() => {
    const scrollableDiv = scrollableFeedRef.current?.wrapperRef?.current
    if (!scrollableDiv) return

    const scrollListener = () => {
      if (!loadingRef.current) {
        checkScrollPosition({
          scrollableDiv,
          lastScrollTop,
          loadingRef,
          setLoading,
          loadMoreMessages,
          page,
          setPage,
          hasMore,
        })
      }
    }

    scrollableDiv.addEventListener('scroll', scrollListener)

    return () => {
      scrollableDiv.removeEventListener('scroll', scrollListener)
    }
  }, [checkScrollPosition])

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const handleReact = ({ emoji, messageId }) => {
    handleAddReaction(messageId, emoji)
    handleCloseContextMenu()
  }

  return (
    <>
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      <ScrollableFeed ref={scrollableFeedRef}>
        {loadingRef.current && (
          <Box textAlign="center" py={2}>
            {Array.from({ length: 20 }, (_, i) => (
              <Skeleton key={i} height="40px" m={'10px'} />
            ))}
          </Box>
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
        <ContextMenu
          isOpen={contextMenu.isOpen}
          onClose={handleCloseContextMenu}
          position={contextMenu.position}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onReact={handleReact}
          isSender={
            messages.find(m => m._id === contextMenu.messageId)?.sender._id ===
            user._id
          }
          messageTime={
            messages.find(m => m._id === contextMenu.messageId)?.createdAt
          }
          isMessageDeleted={
            messages.find(m => m._id === contextMenu.messageId)?.isDeleted ||
            isMessageDeletedForUser(
              messages.find(m => m._id === contextMenu.messageId),
              user._id.toString(),
            )
          }
          messageId={contextMenu.messageId}
        />
      </ScrollableFeed>
      <ReactionModal
        isOpen={isOpen}
        onClose={onClose}
        selectedReactions={selectedReactions}
        handleRemoveReaction={handleRemoveReaction}
        user={user}
      />
    </>
  )
}

export default ScrollableChat
