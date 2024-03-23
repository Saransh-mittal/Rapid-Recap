import { Box, Button, Text } from "@chakra-ui/react";
import React from "react";

const GenerateQuizButton = ({ onClick, css }) => {
  return (
    <Box
      css={css}
      style={{
        border: "2px",
        padding: "1rem",
      }}
      borderRadius="xl"
      backgroundColor="#2A2F4F"
      marginBottom="2rem"
    >
      <Text
        fontSize="18px"
        fontWeight="bold"
        marginBottom="1rem"
        letterSpacing={0.25}
        color="#FDE2F3" // Change the color here
      >
        !!! Compete in the quiz for a chance at the LeaderBoard !!!
      </Text>
      <Button
        height="35px"
        width="110px"
        borderRadius="xl"
        _hover={{ opacity: 0.3 }}
        color="#37306B"
        backgroundColor="#F7EFE5"
        onClick={() => {
          onClick();
        }}
      >
        Generate Quiz
      </Button>
    </Box>
  );
};

export default GenerateQuizButton;
