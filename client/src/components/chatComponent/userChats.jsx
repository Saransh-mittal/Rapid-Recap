import {
  Box,
  Button as ChakraButton,
  Flex,
  useToast,
  Text,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import GroupChatModal from "./miniComponents/GroupChatModal";
import { ChatState } from "../../contextAPI/ChatProvider";
import ChatSideDrawer from "./ChatSideDrawer";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import Button from "../miscellaneous/ButtonComponent";

const currentUser = {
  _id: "user1",
  name: "Current User",
  email: "currentuser@example.com",
};

// Mock chat data
const mockChats = [
  {
    _id: "chat1",
    chatName: "John Doe",
    isGroupChat: false,
    users: [
      { _id: "user1", name: "Current User" },
      { _id: "user2", name: "John Doe" },
    ],
    latestMessage: {
      sender: { _id: "user2", name: "John Doe" },
      content: "Hey, how are you?",
    },
  },
  {
    _id: "chat2",
    chatName: "Jane Smith",
    isGroupChat: false,
    users: [
      { _id: "user1", name: "Current User" },
      { _id: "user3", name: "Jane Smith" },
    ],
    latestMessage: {
      sender: { _id: "user1", name: "Current User" },
      content: "Looking forward to our meeting tomorrow!",
    },
  },
  {
    _id: "chat3",
    chatName: "Project Team",
    isGroupChat: true,
    users: [
      { _id: "user1", name: "Current User" },
      { _id: "user2", name: "John Doe" },
      { _id: "user3", name: "Jane Smith" },
      { _id: "user4", name: "Bob Johnson" },
    ],
    latestMessage: {
      sender: { _id: "user4", name: "Bob Johnson" },
      content:
        "I've updated the project timeline. Please review when you get a chance.",
    },
  },
];

const UserChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(currentUser);

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChats(mockChats);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
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
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#0f0d15"}
                // color={selectedChat === chat ? "white" : "black"}
                color={"white"}
                // backgroundImage={
                //   "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                // }
                boxShadow={
                  "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
                }
                px={3}
                py={2}
                my={1}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default UserChats;
