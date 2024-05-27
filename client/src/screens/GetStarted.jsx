import React from "react";
import { Box, Flex, Image, Text, VStack, HStack, Link } from "@chakra-ui/react";

const GetStarted = () => {
  return (
    <Box marginTop={"6rem"}>
      {/* Section 1: Quote on left with an image on right */}
      <Flex>
        <Box>
          <Text as="h2">Quote</Text>
          <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
        </Box>
        <Box>
          <Image src="path/to/image" alt="Quote Image" />
        </Box>
      </Flex>

      {/* Section 2: Why to use it? */}
      <Box>
        <Text as="h2">Why to use it?</Text>
        <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
      </Box>

      {/* Section 3: People reviews in cards format */}
      <Box>
        <Text as="h2">People Reviews</Text>
        <HStack spacing={4}>
          {/* Review Card 1 */}
          <VStack>
            <Image src="path/to/avatar1" alt="Avatar 1" />
            <Text>Review 1</Text>
          </VStack>

          {/* Review Card 2 */}
          <VStack>
            <Image src="path/to/avatar2" alt="Avatar 2" />
            <Text>Review 2</Text>
          </VStack>

          {/* Review Card 3 */}
          <VStack>
            <Image src="path/to/avatar3" alt="Avatar 3" />
            <Text>Review 3</Text>
          </VStack>
        </HStack>
      </Box>

      {/* Section 4: Footer with social media handles */}
      <Box as="footer">
        <Text as="h2">Follow Us</Text>
        <HStack spacing={4}>
          <Link href="https://www.facebook.com">Facebook</Link>
          <Link href="https://www.twitter.com">Twitter</Link>
          <Link href="https://www.instagram.com">Instagram</Link>
        </HStack>
      </Box>
    </Box>
  );
};

export default GetStarted;
