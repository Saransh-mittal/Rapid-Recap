import React, { useState } from 'react'
import {
  VStack,
  Button,
  Alert,
  AlertIcon,
  SimpleGrid,
  Box,
  Heading,
  Flex,
  Icon,
  Text,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { FaDice, FaNewspaper } from 'react-icons/fa'
import { motion } from 'framer-motion'
import CategoryCard from './CategoryCard'
import QuizConfirmationModal from './tournamentQuiz/QuizConfirmationModal'
import { useDispatch } from 'react-redux'
import QuizReport from '../quizComponents/QuizReport'

const MotionBox = motion(Box)

const categories = [
  'world',
  'politics',
  'business',
  'technology',
  'sports',
  'health',
  'science',
  'environment',
  'crime',
  'education',
  'entertainment',
  'food',
  'lifestyle',
  'tourism',
]

const CategorySelection = ({
  userSelectedcategories,
  onCategorySelect,
  onRegister,
  isRegistration = false,
  registerLoading = false,
  completedQuizzes = [], // New prop to track completed quizzes
  tournamentId,
}) => {
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [userSelectedCategories, setUserSelectedCategories] = useState([])
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCategorySelect = category => {
    if (completedQuizzes.includes(category)) {
      toast({
        title: 'Quiz Already Completed',
        description: `You have already completed the ${category} quiz.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      setSelectedCategories([category])
      setShowQuizSummary(true)
      return
    }

    if (isRegistration) {
      // For registration, allow selecting multiple categories
      if (userSelectedCategories.includes(category)) {
        const newUserSelected = userSelectedCategories.filter(
          c => c !== category,
        )
        setUserSelectedCategories(newUserSelected)
        setSelectedCategories(prevSelected =>
          prevSelected.filter(c => c !== category),
        )
      } else if (selectedCategories.length < 5) {
        setUserSelectedCategories([...userSelectedCategories, category])
        setSelectedCategories(prevSelected => [...prevSelected, category])
      }
    } else {
      // For quiz selection (non-registration), only allow one category to be selected
      if (selectedCategories.includes(category)) {
        setSelectedCategories([])
      } else {
        setSelectedCategories([category])
      }
    }
  }

  const handleRandomPick = () => {
    const remainingCount = 5 - userSelectedCategories.length
    if (remainingCount <= 0) return

    const availableCategories = categories.filter(
      category => !userSelectedCategories.includes(category),
    )
    const shuffled = availableCategories.sort(() => 0.5 - Math.random())
    const newSelections = shuffled.slice(0, remainingCount)

    setSelectedCategories([...userSelectedCategories, ...newSelections])
  }

  const handleSubmit = () => {
    if (isRegistration) {
      if (selectedCategories.length !== 5) {
        toast({
          title: 'Invalid Selection',
          description: 'Please select exactly 5 categories.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        return
      }
      onRegister([...selectedCategories, 'current affairs'])
    } else {
      // This is for quiz selection during the tournament
      onOpen()
    }
  }

  const startQuiz = () => {
    onClose()
    onCategorySelect(selectedCategories[0])
  }

  return (
    <>
      <VStack spacing={6} align="stretch">
        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md" color="white">
              {isRegistration
                ? 'Select 5 categories:'
                : 'Select a category to start your quiz:'}
            </Heading>
            {isRegistration && (
              <Button
                onClick={handleRandomPick}
                variant="outline"
                size="md"
                fontWeight="medium"
                leftIcon={<Icon as={FaDice} />}
                color="pink.300"
                borderColor="pink.300"
                _hover={{
                  bg: 'rgba(237, 100, 166, 0.1)',
                  borderColor: 'pink.400',
                  color: 'pink.400',
                  boxShadow: '0px 0px 8px rgba(237, 100, 166, 0.4)',
                }}
                _active={{
                  bg: 'rgba(237, 100, 166, 0.2)',
                  transform: 'scale(0.95)',
                }}
                transition="all 0.2s"
              >
                Quick Pick
              </Button>
            )}
          </Flex>
          {isRegistration && (
            <Text color="gray.600" fontWeight="bold" mb={2}>
              Note: Current Affairs is compulsory.
            </Text>
          )}
          <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} spacing={4}>
            {(userSelectedcategories && userSelectedcategories.length > 0
              ? userSelectedcategories
              : categories
            ).map(category => (
              <CategoryCard
                key={category}
                category={category}
                isSelected={selectedCategories.includes(category)}
                onSelect={handleCategorySelect}
                isCompleted={completedQuizzes.includes(category)}
              />
            ))}
            {isRegistration && (
              <MotionBox
                borderWidth="1px"
                borderRadius="lg"
                borderColor="pink.500"
                bg="rgba(237, 100, 166, 0.1)"
                p={4}
                cursor="not-allowed"
                boxShadow="0 0 0 2px rgba(237, 100, 166, 0.6)"
              >
                <VStack spacing={2}>
                  <Box as={FaNewspaper} size="30px" color="pink.400" />
                  <Text
                    fontWeight="bold"
                    textAlign="center"
                    fontSize="sm"
                    color="pink.400"
                    textTransform="capitalize"
                  >
                    Current Affairs
                  </Text>
                </VStack>
              </MotionBox>
            )}
          </SimpleGrid>
        </Box>
        <Button
          colorScheme="pink"
          onClick={handleSubmit}
          size="lg"
          fontWeight="bold"
          boxShadow="0px 4px 10px rgba(237, 100, 166, 0.3)"
          _hover={{
            boxShadow: '0px 6px 15px rgba(237, 100, 166, 0.4)',
            transform: 'translateY(-2px)',
          }}
          transition="all 0.2s"
          isLoading={registerLoading}
          isDisabled={
            !isRegistration &&
            (selectedCategories.length !== 1 ||
              completedQuizzes.includes(selectedCategories[0]))
          }
        >
          {`Start Quiz${selectedCategories.length >= 1 ? ' :' : ''} ${
            selectedCategories[0] || ''
          }`}
        </Button>
        <QuizConfirmationModal
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={startQuiz}
          category={selectedCategories[0]}
        />
      </VStack>
      {showQuizSummary && (
        <QuizReport
          isOpen={showQuizSummary}
          onClose={() => {
            onClose()
            setShowQuizSummary(false)
          }}
          isTournament={true}
          tournamentId={tournamentId}
          category={selectedCategories[0]}
        />
      )}
    </>
  )
}

export default CategorySelection
