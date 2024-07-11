import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import React from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../../../contextAPI/ChatProvider";

const ScrollableChat = ({ messages }) => {
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
  const scrollableStyle = {
    height: "100%",
    overflowY: "auto",
    msOverflowStyle: "none", // IE and Edge
    scrollbarWidth: "none", // Firefox
  };
  const scrollableFeedStyle = {
    "& > div": {
      overflowY: "auto !important",
      "&::-webkit-scrollbar": {
        display: "none",
      },
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },
  };

  return (
    <div style={scrollableStyle}>
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
              <div style={{ display: "flex" }} key={m._id}>
                {(isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Tooltip
                    label={m.sender.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mt="7px"
                      mr={1}
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
                    marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    color: "black",
                  }}
                >
                  {m.content}
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#555",
                      textAlign: "right",
                      marginTop: "2px",
                    }}
                  >
                    {formatTime(m.createdAt)}
                  </div>
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </ScrollableFeed>
    </div>
  );
};

export default ScrollableChat;
