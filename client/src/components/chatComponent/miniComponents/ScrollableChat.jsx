import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import React from "react";
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
import { BsCheck, BsCheckAll, BsClock } from "react-icons/bs";

const ScrollableChat = ({ messages, handleDeleteMessage }) => {
  const { user } = ChatState();
  const formatTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);
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

  const MessageStatus = ({ message }) => {
    if (message.sender._id !== user._id) return null;

    if (!message.sent) {
      return <BsClock color="#999" size={16} />;
    } else if (message.sent && !message.delivered) {
      return <BsCheck color="#999" size={16} />;
    } else if (message.delivered && message.readBy.length === 0) {
      return <BsCheckAll color="#999" size={16} />;
    } else if (message.readBy.length > 0) {
      return <BsCheckAll color="#34B7F1" size={16} />;
    }
  };

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
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <React.Fragment key={date}>
            <div
              style={{ textAlign: "center", margin: "10px 0", color: "#999" }}
            >
              {date}
            </div>
            {msgs.map((m, i) => (
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
                    color: "black",
                    marginRight: "0.75rem",
                    position: "relative",
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
                  {/* {m.sender._id.toString() === user._id.toString() && (
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      position="absolute"
                      right="5px"
                      bottom="-18px"
                    >
                      {m.readBy.length > 0 ? "Read" : "Sent"}
                    </Text>
                  )} */}
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#555",
                      textAlign: "right",
                      marginTop: "2px",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    {formatTime(m.createdAt)}
                    <span style={{ marginLeft: "4px" }}>
                      <MessageStatus message={m} />
                    </span>
                  </div>
                </span>
              </Box>
            ))}
          </React.Fragment>
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
