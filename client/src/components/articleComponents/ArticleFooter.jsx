import { Flex, Text, Box, Divider } from '@chakra-ui/react'
import React from 'react'
// hello
const ArticleFooter = () => {
  return (
    <Box as="footer" mt={8} mb={1}>
      <Flex
        alignItems="center"
        justifyContent="center"
        px={4}
        py={3}
        bg="whiteAlpha.100"
        borderRadius="md"
        border="1px solid"
        borderColor="whiteAlpha.200"
      >
        <Text
          fontSize="sm"
          color="whiteAlpha.700"
          fontStyle="italic"
          textAlign="center"
          lineHeight="1.5"
        >
          Disclaimer: Articles are AI-enhanced for educational purposes while
          maintaining factual accuracy
        </Text>
      </Flex>
    </Box>
  )
}

export default ArticleFooter
