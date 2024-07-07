import { Box } from "@chakra-ui/react";
import React from "react";

const UserChatBox = ({ selectedChat, fetchAgain, setFetchAgain }) => {
  return (
    <Box
      //   display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {/* <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> */}
    </Box>
  );
};

export default UserChatBox;
