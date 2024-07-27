import React from "react";
import { Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSenderFull } from "../../config/ChatLogics";
import UpdateGroupChatModal from "../UpdateGroupChatModal";
import greaterThan from "/images/greaterThan.png";

const ChatHeader = ({
  messages,
  selectedChat,
  user,
  navigate,
  istyping,
  handleClose,
}) => {
  return (
    <Flex
      fontSize={{ base: "28px", md: "30px" }}
      pb={3}
      px={2}
      w="100%"
      display="flex"
      justifyContent={{ base: "center" }}
      alignItems="center"
      position={"relative"}
    >
      <IconButton
        position={"absolute"}
        left={0}
        icon={<ArrowBackIcon />}
        onClick={handleClose}
      />
      {messages &&
        (!selectedChat.isGroupChat ? (
          <>
            <Flex
              gap={4}
              p={1}
              pl={3}
              _hover={{
                cursor: "pointer",
                borderRadius: "lg",
                bg: "linear-gradient(-180deg, rgba(32, 28, 46, 0.8), rgba(19, 16, 29, 0.8) 88%, rgba(19, 16, 29, 0.8) 99%)",
                boxShadow:
                  "inset 0 0 15px rgba(255, 255, 255, 0.1), 0 6px 15px rgba(0, 0, 0, 0.4), 0 12px 30px rgba(0, 0, 0, 0.3)",
              }}
              onClick={() => {
                navigate(
                  `/profile/${
                    getSenderFull(user, selectedChat.users).inGameName
                  }`
                );
              }}
              justifyContent={"center"}
              alignItems={"center"}
              w={"35%"}
            >
              <Flex>
                <Image
                  borderRadius="full"
                  boxSize={{ base: "35px", md: "45px" }}
                  src={getSenderFull(user, selectedChat.users).pic}
                  alt={getSenderFull(user, selectedChat.users).name}
                />
              </Flex>
              <Flex flexDirection={"column"}>
                <Flex>
                  <Text
                    fontSize={{ base: "1.2rem", md: "1.5rem" }}
                    mb={{ base: 0, md: "5px" }}
                    textColor={"white"}
                  >
                    {getSenderFull(user, selectedChat.users).name}
                  </Text>
                </Flex>
                <Text
                  fontSize={{ base: "0.75rem", md: "0.85rem" }}
                  m={0}
                  mt={{ base: "0", md: -2 }}
                  textColor={"#9CAFAA"}
                >
                  {getSenderFull(user, selectedChat.users).inGameName}
                </Text>
              </Flex>
              <Flex ml={-3} alignItems={"center"} mb={5}>
                <Image
                  borderRadius="full"
                  boxSize={{ base: "15px", md: "20px" }}
                  src={greaterThan}
                  alt={"greaterThan"}
                  onClick={() => {
                    navigate(`/chats/${selectedChat._id}`);
                  }}
                ></Image>
              </Flex>
            </Flex>
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
  );
};

export default ChatHeader;
