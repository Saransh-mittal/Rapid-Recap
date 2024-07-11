import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isMessageDeletedForUser,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../../../contextAPI/ChatProvider";
import { Box, Text } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import ContextMenu from "./ContextMenu";

const ScrollableChat = ({ messages, handleDeleteMessage }) => {
  const { user } = ChatState();
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    messageId: null,
  });
  const longPressTimer = useRef(null);
  const longPressDelay = 500; // ms

  const handleContextMenu = (event, messageId) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      messageId,
    });
  };

  const handleTouchStart = (event, messageId) => {
    event.preventDefault();
    longPressTimer.current = setTimeout(() => {
      const touch = event.touches[0];
      setContextMenu({
        isOpen: true,
        position: { x: touch.clientX, y: touch.clientY },
        messageId,
      });
    }, longPressDelay);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      messageId: null,
    });
  };

  const handleDelete = (type) => {
    handleDeleteMessage(contextMenu.messageId, type);
    handleCloseContextMenu();
  };

  const handleCopy = () => {
    const message = messages.find((m) => m._id === contextMenu.messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
    handleCloseContextMenu();
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <ScrollableFeed>
        {messages &&
          messages.map((m, i) => (
            <Box
              style={{ display: "flex" }}
              key={m._id}
              onContextMenu={(e) => handleContextMenu(e, m._id)}
              onTouchStart={(e) => handleTouchStart(e, m._id)}
              onTouchEnd={handleTouchEnd}
              marginBottom={"0.45rem"}
              cursor="pointer"
            >
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip
                  label={m.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mt="7px"
                    mr={3}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 5,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  position: "relative",
                  // Added cursor: pointer
                }}
              >
                <Text
                  color={
                    m.isDeleted ||
                    isMessageDeletedForUser(m, user._id.toString())
                      ? "#9CAFAA"
                      : "black"
                  }
                  fontStyle={
                    m.isDeleted ||
                    isMessageDeletedForUser(m, user._id.toString())
                      ? "italic"
                      : ""
                  }
                  m={0}
                  p={0}
                >
                  {m.isDeleted
                    ? "This message was deleted"
                    : isMessageDeletedForUser(m, user._id.toString())
                    ? "This message was deleted for you"
                    : m.content}
                </Text>
                {m.sender._id.toString() === user._id.toString() && (
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    position="absolute"
                    right="5px"
                    bottom="-18px"
                  >
                    {m.readBy.length > 0 ? "Read" : "Sent"}
                  </Text>
                )}
              </span>
            </Box>
          ))}
        <ContextMenu
          isOpen={contextMenu.isOpen}
          onClose={handleCloseContextMenu}
          position={contextMenu.position}
          onDelete={handleDelete}
          onCopy={handleCopy}
          isSender={
            messages.find((m) => m._id === contextMenu.messageId)?.sender
              ._id === user._id
          }
          messageTime={
            messages.find((m) => m._id === contextMenu.messageId)?.createdAt
          }
        />
      </ScrollableFeed>
    </>
  );
};

export default ScrollableChat;
