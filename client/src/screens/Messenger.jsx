import { Box, Flex } from "@chakra-ui/react";
import React, { useContext } from "react";
import ChatSideDrawer from "../components/messengerCompoent/ChatSideDrawer";
import UserChats from "../components/messengerCompoent/userChats";
import UserChatBox from "../components/messengerCompoent/userChatBox";
import { AppContext } from "../contextAPI/appContext";

const Messenger = () => {
  const { state, dispatch } = useContext(AppContext);
  const isUserLoggedIn = !state.show;
  return (
    <Flex mt={"6rem"} w={"100%"}>
      {isUserLoggedIn && <ChatSideDrawer />}

      <Box>
        {isUserLoggedIn && <UserChats />}
        {isUserLoggedIn && <UserChatBox />}
      </Box>
    </Flex>
  );
};

export default Messenger;
