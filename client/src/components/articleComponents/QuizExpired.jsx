import { Container, Heading } from "@chakra-ui/react";
import React from "react";

const QuizExpired = ({ css }) => {
  return (
    <Container css={css} margin={"5px"} mb={5} height={"100px"}>
      <Heading color={"red"}>Quiz Expired</Heading>
    </Container>
  );
};

export default QuizExpired;
