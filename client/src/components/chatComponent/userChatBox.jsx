import { Box } from "@chakra-ui/react";
import React from "react";
import "./styles.css";
import SingleChat from "./miniComponents/SingleChat";

const UserChatBox = ({ selectedChat, fetchAgain, setFetchAgain }) => {
  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      p={3}
      // bg="white"
      w={{ base: "100%", md: "95%" }}
      borderRadius="lg"
      // borderWidth="1px"
      style={{
        backgroundImage:
          "linear-gradient(-180deg, #201c2e, #13101d 88%, #13101d 99%)",
        boxShadow:
          "inset 0 0 10px rgba(255, 255, 255, 0.05), 0 4px 10px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)",
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default UserChatBox;
