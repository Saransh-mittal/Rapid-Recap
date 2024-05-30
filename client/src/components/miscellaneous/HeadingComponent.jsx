import { Box } from "@chakra-ui/react";
import TagLine from "./TaglineComponent";

const Heading = ({ className, title, text, tag }) => {
  return (
    <Box
      maxWidth="50rem"
      marginX="auto"
      marginBottom={{ base: "12", lg: "20" }}
      textAlign="center"
      className={className}
    >
      {tag && (
        <TagLine
          display="flex"
          justifyContent={{ base: "flex-start", md: "center" }}
          marginBottom="4"
        >
          {tag}
        </TagLine>
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
    </Box>
  );
};

export default Heading;
