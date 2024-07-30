import { Image, Box, Text } from "@chakra-ui/react";
import loading from "../../assets/loading.webp";

const Generating = ({ className }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      height="3.5rem"
      px={6}
      bg="rgba(0,0,0,0.8)"
      rounded="1.7rem"
      className={className}
      fontSize="base"
    >
      <Image
        src={loading}
        alt="Loading"
        width="1.25rem"
        height="1.25rem"
        mr={4}
      />
      <Text>AI is generating</Text>
    </Box>
  );
};

export default Generating;
