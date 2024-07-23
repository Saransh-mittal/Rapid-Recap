import { Box, Flex } from "@chakra-ui/react";
import React, { useState } from "react";
import UserChats from "../components/chatComponent/userChats";
import UserChatBox from "../components/chatComponent/userChatBox";
import { ChatState } from "../contextAPI/ChatProvider";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, selectedChat } = ChatState();
  return (
    <div
      style={{
        marginTop: "5rem",
        width: "100%",
        color: "b",
        overflow: "hidden",
      }}
    >
      <Box display="flex" justifyContent={"center"} w="100%" h="87vh" p="10px">
        <Flex
          display={{ base: !selectedChat ? "flex" : "none", lg: "flex" }}
          flexDirection={"column"}
          w={{ base: "100%", md: "60%" }}
          mr={{ base: 0, md: 10 }}
          h={"100%"}
        >
          {user && <UserChats fetchAgain={fetchAgain} />}
        </Flex>
        <Flex
          display={{ base: selectedChat ? "flex" : "none", lg: "flex" }}
          w={"100%"}
          className="userChatBox"
        >
          {user && (
            <UserChatBox
              selectedChat={selectedChat}
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          )}
        </Flex>
      </Box>
    </div>
  );
};

export default ChatPage;
