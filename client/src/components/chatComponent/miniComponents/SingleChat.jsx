import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "../styles.css";
import {
  IconButton,
  Spinner,
  useToast,
  Flex,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Image,
  Grid,
} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { ChatState } from "../../../contextAPI/ChatProvider";
import {
  BsBookmarkFill,
  BsCheck,
  BsCheckAll,
  BsClock,
  BsEmojiSmile,
  BsStickiesFill,
} from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { useNavigate } from "react-router-dom";
import greaterThan from "/images/greaterThan.png";
import ArticleCard from "../../miscellaneous/ArticleCard";

var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const toast = useToast();
  const emojiPickerRef = useRef(null);
  const stickerPickerRef = useRef(null);
  const [page, setPage] = useState(1);
  const [deleteInfo, setDeleteInfo] = useState({ messageId: null, type: null });
  const navigate = useNavigate();
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

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

      const { data } = await axios.get(`/api/message/${selectedChat._id}`);
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
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}?page=${page}&limit=20`
      );
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
      await axios.put(`/api/message/readby/${messageId}`);
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
      const tempId = Date.now().toString(); // Temporary ID for optimistic update
      const optimisticMessage = {
        _id: tempId,
        sender: {
          _id: user._id,
          name: user.name,
          pic: user.pic,
        },
        content: newMessage,
        chat: selectedChat._id,
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      const currentNewMessage = newMessage;
      setNewMessage(""); // Clear input immediately
      try {
        const { data } = await axios.post("/api/message", {
          content: currentNewMessage,
          chatId: selectedChat._id,
        });

        socket?.emit("new message", data);

        setMessages((prevMessages) =>
          prevMessages.find((msg) => msg._id === data._id)
            ? prevMessages
            : prevMessages.map((msg) =>
                msg._id === tempId ? { ...data, status: "sent" } : msg
              )
        );

        // Update latest message and sort chats
        updateLatestMessage(selectedChat._id, data);
      } catch (error) {
        // Handle error: remove optimistic message and show error toast
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== tempId)
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
      await axios.delete(`/api/message/permanentdelete/${messageId}`);
      let updatedMessages = messages;
      setMessages((prevMessages) => {
        return (updatedMessages = prevMessages.filter(
          (msg) => msg._id !== messageId
        ));
      });
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
      await axios.delete(`/api/message/${messageId}`, {
        data: { deleteType: type },
      });
      let updatedMessages = messages;
      setMessages((prevMessages) => {
        return (updatedMessages = prevMessages.map((msg) =>
          msg._id === messageId
            ? type === "everyone"
              ? { ...msg, isDeleted: true }
              : { ...msg, deletedFor: [...msg.deletedFor, user._id] }
            : msg
        ));
      });
      // Find the new latest message
      const newLatestMessage = updatedMessages
        .filter((msg) => !msg.isDeleted && !msg.deletedFor.includes(user._id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      // Update the latest message in the chat state
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
      const { data } = await axios.post(`/api/message/reaction/${messageId}`, {
        emoji,
      });
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

  const handleRemoveReaction = async (messageId, userId) => {
    try {
      const { data } = await axios.delete(`/api/message/reaction/${messageId}`);
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
      const response = await axios.get("/api/user/getBookmarks");
      setBookmarks(response.data.bookmarks);
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
      console.log(article);
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      const { data } = await axios.post("/api/message", {
        type: "article_card",
        chatId: selectedChat._id,
        articleId,
      });

      socket.emit("new message", data);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempId ? { ...data, status: "sent" } : msg
        )
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
        // Check if the first message is not a temporary message
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
      console.log("fetching messages");
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

  useEffect(() => {
    socket?.on("message recieved", (newMessageRecieved) => {
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
      socket?.emit("message delivered", {
        messageId: newMessageRecieved._id,
        userId: user._id,
      });
    });
    socket?.on("message deleted", (deletedMessageInfo) => {
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
      console.log("Message Deleted");
    });

    socket?.on("message status updated", ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });
    socket?.on("reaction added", (updatedMessage) => {
      setMessages(
        messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    socket?.on("reaction removed", (updatedMessage) => {
      setMessages(
        messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    socket?.emit("open chat", { userId: user?._id, chatId: selectedChat?._id });
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

  return (
    <>
      {selectedChat && selectedChat._id ? (
        <>
          <Flex
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            position={"relative"}
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => {
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
              }}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  <Flex
                    gap={4}
                    p={1}
                    pl={3}
                    _hover={{
                      cursor: "pointer",
                      borderRadius: "lg",
                      bg: "linear-gradient(-180deg, rgba(32, 28, 46, 0.8), rgba(19, 16, 29, 0.8) 88%, rgba(19, 16, 29, 0.8) 99%)",
                      boxShadow:
                        "inset 0 0 15px rgba(255, 255, 255, 0.1), 0 6px 15px rgba(0, 0, 0, 0.4), 0 12px 30px rgba(0, 0, 0, 0.3)",
                    }}
                    onClick={() => {
                      navigate(
                        `/profile/${
                          getSenderFull(user, selectedChat.users).inGameName
                        }`
                      );
                    }}
                    justifyContent={"center"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    <Flex>
                      <Image
                        borderRadius="full"
                        boxSize={{ base: "35px", md: "45px" }}
                        src={getSenderFull(user, selectedChat.users).pic}
                        alt={getSenderFull(user, selectedChat.users).name}
                      />
                    </Flex>
                    <Flex flexDirection={"column"}>
                      <Flex>
                        <Text
                          fontSize={{ base: "1.2rem", md: "1.5rem" }}
                          mb={{ base: 0, md: "5px" }}
                        >
                          {getSenderFull(user, selectedChat.users).name}
                        </Text>
                      </Flex>
                      <Text
                        fontSize={{ base: "0.75rem", md: "0.85rem" }}
                        m={0}
                        mt={{ base: "0", md: -2 }}
                        textColor={"#9CAFAA"}
                      >
                        {getSenderFull(user, selectedChat.users).inGameName}
                      </Text>
                    </Flex>
                    <Flex ml={-3} alignItems={"center"} mb={5}>
                      <Image
                        borderRadius="full"
                        boxSize={{ base: "15px", md: "20px" }}
                        src={greaterThan}
                        alt={"greaterThan"}
                        onClick={() => {
                          navigate(`/chats/${selectedChat._id}`);
                        }}
                      ></Image>
                    </Flex>
                  </Flex>

                  {/* <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  /> */}
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
            {istyping && (
              <Text
                fontSize="xs"
                color="#05f03c"
                position={"absolute"}
                bottom={"-1rem"}
                left={"47%"}
              >
                is typing...
              </Text>
            )}
          </Flex>

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
                "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
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
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              <Flex position="relative" alignItems="center">
                <IconButton
                  icon={<BsEmojiSmile />}
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowStickerPicker(false);
                  }}
                  // variant="ghost"
                  border={"1px solid white"}
                  background={"transparent"}
                  color={"white"}
                  _hover={{ background: "#38B2AC", color: "white" }}
                />
                <IconButton
                  icon={<BsBookmarkFill />}
                  onClick={() => {
                    setShowBookmarksModal(true);
                    fetchBookmarks();
                  }}
                  bg="transparent"
                  border="1px solid white"
                  color="white"
                  _hover={{ bg: "#38B2AC", color: "white" }}
                  ml={2}
                />
                {showEmojiPicker && (
                  <Box
                    position="absolute"
                    bottom="60px"
                    left="0"
                    zIndex={1}
                    ref={emojiPickerRef}
                  >
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      emojiStyle={"facebook"}
                      theme={"dark"}
                    />
                  </Box>
                )}
                <Input
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  ml={2}
                />
              </Flex>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
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

      {/* Bookmarks Modal */}
      <Modal
        isOpen={showBookmarksModal}
        onClose={() => setShowBookmarksModal(false)}
        size={{ base: "full", md: "xl", lg: "3xl", xl: "4xl" }}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          bg="#0f0d15"
          bgGradient="linear(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        >
          <ModalHeader color="#ffffff">Share Bookmarked Article</ModalHeader>
          <ModalCloseButton color="#ffffff" />
          <ModalBody
            w="100%"
            css={{ "&::-webkit-scrollbar": { display: "none" } }}
          >
            <Grid
              templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
              gap="20px"
            >
              {isLoadingBookmarks
                ? Array.from({ length: 6 }).map((_, index) => (
                    <ArticleCard key={index} isLoading={true} />
                  ))
                : bookmarks.map((bookmark) => (
                    <ArticleCard
                      key={bookmark._id}
                      article={bookmark}
                      onClick={() =>
                        handleShareBookmark(bookmark._id, bookmark)
                      }
                    />
                  ))}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* delete message modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this message for everyone?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={confirmDelete}>
              Delete for Everyone
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SingleChat;
