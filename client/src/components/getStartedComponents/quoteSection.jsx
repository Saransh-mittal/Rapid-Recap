import React from "react";
import { Box, Heading, Text, Image, Flex } from "@chakra-ui/react";

const quoteSection = () => {
  return (
    <Flex align="center" justify="space-between" mb={8}>
      <Box maxW="50%">
        <Heading as="h2" size="lg" mb={4}>
          Quote
        </Heading>
        <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
      </Box>
      <Box>
        <Image
          src="path/to/image"
          alt="Quote Image"
          boxSize="300px"
          objectFit="cover"
        />
      </Box>
    </Flex>
  );
};

export default quoteSection;
