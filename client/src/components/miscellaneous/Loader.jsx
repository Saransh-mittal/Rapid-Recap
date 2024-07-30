import React from "react";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

const Loader = ({ message = "Loading content..." }) => {
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text fontSize="lg" fontWeight="medium" color="gray.600">
          {message}
        </Text>
      </VStack>
    </Box>
  );
};

export default Loader;
