import React from 'react'
import ScrollableChat from './../ScrollableChat'

const MessageList = ({
  messages,
  handleDeleteMessage,
  MessageStatus,
  loadMoreMessages,
  handleAddReaction,
  handleRemoveReaction,
  hasMore,
  selectedChat,
  setHasMore,
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
        setHasMore={setHasMore}
      />
    </div>
  )
}

export default MessageList
