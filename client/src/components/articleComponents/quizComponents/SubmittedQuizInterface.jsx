import React from "react";
import { Text, SlideFade, Heading } from "@chakra-ui/react";

const SubmittedQuizInterface = ({ score, isOpen }) => {
  return (
    <SlideFade
      direction="bottom"
      in={isOpen}
      offsetY="20px"
      style={{ zIndex: 10 }}
    >
      <Heading
        as="h3"
        size="lg"
        color="#3E3232"
        position="absolute"
        top="40%"
        width="100%"
        left="50%"
        transform="translateX(-50%)"
        textAlign="center"
      >
        Quiz completed. Thank you for participating!
      </Heading>
      <Text color="#503C3C" fontSize="30px" textAlign="center" marginTop="10">
        RQM_score: {`${score}`}
      </Text>
    </SlideFade>
  );
};

export default SubmittedQuizInterface;
