import { Box, Flex } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import ChatSideDrawer from "../components/chatComponent/ChatSideDrawer";
import UserChats from "../components/chatComponent/userChats";
import UserChatBox from "../components/chatComponent/userChatBox";
// import { AppContext } from "../contextAPI/appContext";
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
      }}
    >
      <Box
        display="flex"
        // justifyContent="space-between"
        justifyContent={"center"}
        w="100%"
        h="91.5vh"
        p="10px"
      >
        <Flex
          display={{ base: !selectedChat ? "flex" : "none", md: "flex" }}
          flexDirection={"column"}
          w={{ base: "100%", md: "60%" }}
          mr={{ base: 0, md: 10 }}
        >
          {/* {user && <ChatSideDrawer />} */}
          {user && <UserChats fetchAgain={fetchAgain} />}
        </Flex>
        <Flex
          display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
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
