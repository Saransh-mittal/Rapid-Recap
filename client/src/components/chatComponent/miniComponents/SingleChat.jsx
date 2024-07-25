// File: SingleChat.js

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Spinner,
  Text,
  useDisclosure,
  useToast,
  Button as ChakraButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../../contextAPI/ChatProvider";
import ChatHeader from "./singleChatsComponents/ChatHeader";
import MessageInput from "./singleChatsComponents/MessageInput";
import MessageList from "./singleChatsComponents/MessageList";
import DeleteMessageModal from "./singleChatsComponents/DeleteMessageModal";
import BookmarksModal from "./singleChatsComponents/BookmarksModal";
import { BsClock, BsCheck, BsCheckAll } from "react-icons/bs";
import {
  fetchMessagesApi,
  loadMoreMessagesApi,
  updateMessageReadByApi,
  sendMessageApi,
  deleteMessageApi,
  permanentDeleteMessageApi,
  addReactionApi,
  removeReactionApi,
  fetchBookmarksApi,
  optimisticSendMessage,
  updateMessagesAfterSend,
  updateMessagesAfterDelete,
  handleSocketEvents,
  sendArticleMessageApi,
} from "../../../utils/chat.utils";
import axios from "axios";
import MessageRequestComponent from "./singleChatsComponents/MessageRequestComponent";
import { getSender } from "../config/ChatLogics";

let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const stickerPickerRef = useRef(null);
  const [page, setPage] = useState(1);
  const [deleteInfo, setDeleteInfo] = useState({ messageId: null, type: null });
  const navigate = useNavigate();
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [chatStatus, setChatStatus] = useState("pending");
  const [showAcceptReject, setShowAcceptReject] = useState(false);

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    updateLatestMessage,
    socket,
    socketConnected,
    messagesFetched,
    setMessagesFetched,
    hasMore,
    setHasMore,
  } = ChatState();

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const data = await fetchMessagesApi(selectedChat._id);
      setMessages((prevMessages) => {
        if (
          prevMessages.length > 0 &&
          prevMessages[0].chat.toString() === selectedChat._id.toString()
        )
          return [...data, ...prevMessages];
        return [...data];
      });
      setLoading(false);
      if (data.length === 0) {
        setHasMore(false);
      }
      data.forEach((message) => {
        if (
          message.sender._id !== user._id &&
          !message.readBy.includes(user._id)
        ) {
          updateMessageReadBy(message._id);
        }
      });
      socket?.emit("join chat", selectedChat._id);
      setMessagesFetched(true);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  }, [selectedChat, toast]);

  const loadMoreMessages = async (page) => {
    try {
      const data = await loadMoreMessagesApi(selectedChat._id, page);
      if (!data.length) {
        setHasMore(false);
      }
      setMessages((prevMessages) => [...data, ...prevMessages]);
      return data;
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load More Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const updateMessageReadBy = async (messageId) => {
    try {
      await updateMessageReadByApi(messageId);
      socket?.emit("message read", {
        messageId,
        userId: user._id,
      });
    } catch (error) {
      console.error("Error updating message read status:", error);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket?.emit("stop typing", selectedChat._id);
      const optimisticMessage = optimisticSendMessage(
        user,
        selectedChat,
        newMessage
      );
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      const currentNewMessage = newMessage;
      setNewMessage("");
      try {
        const data = await sendMessageApi(currentNewMessage, selectedChat._id);
        socket?.emit("new message", data);
        setMessages((prevMessages) =>
          updateMessagesAfterSend(prevMessages, optimisticMessage._id, data)
        );
        updateLatestMessage(selectedChat._id, data);
        if (messages.length === 0 && selectedChat.chatCreatedBy === user._id) {
          socket?.emit("chat request", {
            chatId: selectedChat._id,
            recipientId: selectedChat.users.find((u) => u._id !== user._id)._id,
          });
        }
      } catch (error) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== optimisticMessage._id)
        );
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const handleDeleteMessage = (messageId, type) => {
    if (type === "everyone") {
      setDeleteInfo({ messageId, type });
      onOpen();
    } else if (type === "me") {
      deleteMessage(messageId, type);
    } else {
      permanentDeleteMessage(messageId);
    }
  };

  const permanentDeleteMessage = async (messageId) => {
    try {
      await permanentDeleteMessageApi(messageId);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
      toast({
        title: "Message deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error deleting message",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const deleteMessage = async (messageId, type) => {
    try {
      await deleteMessageApi(messageId, type);
      const updatedMessages = updateMessagesAfterDelete(
        messages,
        messageId,
        type,
        user
      );
      setMessages(updatedMessages);
      const newLatestMessage = updatedMessages
        .filter((msg) => !msg.isDeleted && !msg.deletedFor.includes(user._id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      updateLatestMessage(selectedChat._id, newLatestMessage || null);
      if (type === "everyone") {
        socket?.emit("delete message", {
          chatId: selectedChat._id,
          messageId: messageId,
          deleteType: type,
          senderId: user?._id.toString(),
        });
      }
      toast({
        title: "Message deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error deleting message",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const confirmDelete = () => {
    deleteMessage(deleteInfo.messageId, deleteInfo.type);
    onClose();
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      const data = await addReactionApi(messageId, emoji);
      setMessages(messages.map((msg) => (msg._id === messageId ? data : msg)));
      socket?.emit("new reaction", data);
    } catch (error) {
      toast({
        title: "Error adding reaction",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleRemoveReaction = async (messageId) => {
    try {
      const data = await removeReactionApi(messageId);
      setMessages(messages.map((msg) => (msg._id === messageId ? data : msg)));
      socket?.emit("remove reaction", data);
    } catch (error) {
      toast({
        title: "Error removing reaction",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const fetchBookmarks = async () => {
    setIsLoadingBookmarks(true);
    try {
      const bookmarksData = await fetchBookmarksApi();
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const handleShareBookmark = async (articleId, article) => {
    if (!selectedChat) return;
    try {
      setShowBookmarksModal(false);
      const tempId = Date.now().toString(); // Temporary ID for optimistic update
      const optimisticMessage = {
        _id: tempId,
        sender: {
          _id: user._id,
          name: user.name,
          pic: user.pic,
        },
        chat: selectedChat._id,
        status: "sending",
        createdAt: new Date().toISOString(),
        article,
        type: "article_card",
      };

      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      const data = await sendArticleMessageApi(articleId, selectedChat._id);
      socket.emit("new message", data);
      setMessages((prevMessages) =>
        updateMessagesAfterSend(prevMessages, optimisticMessage._id, data)
      );
    } catch (error) {
      console.error("Error sharing bookmark:", error);
    }
  };

  useEffect(() => {
    if (socketConnected) {
      socket?.on("typing", () => setIsTyping(true));
      socket?.on("stop typing", () => setIsTyping(false));
    }

    return () => {
      socket?.emit("close chat", {
        userId: user?._id,
        chatId: selectedChat?._id,
      });
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const shouldFetchMessages = () => {
      if (!selectedChat) return false;
      if (messages.length === 0 && !messagesFetched) return true;
      if (messages.length > 0) {
        const firstMessage = messages[0];
        const isTemporaryMessage =
          typeof firstMessage._id === "string" && firstMessage._id.length > 24;
        if (!isTemporaryMessage && firstMessage.chat._id !== selectedChat._id) {
          return true;
        }
      }
      return false;
    };
    if (shouldFetchMessages()) {
      // console.log("fetching messages");
      fetchMessages();
    }
    selectedChatCompare = selectedChat;

    return () => {
      socket?.emit("close chat", {
        userId: user?._id,
        chatId: selectedChat?._id,
      });
    };
  }, [selectedChat]);

  const handleClose = () => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get("chatId");
    if (chatId) {
      navigate(`/chats`);
    }
    setHasMore(true);
    setMessagesFetched(false);
    setMessages([]);
    socket?.emit("close chat", {
      userId: user?._id,
      chatId: selectedChat?._id,
    });
    setSelectedChat(null);
  };

  // console.log(selectedChat);

  useEffect(() => {
    if (selectedChat && selectedChat.status === "rejected") {
      setFetchAgain(!fetchAgain);
      handleClose();
    }
  }, [selectedChat]);

  useEffect(() => {
    const socketEvents = {
      onTyping: () => setIsTyping(true),
      onStopTyping: () => setIsTyping(false),
      onMessageReceived: (newMessageRecieved) => {
        if (
          selectedChatCompare && // if chat is not selected or doesn't match current chat
          selectedChatCompare._id === newMessageRecieved.chat._id
        ) {
          setMessages([...messages, newMessageRecieved]);
          updateLatestMessage(newMessageRecieved.chat._id, newMessageRecieved);
          setNotification((prevNotification) => {
            return prevNotification.filter(
              (chatId) => chatId !== newMessageRecieved.chat._id.toString()
            );
          });
        } else {
          setFetchAgain(!fetchAgain);
        }
        // console.log("Message Received");
        socket?.emit("message delivered", {
          messageId: newMessageRecieved._id,
          userId: user._id,
        });
      },
      onMessageDeleted: (deletedMessageInfo) => {
        const { messageId, deleteType, chatId } = deletedMessageInfo;
        const updatedMessages = messages.map((msg) =>
          msg._id === messageId
            ? deleteType === "everyone"
              ? { ...msg, isDeleted: true }
              : { ...msg, deletedFor: [...msg.deletedFor, user._id] }
            : msg
        );
        setFetchAgain(!fetchAgain);
        setMessages(updatedMessages);
      },
      onMessageStatusUpdated: ({ messageId, status }) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, status } : msg
          )
        );
      },
      onReactionAdded: (updatedMessage) => {
        setMessages(
          messages.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      },
      onReactionRemoved: (updatedMessage) => {
        setMessages(
          messages.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      },
      userId: user?._id,
      chatId: selectedChat?._id,
    };

    socket?.emit("open chat", { userId: user?._id, chatId: selectedChat?._id });
    return handleSocketEvents(socket, socketEvents);
  });

  const MessageStatus = ({ message }) => {
    if (message.sender._id !== user._id) return null;

    switch (message.status) {
      case "sending":
        return <BsClock color="#999" size={16} />;
      case "sent":
        return <BsCheck color="#999" size={16} />;
      case "delivered":
        return <BsCheckAll color="#999" size={16} />;
      case "read":
        return <BsCheckAll color="#34B7F1" size={16} />;
      default:
        return null;
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (e.target.value === "") {
      socket?.emit("stop typing", selectedChat._id);
      setTyping(false);
      return;
    }
    if (!typing) {
      setTyping(true);
      socket?.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket?.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleClickOutside = (event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
    if (
      stickerPickerRef.current &&
      !stickerPickerRef.current.contains(event.target)
    ) {
      setShowStickerPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAccept = async () => {
    try {
      await axios.put("/api/chat/request/handle", {
        chatId: selectedChat._id,
        action: "accept",
      });
      navigate(`/chats?chatId=${selectedChat._id}`);
      setSelectedChat({ ...selectedChat, status: "accepted" });
      setFetchAgain(!fetchAgain);
      toast({
        title: "Chat request accepted",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to accept chat request",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleReject = async () => {
    try {
      await axios.put("/api/chat/request/handle", {
        chatId: selectedChat._id,
        action: "reject",
      });
      toast({
        title: "Chat request rejected",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setFetchAgain(!fetchAgain);
      handleClose(); // Close the chat
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to reject chat request",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setChatStatus(selectedChat.status);
      setShowAcceptReject(
        selectedChat.status === "pending" &&
          selectedChat.chatCreatedBy !== user._id
      );
    }
  }, [selectedChat]);

  return (
    <>
      {selectedChat && selectedChat._id ? (
        <>
          <ChatHeader
            messages={messages}
            selectedChat={selectedChat}
            user={user}
            navigate={navigate}
            istyping={istyping}
            handleClose={handleClose}
          />
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
            style={{
              backgroundColor: "#0f0d15",
              backgroundImage:
                "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
              boxShadow:
                "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
            }}
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <>
                {selectedChat.status === "pending" &&
                  selectedChat.chatCreatedBy !== user._id && (
                    <MessageRequestComponent
                      senderName={getSender(user, selectedChat.users)}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      // onBlock={handleBlock}
                    />
                  )}
                <MessageList
                  messages={messages}
                  handleDeleteMessage={handleDeleteMessage}
                  MessageStatus={MessageStatus}
                  loadMoreMessages={loadMoreMessages}
                  handleAddReaction={handleAddReaction}
                  handleRemoveReaction={handleRemoveReaction}
                  hasMore={hasMore}
                  selectedChat={selectedChat}
                />
              </>
            )}
            {(selectedChat.status === "accepted" ||
              selectedChat.chatCreatedBy === user._id) && (
              <MessageInput
                sendMessage={sendMessage}
                newMessage={newMessage}
                typingHandler={typingHandler}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                setShowStickerPicker={setShowStickerPicker}
                emojiPickerRef={emojiPickerRef}
                stickerPickerRef={stickerPickerRef}
                onEmojiClick={onEmojiClick}
                setShowBookmarksModal={setShowBookmarksModal}
                fetchBookmarks={fetchBookmarks}
              />
            )}
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text
            fontSize="2xl"
            pb={3}
            textTransform={"uppercase"}
            letterSpacing={"1px"}
          >
            Click on a user to start chatting
          </Text>
        </Box>
      )}
      <BookmarksModal
        showBookmarksModal={showBookmarksModal}
        setShowBookmarksModal={setShowBookmarksModal}
        isLoadingBookmarks={isLoadingBookmarks}
        bookmarks={bookmarks}
        handleShareBookmark={handleShareBookmark}
      />
      <DeleteMessageModal
        isOpen={isOpen}
        onClose={onClose}
        confirmDelete={confirmDelete}
      />
    </>
  );
};

export default SingleChat;
