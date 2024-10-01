import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  Box,
} from '@chakra-ui/react'

const CurrentAffairsManagement = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    hindiQuestion: '',
    options: {
      a: { text: '' },
      b: { text: '' },
      c: { text: '' },
      d: { text: '' },
    },
    hindiOptions: {
      a: { text: '' },
      b: { text: '' },
      c: { text: '' },
      d: { text: '' },
    },
    correctAnswer: '',
    difficulty: '',
  })
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [bulkQuestions, setBulkQuestions] = useState('')
  const toast = useToast()
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        '/api/tournament/questions/current-affairs/current',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      // extract hindiOptions from options via for example options.a.hindiText
      // console.log('response.data:', response.data)
      const questions = response.data?.map(q => ({
        ...q,
        hindiOptions: q.hindiOptions
          ? q.hindiOptions
          : {
              a: { text: q.options.a.hindiText },
              b: { text: q.options.b.hindiText },
              c: { text: q.options.c.hindiText },
              d: { text: q.options.d.hindiText },
            },
      }))
      setQuestions(questions)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: 'Error fetching questions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleInputChange = (e, field) => {
    const { name, value } = e.target
    if (field === 'options' || field === 'hindiOptions') {
      setNewQuestion(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [name]: { ...prev[field][name], text: value },
        },
      }))
    } else {
      setNewQuestion(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async () => {
    if (!isQuestionComplete()) {
      toast({
        title: 'Incomplete question',
        description: 'Please fill in all fields for both English and Hindi',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const questionData = {
        question: newQuestion.question,
        hindiQuestion: newQuestion.hindiQuestion,
        options: {
          a: { text: newQuestion.options.a.text },
          b: { text: newQuestion.options.b.text },
          c: { text: newQuestion.options.c.text },
          d: { text: newQuestion.options.d.text },
        },
        hindiOptions: {
          a: { text: newQuestion.hindiOptions.a.text },
          b: { text: newQuestion.hindiOptions.b.text },
          c: { text: newQuestion.hindiOptions.c.text },
          d: { text: newQuestion.hindiOptions.d.text },
        },
        correctAnswer: newQuestion.correctAnswer,
        difficulty: parseFloat(newQuestion.difficulty),
      }

      console.log('Submitting question data:', questionData)

      let response
      if (editingQuestion) {
        response = await axios.put(
          `/api/tournament/questions/current-affairs/${editingQuestion._id}`,
          questionData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        toast({
          title: 'Question updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        response = await axios.post(
          '/api/tournament/questions/current-affairs',
          questionData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        toast({
          title: 'Question added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
      resetForm()
      fetchQuestions()
    } catch (error) {
      console.error('Error submitting question:', error)
      toast({
        title: 'Error submitting question',
        description: error.response?.data?.message || 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const isQuestionComplete = () => {
    return (
      newQuestion.question &&
      newQuestion.hindiQuestion &&
      Object.values(newQuestion.options).every(Boolean) &&
      Object.values(newQuestion.hindiOptions).every(Boolean) &&
      newQuestion.correctAnswer &&
      newQuestion.difficulty
    )
  }

  const handleEdit = question => {
    setEditingQuestion(question)
    setNewQuestion({
      ...question,
      options: {
        a: { text: question.options.a.text, _id: question.options.a._id },
        b: { text: question.options.b.text, _id: question.options.b._id },
        c: { text: question.options.c.text, _id: question.options.c._id },
        d: { text: question.options.d.text, _id: question.options.d._id },
      },
      hindiOptions: {
        a: {
          text: question.hindiOptions.a.text,
          _id: question.hindiOptions.a._id,
        },
        b: {
          text: question.hindiOptions.b.text,
          _id: question.hindiOptions.b._id,
        },
        c: {
          text: question.hindiOptions.c.text,
          _id: question.hindiOptions.c._id,
        },
        d: {
          text: question.hindiOptions.d.text,
          _id: question.hindiOptions.d._id,
        },
      },
      correctAnswer: Object.keys(question.options).find(
        key =>
          question.options[key]._id.toString() ===
          question.correctAnswer.toString(),
      ),
    })
  }

  const handleDelete = async id => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/tournament/questions/current-affairs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast({
        title: 'Question deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast({
        title: 'Error deleting question',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleBulkSubmit = async () => {
    setIsBulkLoading(true)
    try {
      const parsedQuestions = JSON.parse(bulkQuestions)
      const token = localStorage.getItem('token')

      for (const q of parsedQuestions) {
        if (!isQuestionValid(q)) {
          throw new Error('Invalid question format')
        }

        await axios.post('/api/tournament/questions/current-affairs', q, {
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      toast({
        title: 'Questions added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      fetchQuestions()
      setBulkQuestions('')
    } catch (error) {
      console.error('Error processing bulk questions:', error)
      toast({
        title: 'Error processing bulk questions',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsBulkLoading(false)
    }
  }

  const isQuestionValid = q => {
    return (
      q.question &&
      q.hindiQuestion &&
      q.options &&
      q.hindiOptions &&
      Object.values(q.options).length === 4 &&
      Object.values(q.hindiOptions).length === 4 &&
      q.correctAnswer &&
      q.difficulty
    )
  }

  const resetForm = () => {
    setNewQuestion({
      question: '',
      hindiQuestion: '',
      options: {
        a: { text: '' },
        b: { text: '' },
        c: { text: '' },
        d: { text: '' },
      },
      hindiOptions: {
        a: { text: '' },
        b: { text: '' },
        c: { text: '' },
        d: { text: '' },
      },
      correctAnswer: '',
      difficulty: '',
    })
    setEditingQuestion(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Current Affairs Questions Management</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              Total Current Affairs Questions: {questions.length}
            </Text>
          </Box>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Question (English)</FormLabel>
              <Input
                name="question"
                value={newQuestion.question}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Question (Hindi)</FormLabel>
              <Input
                name="hindiQuestion"
                value={newQuestion.hindiQuestion}
                onChange={handleInputChange}
              />
            </FormControl>
            {['a', 'b', 'c', 'd'].map(option => (
              <HStack key={option} width="100%">
                <FormControl>
                  <FormLabel>Option {option.toUpperCase()} (English)</FormLabel>
                  <Input
                    name={option}
                    value={newQuestion.options[option].text}
                    onChange={e => handleInputChange(e, 'options')}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Option {option.toUpperCase()} (Hindi)</FormLabel>
                  <Input
                    name={option}
                    value={newQuestion.hindiOptions[option].text}
                    onChange={e => handleInputChange(e, 'hindiOptions')}
                  />
                </FormControl>
              </HStack>
            ))}
            <FormControl>
              <FormLabel>Correct Answer</FormLabel>
              <Select
                name="correctAnswer"
                value={newQuestion.correctAnswer}
                onChange={handleInputChange}
              >
                <option value="">Select correct answer</option>
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Difficulty</FormLabel>
              <Input
                name="difficulty"
                value={newQuestion.difficulty}
                onChange={handleInputChange}
              />
            </FormControl>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </VStack>

          <Text fontSize="xl" fontWeight="bold" mt={8} mb={4}>
            Bulk Add Questions
          </Text>
          <FormControl>
            <FormLabel>Paste Questions JSON (English and Hindi)</FormLabel>
            <Textarea
              value={bulkQuestions}
              onChange={e => setBulkQuestions(e.target.value)}
              placeholder={`[
  {
    "question": "English question?",
    "hindiQuestion": "हिंदी प्रश्न?",
    "options": {"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"},
    "hindiOptions": {"a": "विकल्प A", "b": "विकल्प B", "c": "विकल्प C", "d": "विकल्प D"},
    "correctAnswer": "a",
    "difficulty": "0.5"
  }
]`}
              height="200px"
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleBulkSubmit}
            mt={4}
            isLoading={isBulkLoading}
          >
            Add Bulk Questions
          </Button>

          <Text fontSize="xl" fontWeight="bold" mt={8} mb={4}>
            Current Affairs Questions
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Question (English)</Th>
                <Th>Question (Hindi)</Th>
                <Th>Difficulty</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {questions.map(question => (
                <Tr key={question._id}>
                  <Td>{question.question}</Td>
                  <Td>{question.hindiQuestion}</Td>
                  <Td>{question.difficulty}</Td>
                  <Td>
                    <Button
                      colorScheme="yellow"
                      size="sm"
                      onClick={() => handleEdit(question)}
                      mr={2}
                    >
                      Edit
                    </Button>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDelete(question._id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CurrentAffairsManagement
