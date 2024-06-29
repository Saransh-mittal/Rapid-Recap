// /components/Quiz.jsx
import React, {
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
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
import ConfirmationModal from "./customQuizModal/ConfirmationModal";
import InstructionModal from "./customQuizModal/InstructionModal";
import QuizInterface from "./quizComponents/quizInterface";
import SubmittedQuizInterface from "./quizComponents/SubmittedQuizInterface";
import HindiInstructionModal from "./customQuizModal/HindiInstructionModal";
import ReactGA from "react-ga4";
import { AppContext } from "../../contextAPI/appContext";
import BoostedSubmittedQuizInterface from "./quizComponents/BoostedSubmittedQuizInterface";
import {
  dailyStreakCheckerAndUpdater,
  quinBoostChecker,
} from "../../utils/quiz.utils";
import useFetchQuiz from "../../customHooks/useFetchQuiz";
import useTimer from "../../customHooks/useTimer";
import useSubmitQuiz from "../../customHooks/useSubmitQuiz";
import axios from "axios";

const Quiz = ({
  article,
  isOpen,
  onClose,
  ofShowQuiz,
  language,
  isQuinBoostAvailable,
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
}) => {
  const articleId = article._id;
  const { quizData, load, quizId, setLoad } = useFetchQuiz(
    articleId,
    language,
    onClose
  );
  const totalQuestions = quizData ? quizData.questions.length : 0;
  const toast = useToast();
  const { state, dispatch } = useContext(AppContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false);
  const [isStartQuizButtonHovered, setIsStartQuizButtonHovered] =
    useState(false);
  const stopTimerRef = useRef(false);

  useEffect(() => {
    const initialAnswers = Array(totalQuestions).fill("");
    setUserAnswers(initialAnswers);
  }, [totalQuestions]);

  const { handleSubmitQuiz, submitLoad } = useSubmitQuiz(
    articleId,
    quizData,
    quizId,
    showConfirmationModal,
    currentQuestionIndex,
    setScore
  );

  const { timer, timeTaken } = useTimer(
    isOpen,
    submitted,
    showInstruction,
    userAnswers,
    ({ timeTaken, userAnswers, setSubmitted }) =>
      handleSubmitQuiz({ timeTaken, userAnswers, setSubmitted }),
    setSubmitted
  );

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handleAnswer = useCallback(
    (selectedOption) => {
      setUserAnswers((prevAnswers) => {
        const newAnswers = [...prevAnswers];
        newAnswers[currentQuestionIndex] = selectedOption;

        return newAnswers;
      });
    },
    [currentQuestionIndex]
  );

  const startQuiz = async () => {
    setLoad(true);
    try {
      await axios.get(`/api/articles/startQuiz/${articleId}`);
      localStorage.removeItem("isQuizGivenCalled");
      setShowInstruction(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Quiz failed!",
        description:
          error.response.data.error ||
          "Please try again (Close the quiz and Try refreshing the page)",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoad(false);
      ReactGA.event({
        category: "Quiz",
        action: "Start Quiz Button Clicked",
      });
    }
  };

  const showConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleClose = async () => {
    try {
      quinBoostChecker({
        setIsQuinBoostAvailable,
        setQuizLeftToGetQuizBoost,
      });
      dailyStreakCheckerAndUpdater({ dispatch });
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleConfirmClose = async () => {
    try {
      await quinBoostChecker({
        setIsQuinBoostAvailable,
        setQuizLeftToGetQuizBoost,
      });

      await handleSubmitQuiz({
        timeTaken,
        userAnswers,
        setSubmitted,
      });
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
      handleClose();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      setShowConfirmationModal(true);
    };
    if (!showInstruction)
      window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (submitted && !load && (state.isBoosted || isQuinBoostAvailable)) {
      stars();
    }
  }, [submitted, load]);

  const stars = () => {
    let count = 40;
    let scene = document.querySelector(".scene");
    let i = 0;
    while (i < count) {
      let star = document.createElement("i");
      let x = Math.floor(Math.random() * window.innerWidth);
      let duration = Math.random() * 1;
      let h = Math.random() * 100;
      star.style.left = `${x}px`;
      star.style.width = "1px";
      star.style.height = `${h}px`;
      star.style.animationDuration = `${duration}s`;
      scene.appendChild(star);
      i++;
    }
  };

  const renderModalContent = () => {
    if (showInstruction) {
      return language === "english" ? (
        <InstructionModal isQuinBoostAvailable={isQuinBoostAvailable} />
      ) : (
        <HindiInstructionModal />
      );
    }

    return (
      <ModalBody
        p={"15px"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        width={"100%"}
        userSelect={"none"}
        position={"relative"}
      >
        {!submitted ? (
          <QuizInterface
            load={load}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            quizData={quizData}
            handleAnswer={handleAnswer}
            userAnswers={userAnswers}
          />
        ) : state.isBoosted || isQuinBoostAvailable ? (
          <BoostedSubmittedQuizInterface
            isOpen={isOpen}
            score={score}
            submitLoad={submitLoad}
          />
        ) : (
          <SubmittedQuizInterface
            isOpen={isOpen}
            score={score}
            submitLoad={submitLoad}
          />
        )}
      </ModalBody>
    );
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
            submitted && (state.isBoosted || isQuinBoostAvailable)
              ? "black"
              : "linear-gradient(-45deg, #092635, #9EC8B9, #1B4242, #9EC8B9)"
          }
          backgroundSize="400% 400%"
          className="animated-gradient scene"
          minHeight={"80vh"}
          borderRadius={{ md: "2px" }}
          overflow="hidden"
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
              marginTop={load ? "10px" : "0"}
              size={load ? "20" : "auto"}
              marginBottom={load ? "10px" : "0"}
            >
              <Countdown
                timer={timer}
                submitted={submitted}
                start={!showInstruction}
                stopTimer={stopTimerRef.current}
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
          {renderModalContent()}
          <Flex flexDirection={"column"} color={"white"}>
            {load && (
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
      {!showInstruction && showConfirmationModal && (
        <ConfirmationModal
          bg={"black"}
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmClose}
          message="Clicking on Confirm will result in submission of the quiz with 0 score. Are you sure you want to submit the quiz?"
        />
      )}
    </>
  );
};

export default Quiz;
