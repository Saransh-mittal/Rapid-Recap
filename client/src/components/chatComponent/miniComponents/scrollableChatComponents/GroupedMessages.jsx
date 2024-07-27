// src/components/chat/GroupedMessages.js
import React from "react";
import { Box, Tooltip, Flex, Avatar, Text } from "@chakra-ui/react";
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isMessageDeletedForUser,
} from "../../config/ChatLogics";
import ArticleCard from "../../../miscellaneous/ArticleCard";
import MessageReactions from "./MessageReactions";

const GroupedMessages = ({
  groupedMessages,
  handleContextMenu,
  handleTouchStart,
  handleTouchEnd,
  handleReactionClick,
  formatTime,
  MessageStatus,
  user,
  isScreenSmallerThan600px,
}) => {
  return (
    <>
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <React.Fragment key={date}>
          <div style={{ textAlign: "center", margin: "10px 0", color: "#999" }}>
            {date}
          </div>
          {msgs.map((m, i) => {
            const messageDeletedForUser = isMessageDeletedForUser(
              m,
              user._id.toString()
            );
            const messageDeleted = m.isDeleted;
            const isSameLoggedUser = m.sender._id === user._id;

            if (m.type === "system") {
              if (m.sender._id === user._id) return;
              return (
                // design a system message that is centered and looks like a date style
                <Box
                  style={{
                    textAlign: "center",
                    margin: "10px 0",
                    color: "#999",
                  }}
                  key={m._id}
                >
                  {m.content}
                </Box>
              );
            }

            if (
              m.type === "article_card" &&
              !(messageDeleted || messageDeletedForUser)
            ) {
              return (
                <Box
                  mt={"1.5rem"}
                  key={m._id}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.sender._id === user._id ? "flex-end" : "flex-start",
                    marginBottom: "0.45rem",
                    width: "100%",
                    alignSelf:
                      m.sender._id === user._id ? "flex-end" : "flex-start",
                  }}
                >
                  {(isSameSender(msgs, m, i, user._id) ||
                    isLastMessage(msgs, i, user._id)) && (
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
                  <Flex
                    w={isScreenSmallerThan600px ? "75%" : "40%"}
                    onContextMenu={(e) => handleContextMenu(e, m._id)}
                    onTouchStart={(e) => handleTouchStart(e, m._id)}
                    onTouchEnd={handleTouchEnd}
                    position={"relative"}
                    marginLeft={isSameSenderMargin(msgs, m, i, user._id)}
                  >
                    <ArticleCard
                      article={m.article}
                      onClick={() => navigate(`/article/${m.article._id}`)}
                      viewMode="grid"
                      width={"100%"}
                      cancelHoverEffect={true}
                    />
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#555",
                        textAlign: "right",
                        marginTop: "2px",
                        display: "flex",
                        position: "absolute",
                        bottom: "0.5rem",
                        right: "0.5rem",
                      }}
                    >
                      {formatTime(m.createdAt)}
                      {!messageDeleted && !messageDeletedForUser && (
                        <span style={{ marginLeft: "4px" }}>
                          <MessageStatus message={m} />
                        </span>
                      )}
                    </div>
                    <Box>
                      {m.content}
                      <MessageReactions
                        message={m}
                        isSameLoggedUser={isSameLoggedUser}
                        handleReactionClick={handleReactionClick}
                      />
                    </Box>
                  </Flex>
                </Box>
              );
            }

            return (
              <Box
                style={{ display: "flex" }}
                key={m._id}
                marginBottom={"0.75rem"}
              >
                {(isSameSender(msgs, m, i, user._id) ||
                  isLastMessage(msgs, i, user._id)) && (
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
                    marginLeft: isSameSenderMargin(msgs, m, i, user._id),
                    marginTop: isSameLoggedUser ? 3 : 5,
                    borderRadius: "12px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    color: "black",
                    marginRight: "0.75rem",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onContextMenu={(e) => handleContextMenu(e, m._id)}
                  onTouchStart={(e) => handleTouchStart(e, m._id)}
                  onTouchEnd={handleTouchEnd}
                >
                  <Text
                    color={
                      messageDeleted || messageDeletedForUser
                        ? "#9CAFAA"
                        : "black"
                    }
                    fontStyle={
                      messageDeleted || messageDeletedForUser ? "italic" : ""
                    }
                    m={0}
                    p={0}
                  >
                    {messageDeleted
                      ? "This message was deleted"
                      : messageDeletedForUser
                      ? "This message was deleted for you"
                      : m.content}
                  </Text>
                  <MessageReactions
                    message={m}
                    isSameLoggedUser={isSameLoggedUser}
                    handleReactionClick={handleReactionClick}
                  />
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#555",
                      textAlign: "right",
                      marginTop: "2px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    {formatTime(m.createdAt)}
                    {!messageDeleted && !messageDeletedForUser && (
                      <span style={{ marginLeft: "4px" }}>
                        <MessageStatus message={m} />
                      </span>
                    )}
                  </div>
                </span>
              </Box>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

export default GroupedMessages;
