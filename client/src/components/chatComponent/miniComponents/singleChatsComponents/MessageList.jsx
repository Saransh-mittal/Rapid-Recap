import React from "react";
import ScrollableChat from "./../ScrollableChat";

const MessageList = ({
  messages,
  handleDeleteMessage,
  MessageStatus,
  loadMoreMessages,
  handleAddReaction,
  handleRemoveReaction,
  hasMore,
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
  );
};

export default MessageList;
