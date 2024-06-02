import React from "react";
import { Box, Heading, HStack, Link } from "@chakra-ui/react";

const FooterSection = () => {
  return (
    <Box as="footer" pt={4} borderTopWidth={1} textAlign="center">
      <Heading as="h2" size="lg" mb={4}>
        Follow Us
      </Heading>
      <HStack spacing={4} justify="center">
        <Link href="https://www.facebook.com" isExternal>
          Facebook
        </Link>
        <Link href="https://www.twitter.com" isExternal>
          Twitter
        </Link>
        <Link href="https://www.instagram.com" isExternal>
          Instagram
        </Link>
      </HStack>
    </Box>
  );
};

export default FooterSection;
