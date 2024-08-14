import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Input,
  VStack,
  HStack,
  Box,
  IconButton,
  useDisclosure,
  Select,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import {
  SearchIcon,
  EditIcon,
  ViewIcon,
  AddIcon,
  DeleteIcon,
} from '@chakra-ui/icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ArticleManagement = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [articles, setArticles] = useState([])
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    startDate: '',
    endDate: '',
    hasQuiz: '',
  })
  const navigate = useNavigate()
  const [selectedArticle, setSelectedArticle] = useState(null)
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    fetchArticles()
  }, [filters])

  const fetchArticles = async () => {
    try {
      const queryParams = new URLSearchParams({
        query: searchTerm,
        ...filters,
      }).toString()
      const response = await axios.get(
        `/api/admin/articles/search?${queryParams}`,
      )

      const { data } = response
      setArticles(data.searchResults)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast({
        title: 'Error fetching articles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEditArticle = async id => {
    try {
      const response = await axios.get(`/api/admin/articles/${id}`)
      const { data: articleData } = response
      console.log('Article details:', articleData)
      setSelectedArticle(articleData)
      onEditOpen()
    } catch (error) {
      console.error('Error fetching article details:', error)
      toast({
        title: 'Error fetching article details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUpdateArticle = async updatedData => {
    try {
      const response = await axios.put(
        `/api/admin/articles/${selectedArticle._id}`,
        updatedData,
      )
      console.log('Article updated:', response.data)
      onEditClose()
      fetchArticles()
      toast({
        title: 'Article updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating article:', error)
      toast({
        title: 'Error updating article',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleQuizChange = (paraIndex, questionIndex, field, value) => {
    const updatedQuiz = [...selectedArticle.quiz]
    const paraKey = `para${paraIndex + 1}`
    updatedQuiz[0][paraKey].questions[questionIndex] = {
      ...updatedQuiz[0][paraKey].questions[questionIndex],
      [field]: value,
    }
    setSelectedArticle({ ...selectedArticle, quiz: updatedQuiz })
  }

  const handleOptionChange = (paraIndex, questionIndex, optionKey, value) => {
    const updatedQuiz = [...selectedArticle.quiz]
    const paraKey = `para${paraIndex + 1}`
    updatedQuiz[0][paraKey].questions[questionIndex].options = {
      ...updatedQuiz[0][paraKey].questions[questionIndex].options,
      [optionKey]: value,
    }
    setSelectedArticle({ ...selectedArticle, quiz: updatedQuiz })
  }

  const addNewQuestion = paraIndex => {
    const newQuestion = {
      question: '',
      options: { a: '', b: '', c: '', d: '' },
      answer: '',
      explanation: '',
      difficulty: '0.5',
    }
    const updatedQuiz = [...selectedArticle.quiz]
    const paraKey = `para${paraIndex + 1}`
    updatedQuiz[0][paraKey].questions.push(newQuestion)
    setSelectedArticle({ ...selectedArticle, quiz: updatedQuiz })
  }

  const removeQuestion = (paraIndex, questionIndex) => {
    const updatedQuiz = [...selectedArticle.quiz]
    const paraKey = `para${paraIndex + 1}`
    updatedQuiz[0][paraKey].questions.splice(questionIndex, 1)
    setSelectedArticle({ ...selectedArticle, quiz: updatedQuiz })
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          bg="#1a1527"
          backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
          p={8}
          borderRadius="lg"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
          color="white"
          fontFamily="'Roboto', sans-serif"
        >
          <ModalHeader>Article Management</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Button colorScheme="blue">Add a new article</Button>

              <HStack>
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <IconButton
                  aria-label="Search articles"
                  icon={<SearchIcon />}
                  onClick={fetchArticles}
                />
              </HStack>

              <HStack>
                <Select
                  placeholder="Category"
                  value={filters.category}
                  onChange={e =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  {/* Add category options */}
                </Select>
                <Select
                  placeholder="Author"
                  value={filters.author}
                  onChange={e =>
                    setFilters({ ...filters, author: e.target.value })
                  }
                >
                  {/* Add author options */}
                </Select>
                <Input
                  placeholder="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={e =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
                <Input
                  placeholder="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={e =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
                <Select
                  placeholder="Has Quiz"
                  value={filters.hasQuiz}
                  onChange={e =>
                    setFilters({ ...filters, hasQuiz: e.target.value })
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </HStack>

              {articles &&
                articles.length > 0 &&
                articles.map(article => (
                  <Box
                    key={article._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{article.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                          by {article.author}
                        </Text>
                      </VStack>
                      <HStack>
                        <IconButton
                          aria-label="View article"
                          icon={<ViewIcon />}
                          onClick={() => navigate(`/article/${article._id}`)}
                        />
                        <IconButton
                          aria-label="Edit article"
                          icon={<EditIcon />}
                          onClick={() => handleEditArticle(article._id)}
                        />
                      </HStack>
                    </HStack>
                  </Box>
                ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          bg="#1a1527"
          backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
          p={8}
          borderRadius="lg"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
          color="white"
          fontFamily="'Roboto', sans-serif"
        >
          <ModalHeader>Edit Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedArticle && (
              <VStack spacing={6} align="stretch">
                {/* ... (other form controls remain the same) */}
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={selectedArticle.title || ''}
                    onChange={e =>
                      setSelectedArticle({
                        ...selectedArticle,
                        title: e.target.value,
                      })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Author</FormLabel>
                  <Input
                    value={selectedArticle.author || ''}
                    onChange={e =>
                      setSelectedArticle({
                        ...selectedArticle,
                        author: e.target.value,
                      })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Main Text</FormLabel>
                  <Textarea
                    value={selectedArticle.mainText || ''}
                    onChange={e =>
                      setSelectedArticle({
                        ...selectedArticle,
                        mainText: e.target.value,
                      })
                    }
                    minHeight="200px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Total Quiz Attempts</FormLabel>
                  <Input
                    value={selectedArticle.quizAttemptCnt}
                    onChange={e =>
                      setSelectedArticle({
                        ...selectedArticle,
                        quizAttemptCnt: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <Box>
                  <Text fontSize="xl" fontWeight="bold" mb={4}>
                    User Quiz Status
                  </Text>
                  {selectedArticle.userQuizStatus &&
                  selectedArticle.userQuizStatus.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>User Name</Th>
                          <Th>User Email</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedArticle.userQuizStatus.map((status, index) => (
                          <Tr key={index}>
                            <Td>{status.userId?.name || 'N/A'}</Td>
                            <Td>{status.userId?.email || 'N/A'}</Td>
                            <Td>{status.status || 'N/A'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text>No user quiz status available.</Text>
                  )}
                </Box>
                <Box>
                  <Text fontSize="xl" fontWeight="bold" mb={4}>
                    Quiz Details
                  </Text>
                  {selectedArticle.quiz && selectedArticle.quiz.length > 0 ? (
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
                              {selectedArticle.quiz[0][paraKey].questions.map(
                                (quizItem, questionIndex) => (
                                  <Box
                                    key={questionIndex}
                                    p={4}
                                    borderWidth="1px"
                                    borderRadius="md"
                                  >
                                    <HStack justify="space-between" mb={2}>
                                      <Text fontWeight="bold">
                                        Question {questionIndex + 1}
                                      </Text>
                                      <IconButton
                                        icon={<DeleteIcon />}
                                        onClick={() =>
                                          removeQuestion(
                                            paraIndex,
                                            questionIndex,
                                          )
                                        }
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
                                      {Object.entries(quizItem.options).map(
                                        ([key, value]) => (
                                          <Input
                                            key={key}
                                            placeholder={`Option ${key.toUpperCase()}`}
                                            value={value}
                                            onChange={e =>
                                              handleOptionChange(
                                                paraIndex,
                                                questionIndex,
                                                key,
                                                e.target.value,
                                              )
                                            }
                                            mb={2}
                                          />
                                        ),
                                      )}
                                    </FormControl>
                                    <FormControl mb={4}>
                                      <FormLabel>Answer</FormLabel>
                                      <Input
                                        value={quizItem.answer || ''}
                                        onChange={e =>
                                          handleQuizChange(
                                            paraIndex,
                                            questionIndex,
                                            'answer',
                                            e.target.value,
                                          )
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
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateArticle(selectedArticle)}
            >
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ArticleManagement
