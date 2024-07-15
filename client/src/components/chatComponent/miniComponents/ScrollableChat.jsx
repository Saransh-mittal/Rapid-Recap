import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import React, { useCallback } from "react";
import {
  isLastMessage,
  isMessageDeletedForUser,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../../../contextAPI/ChatProvider";
import {
  Box,
  Text,
  useMediaQuery,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import ContextMenu from "./ContextMenu";
import { BsCheck, BsCheckAll, BsClock } from "react-icons/bs";
import ArticleCard from "../../miscellaneous/ArticleCard";
import { useNavigate } from "react-router-dom";
import { Emoji } from "emoji-picker-react";
// import ReactionPicker from "./ReactionPicker";

const ScrollableChat = ({
  messages,
  handleDeleteMessage,
  MessageStatus,
  loadMoreMessages,
  handleAddReaction,
  handleRemoveReaction,
  currUser,
}) => {
  const { user } = ChatState();
  const [loading, setLoading] = useState(false);
  const scrollableFeedRef = useRef(null);
  const loadingRef = useRef(null);
  const observer = useRef(null);

  const formatTime = (date) => {
    return new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };
  const navigate = useNavigate();
  const isScreenSmallerThan600px = useMediaQuery("(max-width: 600px)")[0];

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
  const handleIntersect = useCallback(
    (entries) => {
      const firstEntry = entries[0];
      if (firstEntry.isIntersecting && !loading) {
        setLoading(true);
        loadMoreMessages().then(() => setLoading(false));
      }
    },
    [loadMoreMessages, loading]
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    observer.current = new IntersectionObserver(handleIntersect, options);

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleIntersect]);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    messageId: null,
  });
  const longPressTimer = useRef(null);
  const longPressDelay = 500; // ms

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReactions, setSelectedReactions] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

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

  const handleReactionClick = (message) => {
    setSelectedReactions({ reactions: message.reactions, message });
    setActiveTab("All");
    onOpen();
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
  const handleReact = ({ emoji, messageId }) => {
    handleAddReaction(messageId, emoji);
    handleCloseContextMenu();
  };

  const renderReactions = (message) => {
    if (!message.reactions || message.reactions.length === 0) return null;
    const distinctReactions = message.reactions.reduce((acc, reaction) => {
      if (!acc.find((r) => r.emoji === reaction.emoji)) {
        acc.push(reaction);
      }
      return acc;
    }, []);

    return (
      <Flex
        flexWrap="wrap"
        position={"absolute"}
        right={"-0.65rem"}
        bottom={"-0.9rem"}
        bg={"rgba(42, 36, 64, 0.7)"}
        px={2}
        gap={1}
        borderRadius={"20px"}
        backdropFilter={"blur(5px)"} // Added blur effect for better visibility
        boxShadow={"0 2px 4px rgba(0, 0, 0, 0.2)"} // Subtle shadow for depth
        onClick={() => handleReactionClick(message)}
      >
        {distinctReactions.map((reaction, index) => (
          <Tooltip key={index} label={reaction.user.name} placement="bottom">
            <Box
              borderRadius="full"
              py={1}
              // mr={1}
              // mb={1}
              fontSize="md"
              cursor="pointer"
            >
              <Emoji unified={reaction.emoji} size="15" />
              {/* {reaction.emoji} */}
            </Box>
          </Tooltip>
        ))}
        {message.reactions.length > 1 && (
          <Text m={0} fontSize={"sm"} mt={"2px"} ml={"2px"} color={"#9CAFAA"}>
            {" "}
            {message.reactions.length}{" "}
          </Text>
        )}
      </Flex>
    );
  };

  const getDistinctEmojis = (reactions) => {
    return [...new Set(reactions.map((r) => r.emoji))];
  };
  const filterReactionsByEmoji = (reactions, emoji) => {
    return reactions.filter((r) => r.emoji === emoji);
  };

  const renderReactions2 = (reactions) => {
    return reactions.length > 0 ? (
      reactions.map((reaction) => (
        <Flex
          key={reaction.user._id}
          p="10px"
          borderRadius="10px"
          mb={4}
          _hover={{ bg: "#2a2440" }}
          cursor={reaction.user._id === user._id ? "pointer" : "not-allowed"}
          onClick={() => {
            if (reaction.user._id === user._id) {
              handleRemoveReaction(selectedReactions.message._id, user._id);
              onClose();
            }
          }}
        >
          <Avatar
            size="md"
            src={reaction.user.pic}
            name={reaction.user.name}
            mr={2}
          />
          <Flex flexDirection="column">
            <Text fontWeight="bold" m={0}>
              {reaction.user._id === user._id ? "YOU" : reaction.user.name}
            </Text>
            {reaction.user._id === user._id && (
              <Text color="#9CAFAA" m={0}>
                Tap to remove
              </Text>
            )}
          </Flex>
          <Flex marginLeft="auto" alignItems="center">
            <Emoji unified={reaction.emoji} size="25" />
          </Flex>
        </Flex>
      ))
    ) : (
      <Text>No reactions in this category</Text>
    );
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
      <ScrollableFeed ref={scrollableFeedRef}>
        {loading && (
          <Box textAlign="center" py={2}>
            <Spinner size="sm" />
          </Box>
        )}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <React.Fragment key={date}>
            <div
              style={{ textAlign: "center", margin: "10px 0", color: "#999" }}
            >
              {date}
            </div>
            {msgs.map((m, i) => {
              const messageDeletedForUser = isMessageDeletedForUser(
                m,
                user._id.toString()
              );
              const messageDeleted = m.isDeleted;

              if (
                m.type === "article_card" &&
                !(messageDeleted || messageDeletedForUser)
              ) {
                return (
                  <Box
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
                      _hover={{
                        transform: "translateY(-5px)",
                        transition: "transform 0.3s",
                      }}
                    >
                      <ArticleCard
                        article={m.article}
                        onClick={() => {
                          /* Handle click event */
                          navigate(`/article/${m.article._id}`);
                        }}
                        // viewMode={isScreenSmallerThan992px ? "grid" : "list"}
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
                      marginTop: isSameUser(msgs, m, i, user._id) ? 3 : 5,
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
                    {renderReactions(m)}
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
                  {/* <ReactionPicker
                    messageId={m._id}
                    onAddReaction={handleAddReaction}
                  /> */}
                </Box>
              );
            })}
          </React.Fragment>
        ))}
        <ContextMenu
          isOpen={contextMenu.isOpen}
          onClose={handleCloseContextMenu}
          position={contextMenu.position}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onReact={handleReact}
          isSender={
            messages.find((m) => m._id === contextMenu.messageId)?.sender
              ._id === user._id
          }
          messageTime={
            messages.find((m) => m._id === contextMenu.messageId)?.createdAt
          }
          isMessageDeleted={
            messages.find((m) => m._id === contextMenu.messageId)?.isDeleted ||
            isMessageDeletedForUser(
              messages.find((m) => m._id === contextMenu.messageId),
              user._id.toString()
            )
          }
          messageId={contextMenu.messageId}
        />
      </ScrollableFeed>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg="#1e1a2e"
          color="white"
          borderRadius="10px"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        >
          <ModalHeader
            bg="#2a2440"
            borderTopLeftRadius="10px"
            borderTopRightRadius="10px"
            w="100%"
          >
            Reaction Details
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody maxH="60vh" overflowY="auto" w="100%" mt="1.5rem">
            {selectedReactions && (
              <Tabs
                isFitted
                variant="solid-rounded"
                onChange={(index) =>
                  setActiveTab(
                    index === 0
                      ? "All"
                      : getDistinctEmojis(selectedReactions.reactions)[
                          index - 1
                        ]
                  )
                }
              >
                <TabList mb="1em">
                  <Tab>All</Tab>
                  {getDistinctEmojis(selectedReactions.reactions).map(
                    (emoji, index) => (
                      <Tab key={index}>
                        <Emoji unified={emoji} size="20" />
                      </Tab>
                    )
                  )}
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {renderReactions2(selectedReactions.reactions)}
                  </TabPanel>
                  {getDistinctEmojis(selectedReactions.reactions).map(
                    (emoji, index) => (
                      <TabPanel key={index}>
                        {renderReactions2(
                          filterReactionsByEmoji(
                            selectedReactions.reactions,
                            emoji
                          )
                        )}
                      </TabPanel>
                    )
                  )}
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ScrollableChat;
