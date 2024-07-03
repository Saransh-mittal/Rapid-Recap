// src/components/ModalComponent.js

import React from "react";
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
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import Countdown from "./Countdown";

const ModalComponent = ({
  isOpen,
  onClose,
  isCloseButtonHovered,
  setIsCloseButtonHovered,
  isStartQuizButtonHovered,
  setIsStartQuizButtonHovered,
  renderModalBody,
  load,
  showInstruction,
  startQuiz,
  handleNextQuestion,
  currentQuestionIndex,
  totalQuestions,
  submitted,
  submitLoad,
  timeTaken,
  userAnswers,
  handleSubmitQuiz,
  timer,
  setSubmitted,
  state,
  isQuinBoostAvailable,
  showSubmittedInterface,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "3xl" }}>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(40px) hue-rotate(90deg)"
      />
      <ModalContent
        background={
          submitted &&
          (state.isBoosted || isQuinBoostAvailable) &&
          !showSubmittedInterface
            ? "black"
            : "linear-gradient(-45deg, #092635, #9EC8B9, #2a7575, #9EC8B9)"
        }
        backgroundSize="400% 400%"
        className="animated-gradient scene"
        minHeight={"80vh"}
        borderRadius={{ md: "2px" }}
        overflow="hidden"
      >
        {timer ? (
          <SkeletonCircle
            color="red"
            isLoaded={!load}
            marginTop={load ? "10px" : "0"}
            size={load ? "20" : "auto"}
            marginBottom={load ? "10px" : "0"}
          >
            {!submitted && timer ? (
              <Countdown
                timer={timer}
                submitted={submitted}
                start={!showInstruction}
              />
            ) : null}
          </SkeletonCircle>
        ) : null}
        <ModalCloseButton
          zIndex={1}
          style={{
            right: "10px",
            color: isCloseButtonHovered ? "white" : "#FAF0E6",
            backgroundColor: isCloseButtonHovered ? "#040D12" : "#183D3D",
            transition: "background-color 0.3s, color 0.3s",
          }}
          onMouseEnter={() =>
            setIsCloseButtonHovered && setIsCloseButtonHovered(true)
          }
          onMouseLeave={() =>
            setIsCloseButtonHovered && setIsCloseButtonHovered(false)
          }
        />
        <ModalBody>{renderModalBody()}</ModalBody>
        <Flex flexDirection={"column"} color={"white"}>
          {load && showInstruction && (
            <Text size={"lg"} color={"black"}>
              Quiz is generating. Wait for the start button....
            </Text>
          )}
          <Skeleton
            isLoaded={!load}
            borderRadius={"10px"}
            marginBottom={load ? "10px" : ""}
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
                currentQuestionIndex < totalQuestions - 1 &&
                !submitted && (
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={handleNextQuestion}
                    bg="#FCECDD"
                    color="#046582"
                    _hover={{
                      bg: "#046582",
                      color: "#FCECDD",
                    }}
                  >
                    Next
                  </Button>
                )}
              {currentQuestionIndex === totalQuestions - 1 && !submitted && (
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() =>
                    handleSubmitQuiz({ timeTaken, userAnswers, setSubmitted })
                  }
                  bg="#DCF2F1"
                  color="#265073"
                  _hover={{
                    bg: "#265073",
                    color: "#DCF2F1",
                  }}
                  isLoading={submitLoad}
                >
                  Submit
                </Button>
              )}
            </ModalFooter>
          </Skeleton>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default ModalComponent;
