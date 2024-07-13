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

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const { data } = await axios.get("/api/chat");
      setChats(data);
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
    setLoggedUser(state.user);
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const getLatestMessageContent = (chat) => {
    if (!chat.latestMessage) return "";

    if (chat.latestMessage.isDeleted) {
      return "This message was deleted";
    }

    if (
      chat?.latestMessage?.deletedFor &&
      chat?.latestMessage?.deletedFor.includes(loggedUser._id)
    ) {
      return "This message was deleted for you";
    }

    return chat.latestMessage.content.length > 50
      ? chat.latestMessage.content.substring(0, 51) + "..."
      : chat.latestMessage.content;
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
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent={{ base: "column", md: "space-between" }}
        alignItems="center"
      >
        <Flex>{user && <ChatSideDrawer />}</Flex>
        <GroupChatModal>
          <Flex position={"relative"}>
            <Button pl={"1.5rem"} textColor={"white"} buttonW="150px">
              New Group
            </Button>
            <Flex position={"absolute"} left={4} top={"0.4rem"}>
              <AddIcon w={"0.75rem"} />
            </Flex>
          </Flex>
        </GroupChatModal>
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
            {chats.map((chat) => {
              const readByLoggedUser =
                chat.latestMessage?.readBy.includes(user._id) ||
                chat.latestMessage.sender._id.toString() ===
                  user._id.toString();

              return (
                <Box
                  onClick={() => {
                    setSelectedChat(chat);
                    setChats((prevChats) => {
                      return prevChats.map((c) => {
                        if (c._id === chat._id) {
                          return {
                            ...c,
                            latestMessage: {
                              ...c.latestMessage,
                              readBy: [...c.latestMessage.readBy, user._id],
                            },
                          };
                        }
                        return c;
                      });
                    });
                  }}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : "#0f0d15"}
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
                      <Text fontWeight={readByLoggedUser ? "normal" : "bold"}>
                        {!chat.isGroupChat
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
                      fontSize="xs"
                      color={readByLoggedUser ? "#9CAFAA" : "white"}
                    >
                      {!chat.isGroupChat
                        ? getRecieverInGameName(loggedUser, chat.users)
                        : null}
                    </Text>
                  </Flex>
                  {chat.latestMessage && (
                    <Text
                      fontSize="xs"
                      color={readByLoggedUser ? "#9CAFAA" : "white"}
                      display={"flex"}
                      alignItems={"center"}
                      fontWeight={readByLoggedUser ? "normal" : "bold"}
                    >
                      {isSenderLoggedUser(loggedUser, chat.latestMessage.sender)
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
