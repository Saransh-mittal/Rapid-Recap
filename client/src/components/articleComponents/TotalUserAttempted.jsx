// File path: src/components/TotalUserAttempted.js

import React, { useState, useEffect } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import QuizTitansModal from "./QuizTitansModal";
import { set } from "lodash";

const TotalUserAttempted = ({ css, totalUsersGivenQuiz, notLoggedIn }) => {
  const [showQuizTitans, setShowQuizTitans] = useState(false);
  const [updatedTotalUsersGivenQuiz, setUpdatedTotalUsersGivenQuiz] =
    useState(totalUsersGivenQuiz);

  useEffect(() => {
    setUpdatedTotalUsersGivenQuiz(totalUsersGivenQuiz);
  }, [totalUsersGivenQuiz]);

  return (
    <Flex
      style={
        notLoggedIn
          ? { filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }
          : { userSelect: "text", border: "2px", padding: "0.5rem" }
      }
      css={css}
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
        color="#FDE2F3"
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
          {updatedTotalUsersGivenQuiz}
        </span>
      </Text>
      {showQuizTitans && (
        <QuizTitansModal setShowQuizTitans={setShowQuizTitans} />
      )}
      <Button
        margin={"1rem"}
        w={"50%"}
        onClick={(e) => {
          if (notLoggedIn) {
            e.preventDefault();
            return;
          }
          setShowQuizTitans(true);
        }}
      >
        Quiz Titans
      </Button>
    </Flex>
  );
};

export default TotalUserAttempted;
