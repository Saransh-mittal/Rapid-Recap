import React from "react";
import { Box, Text, Button, VStack, HStack } from "@chakra-ui/react";

const MessageRequestComponent = ({ senderName, onAccept, onReject }) => {
  return (
    <Box
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="lg"
      p={6}
      textAlign="center"
      color="white"
      maxW="300px"
      mx="auto"
      my={4}
    >
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          Accept message request from {senderName}?
        </Text>
        <Text fontSize="sm">
          If you accept this request, you will be able to see the messages and
          activities from this user.
        </Text>
        <HStack spacing={4} width="100%">
          <Button colorScheme="red" onClick={onReject} flexGrow={1}>
            Reject
          </Button>
          <Button colorScheme="green" onClick={onAccept} flexGrow={1}>
            Accept
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default MessageRequestComponent;
