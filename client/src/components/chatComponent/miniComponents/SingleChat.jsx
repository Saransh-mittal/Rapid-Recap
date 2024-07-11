import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "../styles.css";
import {
  IconButton,
  Spinner,
  useToast,
  Flex,
  FormControl,
} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";

import io from "socket.io-client";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import { ChatState } from "../../../contextAPI/ChatProvider";
import { BsEmojiSmile, BsStickiesFill } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import StickerPicker from "./StickerPicker";
const ENDPOINT = "http://localhost:3000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const toast = useToast();
  const emojiPickerRef = useRef(null);
  const stickerPickerRef = useRef(null);

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    setChats,
  } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await axios.get(`/api/message/${selectedChat._id}`);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        setNewMessage("");
        const { data } = await axios.post("/api/message", {
          content: newMessage,
          chatId: selectedChat,
        });
        socket.emit("new message", data);
        setMessages([...messages, data]);

        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) => {
            if (chat._id === data.chat._id) {
              return { ...chat, latestMessage: data };
            }
            return chat;
          });

          // Sort chats to bring the one with the new message to the top
          return updatedChats.sort((a, b) => {
            const aTime = a.latestMessage
              ? new Date(a.latestMessage.createdAt).getTime()
              : 0;
            const bTime = b.latestMessage
              ? new Date(b.latestMessage.createdAt).getTime()
              : 0;
            return bTime - aTime;
          });
        });
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === newMessageRecieved.chat._id) {
            return { ...chat, latestMessage: newMessageRecieved };
          }
          return chat;
        });

        // Sort chats to bring the one with the new message to the top
        return updatedChats.sort((a, b) => {
          const aTime = a.latestMessage
            ? new Date(a.latestMessage.createdAt).getTime()
            : 0;
          const bTime = b.latestMessage
            ? new Date(b.latestMessage.createdAt).getTime()
            : 0;
          return bTime - aTime;
        });
      });
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (e.target.value === "") {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
      return;
    }
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const onStickerSelect = (stickerUrl) => {
    setNewMessage((prevMessage) => prevMessage + ` [sticker:${stickerUrl}] `);
    setShowStickerPicker(false);
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
      {selectedChat ? (
        <>
          <Flex
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            position={"relative"}
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
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
                <ScrollableChat messages={messages} />
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
                  icon={<BsStickiesFill />}
                  onClick={() => {
                    setShowStickerPicker(!showStickerPicker);
                    setShowEmojiPicker(false);
                  }}
                  background={"transparent"}
                  border={"1px solid white"}
                  color={"white"}
                  _hover={{ background: "#38B2AC", color: "white" }}
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
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </Box>
                )}
                {showStickerPicker && (
                  <Box
                    position="absolute"
                    bottom="60px"
                    left="0"
                    zIndex={1}
                    ref={stickerPickerRef}
                  >
                    <StickerPicker onStickerSelect={onStickerSelect} />
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
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
