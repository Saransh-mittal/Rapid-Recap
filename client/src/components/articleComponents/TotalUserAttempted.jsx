import React, { useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import QuizTitansModal from "./QuizTitansModal";
const TotalUserAttempted = ({ css, totalUsersGivenQuiz }) => {
  const [showQuizTitans, setShowQuizTitans] = useState(false);
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
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
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
      {showQuizTitans && (
        <QuizTitansModal setShowQuizTitans={setShowQuizTitans} />
      )}
      <Button margin={"1rem"} w={"50%"} onClick={() => setShowQuizTitans(true)}>
        Quiz Titans
      </Button>
    </Flex>
  );
};

export default TotalUserAttempted;
