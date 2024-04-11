import React from "react";
import { Flex, Text } from "@chakra-ui/react";
const TotalUserAttempted = ({ css, totalUsersGivenQuiz }) => {
  return (
    <Flex
      css={css}
      style={{
        border: "2px",
        padding: "0.5rem",
      }}
      borderRadius="xl"
      backgroundColor="#2A2F4F"
      marginBottom="2rem"
    >
      <Text
        fontSize="18px"
        fontWeight="bold"
        letterSpacing={0.25}
        color="#FDE2F3" // Change the color here
        textAlign={"center"}
        w={"100%"}
        m={0}
      >
        Total Users Attempted the Quiz :{" "}
        <span
          style={{
            backgroundColor: "green",
            borderRadius: "15px",
            padding: "8px",
          }}
        >
          {totalUsersGivenQuiz}
        </span>
      </Text>
    </Flex>
  );
};

export default TotalUserAttempted;
