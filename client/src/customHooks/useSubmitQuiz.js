// /hooks/useSubmitQuiz.js
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const useSubmitQuiz = ({ articleId, quizData, quizId, setResult }) => {
  // console.log(userAnswers);
  const [submitLoad, setSubmitLoad] = useState(false);

  const toast = useToast();

  const handleSubmitQuiz = async ({ timeTaken, userAnswers, setSubmitted }) => {
    setSubmitLoad(true);
    setSubmitted(true);
    try {
      // const userResponses = showConfirmationModal
      //   ? Array.from({ length: quizData.length }, () => "")
      //   : [...userAnswers];
      // if (
      //   !showConfirmationModal &&
      //   userResponses.length === currentQuestionIndex
      // ) {
      //   userResponses.push("");
      // }

      const userResponses = [...userAnswers];
      // console.log(articleId);
      const response = await axios.post(`/api/quiz/attempt`, {
        articleId,
        userResponses,
        quizData,
        timeTaken: timeTaken === 0 ? 1 : timeTaken,
        quizId,
      });
      toast({
        title: "Quiz Submitted Successfully!",
        description: "You can now view your score.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      // console.log(response.data);
      setResult(response.data);

      return response.data;
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error.response.data.error || "Quiz submission failed!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setSubmitLoad(false);
    }
  };

  return { handleSubmitQuiz, submitLoad };
};

export default useSubmitQuiz;
