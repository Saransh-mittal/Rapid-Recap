import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalCloseButton,
  Text,
  Flex,
  ModalHeader,
  Skeleton,
  SkeletonCircle,
  useToast,
} from "@chakra-ui/react";
import "./Quiz.css";
import Countdown from "./Countdown";
import axios from "axios";
import ConfirmationModal from "./customQuizModal/ConfirmationModal";
import InstructionModal from "./customQuizModal/InstructionModal";
import QuizInterface from "./quizComponents/quizInterface";
import SubmittedQuizInterface from "./quizComponents/SubmittedQuizInterface";

const Quiz = ({ article, isOpen, onClose, ofShowQuiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState(null);
  const [load, setLoad] = useState(true);
  const toast = useToast();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [timeTaken, setTimeTaken] = useState(0);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false);
  const [isStartQuizButtonHovered, setIsStartQuizButtonHovered] =
    useState(false);

  const totalQuestions = quizData ? quizData.questions.length : 0;

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      if (userAnswers.length === currentQuestionIndex) {
        setUserAnswers((prevAnswers) => [...prevAnswers, ""]);
      }
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleAnswer = (selectedOption) => {
    setUserAnswers((prevAnswers) => [...prevAnswers, selectedOption]);
  };

  const handleSubmitQuiz = async () => {
    // For example, you can calculate the score here
    // You can add your own logic here
    console.log("Submitting Quiz");
    try {
      const articleId = article._id;
      const userResponses = showConfirmationModal
        ? Array.from({ length: quizData.length }, () => "")
        : [...userAnswers];
      if (
        !showConfirmationModal &&
        userResponses.length === currentQuestionIndex
      ) {
        userResponses.push("");
      }
      //console.log(userResponses, quizData, timeTaken);
      const response = await axios.post(`/api/quiz/attempt`, {
        articleId,
        userResponses,
        quizData,
        timeTaken: timeTaken === 0 ? 1 : timeTaken,
      });
      //console.log(response);
      setScore(response.data.RQM_score);
      setCurrentQuestionIndex(quizData.questions.length);
      setSubmitted(true);
      toast({
        title: "Quiz Submitted Successfully!",
        description: "You can now view your score.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      //console.log(error.response.data.error);
      toast({
        title: "Error",
        description: error.response.data.error || "Quiz submission failed!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const startQuiz = async () => {
    setLoad(true);
    try {
      //console.log(article._id);
      const articleId = article._id;
      const quiz = await axios.get(`/api/articles/startQuiz/${articleId}`);
      if (!quiz.data) throw new Error("No Quiz data found!");
      setQuizData(quiz.data);
      localStorage.removeItem("isQuizGivenCalled");
      setShowInstruction(false);
    } catch (error) {
      toast({
        title: "Quiz failed!",
        description:
          error.response.data.error ||
          "Please try again (Close the quiz and Try refreshing the page)",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      //console.log(error);
    } finally {
      setLoad(false);
    }
  };

  const fetchQuiz = async () => {
    //fetch quiz data from api
    try {
      //console.log(article._id);
      const articleId = article._id;
      const response = await axios.put(`/api/articles/genQuiz/${articleId}`);
      if (response.data.expired) {
        throw new Error("Quiz is already expired.");
      }
      setLoad(false);
      toast({
        title: "Quiz Generated Successfully!",
        description: "You can now attempt the quiz.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Quiz Generation Failed!",
        description:
          error.response?.data?.error ||
          error ||
          "Please try again (Close this window and Try refreshing the page)",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      //console.log(error);
    }
  };

  useEffect(() => {
    //console.log(article._id);
    fetchQuiz();

    const handleBeforeUnload = (event) => {
      // Cancel the event
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = "";
      // Show the confirmation modal
      setShowConfirmationModal(true);
    };

    if (!showInstruction)
      window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const showConfirmation = () => {
    setShowConfirmationModal(true);
  };
  const handleClose = () => {
    if (
      !submitted &&
      currentQuestionIndex < totalQuestions &&
      !showInstruction
    ) {
      showConfirmation();
    } else if (showInstruction) {
      setShowInstruction(false);
      onClose();
    } else {
      ofShowQuiz();
      onClose();
    }
  };
  const handleConfirmClose = async () => {
    // Close the confirmation modal
    try {
      await handleSubmitQuiz();
      setShowConfirmationModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response.data.error || "Quiz closing failed! Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      //console.log(error);
    }
    // Perform additional actions if needed
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size={{ base: "full", md: "3xl" }}
      >
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
          <ModalHeader
            maxHeight={"100px"}
            p={0}
            color={"white"}
            display={"flex"}
            alignItems={"center"}
          >
            <SkeletonCircle
              color="red"
              isLoaded={!load}
              marginTop={load ? "10px" : "0"} // remove this when skeleton isLoaded
              size={load ? "20" : "auto"} // make it auto when skeleton isLoaded
              marginBottom={load ? "10px" : "0"} // remove this when skeleton isLoaded
            >
              <Countdown
                initialTimer={50}
                onTimerExhausted={() => handleSubmitQuiz()}
                submitted={submitted}
                setTimeTaken={setTimeTaken}
                start={!showInstruction}
              />
            </SkeletonCircle>
          </ModalHeader>
          <ModalCloseButton
            style={{
              right: "10px",
              color: isCloseButtonHovered ? "white" : "#FAF0E6",
              backgroundColor: isCloseButtonHovered ? "#040D12" : "#183D3D",
              transition: "background-color 0.3s, color 0.3s",
            }}
            onMouseEnter={() => setIsCloseButtonHovered(true)}
            onMouseLeave={() => setIsCloseButtonHovered(false)}
          />

          {showInstruction ? (
            <InstructionModal />
          ) : (
            <ModalBody
              p={"15px"}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              width={"100%"}
              userSelect={"none"}
            >
              {!submitted ? (
                <>
                  <QuizInterface
                    load={load}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={totalQuestions}
                    quizData={quizData}
                    handleAnswer={handleAnswer}
                    userAnswers={userAnswers}
                  />
                </>
              ) : (
                <SubmittedQuizInterface isOpen={isOpen} score={score} />
              )}
            </ModalBody>
          )}
          <Flex flexDirection={"column"} color={"white"}>
            {load && (
              <Text size={"lg"} color={"black"}>
                Quiz is generating. Wait for the start button....
              </Text>
            )}
            <Skeleton
              isLoaded={!load}
              borderRadius={"10px"}
              marginBottom={load ? "10px" : ""} // remove this when skeleton isLoaded
            >
              <ModalFooter>
                {showInstruction && (
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={startQuiz}
                    style={{
                      transition: "background-color 0.3s, color 0.3s",
                      backgroundColor: isStartQuizButtonHovered
                        ? "#DDE6ED"
                        : "#183D3D",
                      color: isStartQuizButtonHovered ? "#27374D" : "#FAF0E6",
                    }}
                    onMouseEnter={() => setIsStartQuizButtonHovered(true)}
                    onMouseLeave={() => setIsStartQuizButtonHovered(false)}
                  >
                    Start Quiz
                  </Button>
                )}
                {!showInstruction &&
                  currentQuestionIndex < totalQuestions - 1 && (
                    <Button
                      colorScheme="blue"
                      mr={3}
                      onClick={handleNextQuestion}
                      bg="#FCECDD" // Default background color
                      color="#046582  " // Default text color
                      _hover={{
                        bg: "#046582", // Change background color to red on hover
                        color: "#FCECDD", // Change text color to black on hover
                      }}
                    >
                      Next
                    </Button>
                  )}
                {currentQuestionIndex === totalQuestions - 1 && (
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={handleSubmitQuiz}
                    bg="#DCF2F1" // Default background color
                    color="#265073" // Default text color
                    _hover={{
                      bg: "#265073", // Change background color to red on hover
                      color: "#DCF2F1", // Change text color to black on hover
                    }}
                  >
                    Submit
                  </Button>
                )}
              </ModalFooter>
            </Skeleton>
          </Flex>
        </ModalContent>
      </Modal>
      {!showInstruction && (
        <ConfirmationModal
          bg={"black"}
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmClose}
          message="Clicking on Confirm will result in submission of the quiz with 0 score. Are you sure you want to submit the quiz ?"
        />
      )}
    </>
  );
};

export default Quiz;
