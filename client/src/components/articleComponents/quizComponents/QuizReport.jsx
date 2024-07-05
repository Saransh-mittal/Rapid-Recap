import React, { useEffect, useState } from "react";
import ModalComponent from "../ModalComponent";
import QuizGivenSummary from "./QuizGivenSummary";
import SubmittedQuizInterface from "./SubmittedQuizInterface";
import { Skeleton, useToast } from "@chakra-ui/react";
import axios from "axios";

const QuizReport = ({ isOpen, articleId, onClose }) => {
  const [showQuizSummary, setShowQuizSummary] = useState(false);
  const [load, setLoad] = useState(true);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizGivenSummary, setQuizGivenSummary] = useState([]);
  const [result, setResult] = useState({});
  const toast = useToast();
  const fetchQuizSummary = async () => {
    try {
      const response = await axios.get(`/api/quiz/summary/${articleId}`);
      setTimeTaken(response.data.timeTaken);
      setResult(response.data);
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
      setLoad(false);
    }
  };
  useEffect(() => {
    fetchQuizSummary();
  }, []);
  const renderModalBody = () => {
    if (showQuizSummary) {
      return (
        <QuizGivenSummary
          timeTakenInitial={timeTaken}
          quizGivenSummaryInitial={quizGivenSummary}
          isOpen={isOpen}
          onClose={() => setShowQuizSummary(false)}
          articleId={articleId}
          fetchQuizSummaryFromAnotherComp={true}
        />
      );
    }

    return (
      <Skeleton isLoaded={!load}>
        <SubmittedQuizInterface
          isOpen={isOpen}
          submitLoad={false}
          result={result}
          onViewReport={() => setShowQuizSummary(true)}
        />
      </Skeleton>
    );
  };
  return (
    <ModalComponent
      load={load}
      renderModalBody={renderModalBody}
      onClose={onClose}
      isOpen={isOpen}
    />
  );
};

export default QuizReport;
