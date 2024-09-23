import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'

const TournamentManagement = ({ isOpen, onClose }) => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const toast = useToast()
  const {
    isOpen: isQuestionModalOpen,
    onOpen: onQuestionModalOpen,
    onClose: onQuestionModalClose,
  } = useDisclosure()

  useEffect(() => {
    if (isOpen) {
      fetchTournaments()
    }
  }, [isOpen])

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/api/admin/tournament/all')
      setTournaments(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tournaments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleMaintenanceToggle = async (id, currentStatus) => {
    try {
      await axios.put(`/api/admin/tournament/${id}/maintenance`, {
        isUnderMaintenance: !currentStatus,
      })

      setTournaments(prevTournaments =>
        prevTournaments.map(tournament =>
          tournament._id === id
            ? { ...tournament, isUnderMaintenance: !currentStatus }
            : tournament,
        ),
      )

      toast({
        title: 'Success',
        description: 'Tournament maintenance status updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating maintenance status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update maintenance status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchQuestions = useCallback(async () => {
    if (!selectedTournament) return

    try {
      const params = new URLSearchParams({
        tournamentId: selectedTournament._id,
      })

      if (categoryFilter) params.append('category', categoryFilter)
      if (difficultyFilter) params.append('difficulty', difficultyFilter)

      const response = await axios.get(
        `/api/admin/tournament/questions?${params.toString()}`,
      )
      setQuestions(response.data)
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch questions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [selectedTournament, categoryFilter, difficultyFilter, toast])

  useEffect(() => {
    if (selectedTournament) {
      fetchQuestions()
    }
  }, [selectedTournament, fetchQuestions])

  const handleEditQuestion = question => {
    setEditingQuestion(question)
    onQuestionModalOpen()
  }

  const handleSaveQuestion = async () => {
    try {
      await axios.put(
        `/api/admin/tournament/question/${editingQuestion._id}`,
        editingQuestion,
      )
      fetchQuestions() // Refresh the questions list
      onQuestionModalClose()
      toast({
        title: 'Success',
        description: 'Question updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating question:', error)
      toast({
        title: 'Error',
        description: 'Failed to update question',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Tournament Management</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Box>Loading tournaments...</Box>
          ) : (
            <>
              <Table variant="simple" colorScheme="whiteAlpha">
                <Thead>
                  <Tr>
                    <Th color="gray.300">Tournament Number</Th>
                    <Th color="gray.300">Name</Th>
                    <Th color="gray.300">Under Maintenance</Th>
                    <Th color="gray.300">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tournaments.map(tournament => (
                    <Tr key={tournament._id}>
                      <Td>{tournament.tournamentNumber}</Td>
                      <Td>{tournament.name}</Td>
                      <Td>
                        <Switch
                          isChecked={tournament.isUnderMaintenance}
                          onChange={() =>
                            handleMaintenanceToggle(
                              tournament._id,
                              tournament.isUnderMaintenance,
                            )
                          }
                          colorScheme="green"
                        />
                      </Td>
                      <Td>
                        <Button
                          onClick={() => setSelectedTournament(tournament)}
                          colorScheme="blue"
                        >
                          View Questions
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Button mt={4} onClick={fetchTournaments} colorScheme="blue">
                Refresh Tournaments
              </Button>

              {selectedTournament && (
                <Box mt={8}>
                  <Heading size="md" mb={4}>
                    Questions for Tournament {selectedTournament.name}
                  </Heading>
                  <HStack spacing={4} mb={4}>
                    <FormControl>
                      <FormLabel>Category</FormLabel>
                      <Input
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        placeholder="Filter by category"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Difficulty</FormLabel>
                      <Input
                        value={difficultyFilter}
                        onChange={e => setDifficultyFilter(e.target.value)}
                        placeholder="Filter by difficulty"
                      />
                    </FormControl>
                    <Button
                      onClick={fetchQuestions}
                      colorScheme="blue"
                      alignSelf="flex-end"
                    >
                      Apply Filters
                    </Button>
                  </HStack>
                  <Table variant="simple" colorScheme="whiteAlpha">
                    <Thead>
                      <Tr>
                        <Th color="gray.300">Question</Th>
                        <Th color="gray.300">Category</Th>
                        <Th color="gray.300">Difficulty</Th>
                        <Th color="gray.300">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {questions.map(question => (
                        <Tr key={question._id}>
                          <Td>{question.question}</Td>
                          <Td>{question.category}</Td>
                          <Td>{question.difficulty}</Td>
                          <Td>
                            <Button
                              onClick={() => handleEditQuestion(question)}
                              colorScheme="yellow"
                            >
                              Edit
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>

      <Modal isOpen={isQuestionModalOpen} onClose={onQuestionModalClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Edit Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingQuestion && (
              <VStack spacing={4} align="stretch">
                <Text>Question:</Text>
                <Textarea
                  value={editingQuestion.question}
                  onChange={e =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question: e.target.value,
                    })
                  }
                />
                <Text>Hindi Question:</Text>
                <Textarea
                  value={editingQuestion.hindiQuestion}
                  onChange={e =>
                    setEditingQuestion({
                      ...editingQuestion,
                      hindiQuestion: e.target.value,
                    })
                  }
                />
                <HStack>
                  <VStack flex={1}>
                    <Text>Options:</Text>
                    {['a', 'b', 'c', 'd'].map(option => (
                      <Input
                        key={option}
                        value={editingQuestion.options[option]}
                        onChange={e =>
                          setEditingQuestion({
                            ...editingQuestion,
                            options: {
                              ...editingQuestion.options,
                              [option]: e.target.value,
                            },
                          })
                        }
                        placeholder={`Option ${option.toUpperCase()}`}
                      />
                    ))}
                  </VStack>
                  <VStack flex={1}>
                    <Text>Hindi Options:</Text>
                    {['a', 'b', 'c', 'd'].map(option => (
                      <Input
                        key={option}
                        value={editingQuestion.hindiOptions[option]}
                        onChange={e =>
                          setEditingQuestion({
                            ...editingQuestion,
                            hindiOptions: {
                              ...editingQuestion.hindiOptions,
                              [option]: e.target.value,
                            },
                          })
                        }
                        placeholder={`Hindi Option ${option.toUpperCase()}`}
                      />
                    ))}
                  </VStack>
                </HStack>
                <Text>Correct Answer:</Text>
                <Select
                  value={editingQuestion.correctAnswer}
                  onChange={e =>
                    setEditingQuestion({
                      ...editingQuestion,
                      correctAnswer: e.target.value,
                    })
                  }
                >
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </Select>
                <Text>Category:</Text>
                <Input
                  value={editingQuestion.category}
                  onChange={e =>
                    setEditingQuestion({
                      ...editingQuestion,
                      category: e.target.value,
                    })
                  }
                />
                <Text>Difficulty:</Text>
                <Input
                  value={editingQuestion.difficulty}
                  onChange={e =>
                    setEditingQuestion({
                      ...editingQuestion,
                      difficulty: e.target.value,
                    })
                  }
                />
                <Button onClick={handleSaveQuestion} colorScheme="green">
                  Save Changes
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Modal>
  )
}

export default TournamentManagement
