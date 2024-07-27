// src/components/chat/MessageReactions.js
import React from "react";
import { Flex, Box, Text, Tooltip } from "@chakra-ui/react";
import { Emoji } from "emoji-picker-react";

const MessageReactions = ({
  message,
  isSameLoggedUser,
  handleReactionClick,
}) => {
  if (!message.reactions || message.reactions.length === 0) return null;

  const distinctReactions = message.reactions.reduce((acc, reaction) => {
    if (!acc.find((r) => r.emoji === reaction.emoji)) {
      acc.push(reaction);
    }
    return acc;
  }, []);

  return (
    <Flex
      flexWrap="wrap"
      position={"absolute"}
      right={isSameLoggedUser ? "0" : ""}
      left={!isSameLoggedUser ? "0" : ""}
      bottom={"-0.9rem"}
      bg={"rgba(42, 36, 64, 0.7)"}
      px={2}
      gap={1}
      borderRadius={"20px"}
      backdropFilter={"blur(5px)"} // Added blur effect for better visibility
      boxShadow={"0 2px 4px rgba(0, 0, 0, 0.2)"} // Subtle shadow for depth
      onClick={() => handleReactionClick(message)}
      zIndex={1}
    >
      {distinctReactions.map((reaction, index) => (
        <Tooltip key={index} label={reaction.user.name} placement="bottom">
          <Box borderRadius="full" py={1} fontSize="md" cursor="pointer">
            <Emoji unified={reaction.emoji} size="15" />
          </Box>
        </Tooltip>
      ))}
      {message.reactions.length > 1 && (
        <Text m={0} fontSize={"sm"} mt={"2px"} ml={"2px"} color={"#9CAFAA"}>
          {message.reactions.length}
        </Text>
      )}
    </Flex>
  );
};

export default MessageReactions;
