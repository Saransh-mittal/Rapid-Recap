import {
  Box,
  Button as ChakraButton,
  Flex,
  useToast,
  Text,
  Stack,
  Avatar,
  Badge,
  Heading,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { ChatState } from "../../contextAPI/ChatProvider";
import ChatSideDrawer from "./ChatSideDrawer";
import ChatLoading from "./ChatLoading";
import {
  getRecieverInGameName,
  getSender,
  isSenderLoggedUser,
} from "./config/ChatLogics";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import Button from "../miscellaneous/ButtonComponent";

const UserChats = ({ fetchAgain }) => {
  const { state } = useContext(AppContext);
  const [loggedUser, setLoggedUser] = useState();
  const [showRequestsTab, setShowRequestsTab] = useState(false);

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    setMessagesFetched,
    setHasMore,
    setNotification,
    chatRequests,
    setChatRequests,
    socket,
  } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const { data } = await axios.get("/api/chat");
      setChats(
        data.filter(
          (chat) =>
            chat.status === "accepted" ||
            chat.chatCreatedBy.toString() === user._id.toString()
        ) || []
      );
      setChatRequests(
        data.filter(
          (chat) =>
            chat.status === "pending" &&
            chat.chatCreatedBy.toString() !== user._id.toString()
        ) || []
      );
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

  const handleChatRequest = async (chatId, action) => {
    try {
      await axios.put("/api/chat/request/handle", { chatId, action });
      fetchChats();

      toast({
        title: `Request ${action}ed`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: `Failed to ${action} chat request`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
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

  const renderChatItem = (chat) => (
    <Box
      onClick={() => handleChatClick(chat)}
      cursor={"pointer"}
      bg={
        selectedChat &&
        selectedChat._id &&
        selectedChat?._id.toString() === chat?._id.toString()
          ? "#2D3748"
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
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Flex gap={2}>
          <Text>
            {chat._id &&
            !chat.isGroupChat &&
            chat.users &&
            chat.users.length > 0
              ? getSender(loggedUser, chat.users)
              : chat.chatName}
          </Text>
          {chat.status === "pending" &&
            chat.chatCreatedBy !== loggedUser._id && (
              <Badge colorScheme="yellow">New Request</Badge>
            )}
          {chat.status === "rejected" && (
            <Badge colorScheme="red">Rejected</Badge>
          )}
          {chat.new && <Badge colorScheme="green">New</Badge>}
        </Flex>
        <Text fontSize="xs" color="#9CAFAA">
          {chat._id && !chat.isGroupChat && chat.users && chat.users.length > 0
            ? getRecieverInGameName(loggedUser, chat.users)
            : null}
        </Text>
      </Flex>
      {/* {isRequest && (
        <Flex mt={2} justifyContent="flex-end">
          <Button
            size="sm"
            colorScheme="green"
            mr={2}
            onClick={() => handleChatRequest(chat._id, "accept")}
          >
            Accept
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            onClick={() => handleChatRequest(chat._id, "reject")}
          >
            Reject
          </Button>
        </Flex>
      )} */}
      {chat._id && chat.latestMessage && (
        <Text fontSize="xs" color="#9CAFAA">
          {isSenderLoggedUser(loggedUser, chat.latestMessage.sender)
            ? "YOU"
            : chat.latestMessage.sender.name}{" "}
          {": "}
          {getLatestMessageContent(chat)}
        </Text>
      )}
    </Box>
  );

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      w={"100%"}
      h={"100%"}
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
        <Button
          onClick={() => setShowRequestsTab(!showRequestsTab)}
          white={showRequestsTab ? true : false}
        >
          {showRequestsTab ? "Chats" : "Requests"}
        </Button>
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
        h="90%"
        borderRadius="lg"
        overflowY="hidden"
      >
        <Heading size={"md"} pl={"5px"}>
          {showRequestsTab ? "Requests" : "Chats"}
        </Heading>
        {showRequestsTab ? (
          <Stack
            overflowY="auto"
            css={{ "&::-webkit-scrollbar": { display: "none" } }}
          >
            {chatRequests.map((chat) => renderChatItem(chat, true))}
          </Stack>
        ) : chats ? (
          <Stack
            overflowY="auto"
            css={{ "&::-webkit-scrollbar": { display: "none" } }}
          >
            {chats.map((chat) => renderChatItem(chat))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default UserChats;
