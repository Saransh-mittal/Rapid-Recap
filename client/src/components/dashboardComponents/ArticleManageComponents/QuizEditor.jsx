// src/components/QuizEditor.js

import React, { useCallback, useMemo, Suspense } from 'react'
import {
  Box,
  VStack,
  HStack,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Text,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

const Accordion = React.lazy(() =>
  import('@chakra-ui/react').then(module => ({ default: module.Accordion })),
)
const AccordionItem = React.lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AccordionItem,
  })),
)
const AccordionButton = React.lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AccordionButton,
  })),
)
const AccordionPanel = React.lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AccordionPanel,
  })),
)
const AccordionIcon = React.lazy(() =>
  import('@chakra-ui/react').then(module => ({
    default: module.AccordionIcon,
  })),
)

const QuizEditor = ({ article, setArticle }) => {
  const handleQuizChange = useCallback(
    (paraIndex, questionIndex, field, value) => {
      const updatedQuiz = [...article.quiz]
      const paraKey = `para${paraIndex + 1}`
      updatedQuiz[0][paraKey].questions[questionIndex] = {
        ...updatedQuiz[0][paraKey].questions[questionIndex],
        [field]: value,
      }
      setArticle({ ...article, quiz: updatedQuiz })
    },
    [article, setArticle],
  )

  const handleOptionChange = useCallback(
    (paraIndex, questionIndex, optionKey, value) => {
      const updatedQuiz = [...article.quiz]
      const paraKey = `para${paraIndex + 1}`
      updatedQuiz[0][paraKey].questions[questionIndex].options = {
        ...updatedQuiz[0][paraKey].questions[questionIndex].options,
        [optionKey]: value,
      }
      setArticle({ ...article, quiz: updatedQuiz })
    },
    [article, setArticle],
  )

  const addNewQuestion = useCallback(
    paraIndex => {
      const newQuestion = {
        question: '',
        options: { a: '', b: '', c: '', d: '' },
        answer: '',
        explanation: '',
        difficulty: '0.5',
      }
      const updatedQuiz = [...article.quiz]
      const paraKey = `para${paraIndex + 1}`
      updatedQuiz[0][paraKey].questions.push(newQuestion)
      setArticle({ ...article, quiz: updatedQuiz })
    },
    [article, setArticle],
  )

  const removeQuestion = useCallback(
    (paraIndex, questionIndex) => {
      const updatedQuiz = [...article.quiz]
      const paraKey = `para${paraIndex + 1}`
      updatedQuiz[0][paraKey].questions.splice(questionIndex, 1)
      setArticle({ ...article, quiz: updatedQuiz })
    },
    [article, setArticle],
  )

  const quizContent = useMemo(() => {
    return article.quiz && article.quiz.length > 0 ? (
      <Accordion allowMultiple>
        {['para1', 'para2', 'para3'].map((paraKey, paraIndex) => (
          <AccordionItem key={paraKey}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Paragraph {paraIndex + 1}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={6}>
                {article.quiz[0][paraKey].questions.map(
                  (quizItem, questionIndex) => (
                    <QuestionBox
                      key={questionIndex}
                      paraIndex={paraIndex}
                      questionIndex={questionIndex}
                      quizItem={quizItem}
                      handleQuizChange={handleQuizChange}
                      handleOptionChange={handleOptionChange}
                      removeQuestion={removeQuestion}
                    />
                  ),
                )}
                <Button
                  leftIcon={<AddIcon />}
                  onClick={() => addNewQuestion(paraIndex)}
                >
                  Add New Question
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    ) : (
      <Text>No quiz available for this article.</Text>
    )
  }, [
    article,
    addNewQuestion,
    handleQuizChange,
    handleOptionChange,
    removeQuestion,
  ])

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Quiz Details
      </Text>
      <Suspense fallback={<Text>Loading quiz content...</Text>}>
        {quizContent}
      </Suspense>
    </Box>
  )
}

const QuestionBox = React.memo(
  ({
    paraIndex,
    questionIndex,
    quizItem,
    handleQuizChange,
    handleOptionChange,
    removeQuestion,
  }) => (
    <Box p={4} borderWidth="1px" borderRadius="md">
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold">Question {questionIndex + 1}</Text>
        <IconButton
          icon={<DeleteIcon />}
          onClick={() => removeQuestion(paraIndex, questionIndex)}
          aria-label="Remove question"
        />
      </HStack>
      <FormControl mb={4}>
        <FormLabel>Question</FormLabel>
        <Input
          value={quizItem.question || ''}
          onChange={e =>
            handleQuizChange(
              paraIndex,
              questionIndex,
              'question',
              e.target.value,
            )
          }
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Options</FormLabel>
        {Object.entries(quizItem.options).map(([key, value]) => (
          <Input
            key={key}
            placeholder={`Option ${key.toUpperCase()}`}
            value={value}
            onChange={e =>
              handleOptionChange(paraIndex, questionIndex, key, e.target.value)
            }
            mb={2}
          />
        ))}
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Answer</FormLabel>
        <Input
          value={quizItem.answer || ''}
          onChange={e =>
            handleQuizChange(paraIndex, questionIndex, 'answer', e.target.value)
          }
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Explanation</FormLabel>
        <Textarea
          value={quizItem.explanation || ''}
          onChange={e =>
            handleQuizChange(
              paraIndex,
              questionIndex,
              'explanation',
              e.target.value,
            )
          }
        />
      </FormControl>
      <FormControl>
        <FormLabel>Difficulty</FormLabel>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={quizItem.difficulty || ''}
          onChange={e =>
            handleQuizChange(
              paraIndex,
              questionIndex,
              'difficulty',
              e.target.value,
            )
          }
        />
      </FormControl>
    </Box>
  ),
)

export default QuizEditor
