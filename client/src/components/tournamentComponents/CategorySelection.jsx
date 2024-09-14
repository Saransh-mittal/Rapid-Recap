import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react'
import {
  VStack,
  Button,
  SimpleGrid,
  Box,
  Heading,
  Flex,
  Text,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next' // Import useTranslation

// Lazy load components
const CategoryCard = lazy(() => import('./CategoryCard'))
const QuizConfirmationModal = lazy(() =>
  import('./tournamentQuiz/QuizConfirmationModal'),
)
const QuizReport = lazy(() => import('../quizComponents/QuizReport'))
const Dice = lazy(() => import('../../assets/svg/Dice'))
const Newspaper = lazy(() => import('../../assets/svg/Newspaper'))

const MotionBox = motion(Box)

const categoriesList = [
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
  tournamentId,
}) => {
  const { t } = useTranslation('CategorySelection') // Translation hook

  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [quickPickedCategories, setQuickPickedCategories] = useState([])
  const [quickPickActive, setQuickPickActive] = useState(false)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { completedCategories: completedQuizzes } = useSelector(
    state => state.tournament,
  )

  const handleCategorySelect = useCallback(
    category => {
      if (completedQuizzes.includes(category)) {
        setSelectedCategories([category])
        setShowQuizSummary(true)
        return
      }

      setSelectedCategories(prevSelected => {
        if (prevSelected.includes(category)) {
          // Allow deselection
          return prevSelected.filter(c => c !== category)
        } else if (isRegistration && prevSelected.length < 5) {
          // Allow selection up to 5 categories for registration
          return [...prevSelected, category]
        } else if (!isRegistration) {
          // For non-registration, only allow one selection
          return [category]
        }
        return prevSelected
      })
      // Remove the category from quickPickedCategories if it was there
      setQuickPickedCategories(prev => prev.filter(c => c !== category))
    },
    [completedQuizzes, isRegistration],
  )

  const handleRandomPick = useCallback(() => {
    const remainingCount = 5 - selectedCategories.length
    if (remainingCount <= 0) return

    const availableCategories = categoriesList.filter(
      category =>
        !selectedCategories.includes(category) &&
        !completedQuizzes.includes(category),
    )
    const shuffled = availableCategories.sort(() => 0.5 - Math.random())
    const newSelections = shuffled.slice(0, remainingCount)

    setSelectedCategories(prev => [...prev, ...newSelections])
    setQuickPickedCategories(prev => [...prev, ...newSelections])
    setQuickPickActive(true)
  }, [selectedCategories, completedQuizzes])

  const handleQuickPick = useCallback(() => {
    if (quickPickActive) {
      // Remove only the categories selected by quick pick
      setSelectedCategories(prev =>
        prev.filter(category => !quickPickedCategories.includes(category)),
      )
      setQuickPickedCategories([])
      setQuickPickActive(false)
    } else {
      handleRandomPick()
    }
  }, [quickPickActive, quickPickedCategories, handleRandomPick])

  const handleSubmit = useCallback(() => {
    if (isRegistration) {
      if (selectedCategories.length !== 5) {
        toast({
          title: t('invalidSelectionTitle'),
          description: t('invalidSelectionDescription'),
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        return
      }
      onRegister([...selectedCategories])
    } else {
      onOpen()
    }
  }, [isRegistration, selectedCategories, toast, onOpen, onRegister, t])

  const startQuiz = useCallback(() => {
    onClose()
    onCategorySelect(selectedCategories[0])
  }, [onClose, onCategorySelect, selectedCategories])

  const categoryOptions = useMemo(
    () =>
      userSelectedcategories && userSelectedcategories.length > 0
        ? userSelectedcategories
        : categoriesList,
    [userSelectedcategories],
  )

  return (
    <>
      <VStack spacing={6} align="stretch">
        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md" color="white">
              {isRegistration
                ? t('selectFiveCategories')
                : t('selectCategoryStartQuiz')}
            </Heading>
            {isRegistration && (
              <Suspense fallback={<Button isLoading>{t('loading')}</Button>}>
                <Button
                  onClick={handleQuickPick}
                  variant="outline"
                  size="md"
                  fontWeight="medium"
                  leftIcon={
                    <Dice
                      size={'16px'}
                      color={quickPickActive ? '#68D391' : '#ED64A6'}
                    />
                  }
                  color={quickPickActive ? 'green.300' : 'pink.300'}
                  borderColor={quickPickActive ? 'green.300' : 'pink.300'}
                  _hover={{
                    bg: quickPickActive
                      ? 'rgba(104, 211, 145, 0.1)'
                      : 'rgba(237, 100, 166, 0.1)',
                    borderColor: quickPickActive ? 'green.400' : 'pink.400',
                    color: quickPickActive ? 'green.400' : 'pink.400',
                    boxShadow: quickPickActive
                      ? '0px 0px 8px rgba(104, 211, 145, 0.4)'
                      : '0px 0px 8px rgba(237, 100, 166, 0.4)',
                  }}
                  _active={{
                    bg: quickPickActive
                      ? 'rgba(104, 211, 145, 0.2)'
                      : 'rgba(237, 100, 166, 0.2)',
                    transform: 'scale(0.95)',
                  }}
                  transition="all 0.2s"
                >
                  {quickPickActive ? t('clearQuickPick') : t('quickPick')}
                </Button>
              </Suspense>
            )}
          </Flex>
          {isRegistration && (
            <Text color="gray.600" fontWeight="bold" mb={2}>
              {t('currentAffairsNote')}
            </Text>
          )}
          <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} spacing={4}>
            {categoryOptions.map(category => (
              <Suspense
                key={category}
                fallback={<Box p={4}>{t('loading')}</Box>}
              >
                <CategoryCard
                  category={category}
                  isSelected={selectedCategories.includes(category)}
                  onSelect={handleCategorySelect}
                  isCompleted={completedQuizzes.includes(category)}
                />
              </Suspense>
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
                  <Suspense fallback={null}>
                    <Newspaper size="32px" color="#ED64A6" />
                  </Suspense>
                  <Text
                    fontWeight="bold"
                    textAlign="center"
                    fontSize="sm"
                    color="pink.400"
                    textTransform="capitalize"
                  >
                    {t('currentAffairs')}
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
            !isRegistration
              ? selectedCategories.length !== 1 ||
                completedQuizzes.includes(selectedCategories[0])
              : selectedCategories.length !== 5
          }
        >
          {isRegistration ? `Register` : t('startQuiz')}
          {selectedCategories[0] &&
          !isRegistration &&
          !completedQuizzes.includes(selectedCategories[0])
            ? ` : ${selectedCategories[0]}`
            : ''}
        </Button>
        <Suspense fallback={<Box>{t('loadingModal')}</Box>}>
          <QuizConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={startQuiz}
            category={selectedCategories[0]}
          />
        </Suspense>
      </VStack>
      {showQuizSummary && (
        <Suspense fallback={<Box>{t('loadingQuizReport')}</Box>}>
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
        </Suspense>
      )}
    </>
  )
}

export default CategorySelection
