import { Box, Flex } from "@chakra-ui/react";
import TagLine from "./TaglineComponent";

const Heading = ({ className, title, text, tag }) => {
  return (
    <Flex
      maxWidth="50rem"
      marginX="auto"
      marginBottom={{ base: "12", lg: "20" }}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      textAlign="center"
      className={className}
    >
      {tag && (
        <Box textAlign="center" marginBottom="4">
          <TagLine>{tag}</TagLine>
        </Box>
      )}
      {title && (
        <Box as="h2" className="h2">
          {title}
        </Box>
      )}
      {text && (
        <Box as="p" fontSize="md" marginTop="4" color="gray.600">
          {text}
        </Box>
      )}
    </Flex>
  );
};

export default Heading;
