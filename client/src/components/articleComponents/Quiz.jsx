// src/components/Quiz.js

import React, {
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Button,
  ModalOverlay,
  Text,
  Flex,
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
import QuizGivenSummary from "./quizComponents/QuizGivenSummary";
import {
  dailyStreakCheckerAndUpdater,
  quinBoostChecker,
} from "../../utils/quiz.utils";
import useFetchQuiz from "../../customHooks/useFetchQuiz";
import useTimer from "../../customHooks/useTimer";
import useSubmitQuiz from "../../customHooks/useSubmitQuiz";
import axios from "axios";
import ModalComponent from "./ModalComponent";

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false);
  const [isStartQuizButtonHovered, setIsStartQuizButtonHovered] =
    useState(false);
  const [showSubmittedInterface, setShowSubmittedInterface] = useState(false); // New state
  const [showQuizSummary, setShowQuizSummary] = useState(false); // New state
  const [result, setResult] = useState({});

  useEffect(() => {
    const initialAnswers = Array(totalQuestions).fill("");
    setUserAnswers(initialAnswers);
  }, [totalQuestions]);

  const { handleSubmitQuiz, submitLoad } = useSubmitQuiz({
    articleId,
    quizData,
    quizId,
    setResult,
  });

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
    console.log("close");
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
  useEffect(() => {
    // remove stars on !showSubmittedInterface
    if (showSubmittedInterface) {
      const scene = document.querySelector(".scene");
      const stars = scene.querySelectorAll("i");
      stars.forEach((star) => {
        star.remove();
      });
    }
  }, [showSubmittedInterface]);

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

  const renderModalBody = () => {
    if (showInstruction) {
      return language === "english" ? (
        <InstructionModal isQuinBoostAvailable={isQuinBoostAvailable} />
      ) : (
        <HindiInstructionModal />
      );
    }

    if (showQuizSummary) {
      return (
        <QuizGivenSummary
          isOpen={isOpen}
          onClose={() => setShowQuizSummary(false)}
          articleId={articleId}
        />
      );
    }

    if (showSubmittedInterface) {
      return (
        <SubmittedQuizInterface
          isOpen={isOpen}
          submitLoad={submitLoad}
          result={result}
          onViewReport={() => setShowQuizSummary(true)}
        />
      );
    }

    return (
      <Flex
        p={"15px"}
        px={"5px"}
        mt={"25px"}
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
            score={result?.RQM_score}
            submitLoad={submitLoad}
            onViewReport={() => setShowSubmittedInterface(true)}
          />
        ) : (
          <SubmittedQuizInterface
            isOpen={isOpen}
            submitLoad={submitLoad}
            result={result}
            onViewReport={() => setShowQuizSummary(true)} // New prop
          />
        )}
      </Flex>
    );
  };

  return (
    <>
      <ModalComponent
        showSubmittedInterface={showSubmittedInterface}
        isQuinBoostAvailable={isQuinBoostAvailable}
        state={state}
        setSubmitted={setSubmitted}
        timer={timer}
        isOpen={isOpen}
        onClose={handleClose}
        isCloseButtonHovered={isCloseButtonHovered}
        setIsCloseButtonHovered={setIsCloseButtonHovered}
        isStartQuizButtonHovered={isStartQuizButtonHovered}
        setIsStartQuizButtonHovered={setIsStartQuizButtonHovered}
        renderModalBody={renderModalBody}
        load={load}
        showInstruction={showInstruction}
        startQuiz={startQuiz}
        handleNextQuestion={handleNextQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        submitted={submitted}
        submitLoad={submitLoad}
        timeTaken={timeTaken}
        userAnswers={userAnswers}
        handleSubmitQuiz={handleSubmitQuiz}
        setShowInstruction={setShowInstruction}
      />
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
