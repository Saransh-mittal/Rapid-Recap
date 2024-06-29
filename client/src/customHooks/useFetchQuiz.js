// /hooks/useFetchQuiz.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const useFetchQuiz = (articleId, language, onClose) => {
  const [quizData, setQuizData] = useState(null);
  const [load, setLoad] = useState(true);
  const [quizId, setQuizId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoad(true);
      try {
        const response =
          language === "english"
            ? await axios.put(`/api/articles/genQuiz/${articleId}`)
            : await axios.put(`/api/articles/genHindiQuiz/${articleId}`);
        if (response.data.expired) {
          throw new Error("Quiz is already expired.");
        }
        if (!response.data.quiz || !response.data.quizId)
          throw new Error("No Quiz data found!");
        setQuizData(response.data.quiz);
        setQuizId(response.data.quizId);
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
          description: error.message
            ? error.message
            : "Please try again Later (Server might be responding slow)",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        onClose();
      } finally {
        setLoad(false);
      }
    };

    fetchQuiz();
  }, [articleId, language, toast]);

  return { quizData, load, quizId, setLoad };
};

export default useFetchQuiz;
