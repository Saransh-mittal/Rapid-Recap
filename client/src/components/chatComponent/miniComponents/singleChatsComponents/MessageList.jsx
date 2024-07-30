import React from 'react'
import ScrollableChat from './../ScrollableChat'
import { Text } from '@chakra-ui/react'

const MessageList = ({
  messages,
  handleDeleteMessage,
  MessageStatus,
  loadMoreMessages,
  handleAddReaction,
  handleRemoveReaction,
  hasMore,
  selectedChat,
}) => {
  return (
    <div className="messages">
      <ScrollableChat
        messages={messages}
        handleDeleteMessage={handleDeleteMessage}
        MessageStatus={MessageStatus}
        loadMoreMessages={loadMoreMessages}
        handleAddReaction={handleAddReaction}
        handleRemoveReaction={handleRemoveReaction}
        hasMore={hasMore}
      />
    </div>
  )
}

export default MessageList
