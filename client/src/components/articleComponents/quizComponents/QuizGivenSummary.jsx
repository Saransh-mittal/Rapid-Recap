import {
  Button,
  Flex,
  Heading as ChakraHeading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import GivenQuizInterface from "./GivenQuizInterface";
import Loading from "../../miscellaneous/Loading";
import Heading from "../../miscellaneous/HeadingComponent";
const QuizGivenSummary = ({ isOpen, onClose, articleId }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false);
  const [quizGivenSummary, setQuizGivenSummary] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  const fetchQuizSummary = async () => {
    try {
      const response = await axios.get(`/api/quiz/summary/${articleId}`);
      setTimeTaken(response.data.timeTaken);
      setQuizGivenSummary(() => [...response.data.result]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error fetching quiz summary",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizGivenSummary.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex >= 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  useEffect(() => {
    fetchQuizSummary();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "3xl" }}>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(40px) hue-rotate(90deg)"
      />

      <ModalContent
        background={
          "linear-gradient(-45deg, #092635, #9EC8B9, #1B4242, #9EC8B9)"
        }
        backgroundSize="400% 400%"
        className="animated-gradient"
        minHeight={"75%"}
        borderRadius={{ md: "2px" }}
      >
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <ModalHeader
              maxHeight={"100px"}
              p={0}
              color={"white"}
              display={"flex"}
              alignItems={"center"}
            >
              <Flex flexDirection={"column"}>
                {/* <ChakraHeading
                  textAlign={"center"}
                  marginTop={"10px"}
                  marginBottom={0}
                  color={
                    !quizGivenSummary[currentQuestionIndex].userAnswer
                      ? "blue"
                      : quizGivenSummary[currentQuestionIndex].isCorrect
                      ? "green"
                      : "red"
                  }
                >
                  {!quizGivenSummary[currentQuestionIndex].userAnswer
                    ? "Not Answered"
                    : quizGivenSummary[currentQuestionIndex].isCorrect
                    ? "Correct"
                    : "Wrong"}
                </ChakraHeading> */}
                {/* <ChakraHeading textAlign={"center"}>
                  Total Time Taken: {timeTaken} seconds
                </ChakraHeading> */}
                <Heading
                  title={`Total Time Taken: ${timeTaken} seconds`}
                  tag={
                    !quizGivenSummary[currentQuestionIndex].userAnswer
                      ? "Not Answered"
                      : quizGivenSummary[currentQuestionIndex].isCorrect
                      ? "Correct"
                      : "Wrong"
                  }
                  tagMarginBottom={0}
                  marginBottom="0"
                  tagColor={
                    !quizGivenSummary[currentQuestionIndex].userAnswer
                      ? "blue"
                      : quizGivenSummary[currentQuestionIndex].isCorrect
                      ? "green"
                      : "red"
                  }
                  tagFontSize="xl"
                  tagFontWeight="bold"
                />
              </Flex>
            </ModalHeader>
            <ModalCloseButton
              style={{
                right: "10px",
                color: isCloseButtonHovered ? "white" : "#FAF0E6",
                backgroundColor: isCloseButtonHovered ? "#040D12" : "#183D3D",
                transition: "backgroundColor 0.3s, color 0.3s",
              }}
              onMouseEnter={() => setIsCloseButtonHovered(true)}
              onMouseLeave={() => setIsCloseButtonHovered(false)}
            />
            <ModalBody
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              width={"100%"}
              userSelect={"none"}
              px={"15px"}
              py={0}
            >
              <GivenQuizInterface
                quizGivenSummary={quizGivenSummary}
                currentQuestionIndex={currentQuestionIndex}
              />
            </ModalBody>
            <ModalFooter
              pt={0}
              w={"100%"}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
            >
              <Text textColor={"white"} marginBottom={4} marginTop={2}>
                Explanation:{" "}
                {quizGivenSummary[currentQuestionIndex].explanation}
              </Text>
              <Flex
                justifyContent={"center"}
                gap={"40px"}
                w="30%"
                flexDirection={"row-reverse"}
              >
                {currentQuestionIndex < quizGivenSummary.length - 1 && (
                  <Button
                    w={"100px"}
                    colorScheme="blue"
                    onClick={handleNextQuestion}
                    bg="#FCECDD" // Default background color
                    color="#046582" // Default text color
                    _hover={{
                      bg: "#046582",
                      color: "#FCECDD", // Change text color to black on hover
                    }}
                  >
                    Next
                  </Button>
                )}
                {currentQuestionIndex >= 1 && (
                  <Button
                    w={"100px"}
                    colorScheme="blue"
                    onClick={handlePrevQuestion}
                    bg="#FCECDD" // Default background color
                    color="#046582" // Default text color
                    _hover={{
                      bg: "#046582",
                      color: "#FCECDD", // Change text color to black on hover
                    }}
                  >
                    Previous
                  </Button>
                )}
              </Flex>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default QuizGivenSummary;
