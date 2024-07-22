import {
  Box,
  Button as ChakraButton,
  Flex,
  useToast,
  Text,
  Stack,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import GroupChatModal from "./miniComponents/GroupChatModal";
import { ChatState } from "../../contextAPI/ChatProvider";
import ChatSideDrawer from "./ChatSideDrawer";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import Button from "../miscellaneous/ButtonComponent";
import {
  getRecieverInGameName,
  getSender,
  isSenderLoggedUser,
} from "./config/ChatLogics";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";

const UserChats = ({ fetchAgain }) => {
  const { state } = useContext(AppContext);
  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    setMessagesFetched,
    setHasMore,
    setNotification,
    socket,
  } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const { data } = await axios.get("/api/chat");
      setChats(data || []);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get("chatId");

    if (chatId && chats) {
      const selectedChat = chats.find((chat) => chat?._id === chatId);
      if (selectedChat) {
        setSelectedChat(selectedChat);
      }
    }
  }, [location, chats, setSelectedChat]);

  useEffect(() => {
    setLoggedUser(state.user);
    fetchChats();
    // eslint-disable-next-line
    return () => {
      setSelectedChat(null);
    };
  }, [fetchAgain]);

  const getLatestMessageContent = (chat) => {
    if (!chat.latestMessage) return "No messages yet";

    if (chat.latestMessage.isDeleted) {
      return "This message was deleted";
    }

    if (
      chat?.latestMessage?.deletedFor &&
      chat?.latestMessage?.deletedFor.includes(loggedUser?._id)
    ) {
      return "This message was deleted for you";
    }

    return chat.latestMessage.content
      ? chat.latestMessage.content.length > 50
        ? chat.latestMessage.content.substring(0, 51) + "..."
        : chat.latestMessage.content
      : chat.latestMessage.type === "article_card"
      ? "Shared an Article"
      : "Score Card";
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setHasMore(true);
    setMessagesFetched(false);

    // Only update latestMessage if it exists
    if (chat.latestMessage) {
      setChats((prevChats) => {
        return prevChats?.map((c) => {
          if (c._id === chat._id) {
            return {
              ...c,
              latestMessage: {
                ...c.latestMessage,
                readBy: [...(c.latestMessage.readBy || []), user._id],
              },
            };
          }
          return c;
        });
      });
    }

    setNotification((prev) => prev.filter((c) => c !== chat._id));
  };
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      w={"100%"}
      h={"91.5vh"}
      borderRadius="lg"
      style={{
        backgroundImage:
          "linear-gradient(-180deg, #201c2e, #13101d 88%, #13101d 99%)",
        boxShadow:
          "inset 0 0 10px rgba(255, 255, 255, 0.05), 0 4px 10px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Box
        pb={3}
        px={3}
        display="flex"
        w="100%"
        justifyContent={{ base: "column", md: "space-between" }}
        alignItems="center"
      >
        <Flex>{user && <ChatSideDrawer />}</Flex>
        {/* <GroupChatModal>
          <Flex position={"relative"}>
            <Button pl={"1.5rem"} textColor={"white"} buttonW="150px">
              New Group
            </Button>
            <Flex position={"absolute"} left={4} top={"0.4rem"}>
              <AddIcon w={"0.75rem"} />
            </Flex>
          </Flex>
        </GroupChatModal> */}
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        // bg="#F8F8F8"
        style={{
          backgroundColor: "#0f0d15",
          backgroundImage:
            "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
          boxShadow:
            "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
        }}
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack>
            {Array.isArray(chats) &&
              chats.map((chat) => {
                const readByLoggedUser = chat.latestMessage
                  ? chat.latestMessage.readBy.includes(user?._id) ||
                    chat.latestMessage.sender._id.toString() ===
                      user?._id.toString()
                  : true; // Consider empty chats as "read"
                // console.log(selectedChat);
                return (
                  <Box
                    onClick={() => handleChatClick(chat)}
                    cursor="pointer"
                    bg={
                      selectedChat &&
                      selectedChat._id &&
                      selectedChat?._id.toString() === chat?._id.toString()
                        ? "#2D3748" // New background color for selected chat
                        : "#0f0d15"
                    }
                    color={"white"}
                    boxShadow={
                      "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
                    }
                    px={3}
                    py={2}
                    my={1}
                    borderRadius="lg"
                    key={chat._id}
                  >
                    <Flex
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
                      <Flex gap={2}>
                        <Text
                          fontWeight={readByLoggedUser ? "normal" : "bold"}
                          m={0}
                        >
                          {chat._id &&
                          !chat.isGroupChat &&
                          chat.users &&
                          chat.users.length > 0
                            ? getSender(loggedUser, chat.users)
                            : chat.chatName}
                        </Text>
                        {chat.new && (
                          <Badge colorScheme="green" h={"50%"} mt={1}>
                            New
                          </Badge>
                        )}
                      </Flex>
                      <Text
                        m={0}
                        fontSize="xs"
                        color={readByLoggedUser ? "#9CAFAA" : "white"}
                      >
                        {chat._id &&
                        !chat.isGroupChat &&
                        chat.users &&
                        chat.users.length > 0
                          ? getRecieverInGameName(loggedUser, chat.users)
                          : null}
                      </Text>
                    </Flex>
                    {chat._id && chat.latestMessage && (
                      <Text
                        fontSize="xs"
                        color={readByLoggedUser ? "#9CAFAA" : "white"}
                        display={"flex"}
                        alignItems={"center"}
                        fontWeight={readByLoggedUser ? "normal" : "bold"}
                      >
                        {isSenderLoggedUser(
                          loggedUser,
                          chat.latestMessage.sender
                        )
                          ? "YOU"
                          : chat.latestMessage.sender.name}{" "}
                        {": "}
                        {getLatestMessageContent(chat)}
                        {!readByLoggedUser && (
                          <Badge
                            colorScheme="blue"
                            borderRadius={"50%"}
                            h={"8px"}
                            w={"8px"}
                            top={"58%"}
                            right={"10%"}
                            marginLeft={"1rem"}
                          />
                        )}
                      </Text>
                    )}
                  </Box>
                );
              })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default UserChats;
