import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import Loading from '../../miscellaneous/Loading'
import { motion } from 'framer-motion'
import useSound from '../../../customHooks/useSound'

// Lazy load components and assets
const GivenQuizInterface = lazy(() => import('./GivenQuizInterface'))
const Heading = lazy(() => import('../../miscellaneous/HeadingComponent'))
const ArrowLeftSVG = lazy(() => import('../../../assets/svg/ArrowLeftSVG'))
const ArrowRightSVG = lazy(() => import('../../../assets/svg/ArrowRightSVG'))

const QuizGivenSummary = ({
  isOpen,
  onClose,
  articleId,
  fetchQuizSummaryFromAnotherComp,
  timeTakenInitial = 0,
  quizGivenSummaryInitial = [],
}) => {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false)
  const [quizGivenSummary, setQuizGivenSummary] = useState(
    quizGivenSummaryInitial,
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeTaken, setTimeTaken] = useState(timeTakenInitial)
  const { playClick } = useSound()

  const fetchQuizSummary = useCallback(async () => {
    try {
      const response = await axios.get(`/api/quiz/summary/${articleId}`)
      setTimeTaken(response.data.timeTaken)
      setQuizGivenSummary(() => [...response.data.result])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error fetching quiz summary',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [articleId, toast])

  const handleNextQuestion = useCallback(() => {
    playClick()
    setCurrentQuestionIndex(prevIndex =>
      Math.min(prevIndex + 1, quizGivenSummary.length - 1),
    )
  }, [playClick, quizGivenSummary.length])

  const handlePrevQuestion = useCallback(() => {
    playClick()
    setCurrentQuestionIndex(prevIndex => Math.max(prevIndex - 1, 0))
  }, [playClick])

  useEffect(() => {
    if (!fetchQuizSummaryFromAnotherComp) fetchQuizSummary()
    else setIsLoading(false)
  }, [fetchQuizSummary, fetchQuizSummaryFromAnotherComp])

  const currentQuestion = useMemo(
    () => quizGivenSummary[currentQuestionIndex],
    [quizGivenSummary, currentQuestionIndex],
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl' }}>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(40px) hue-rotate(90deg)"
      />

      <ModalContent
        bg="rgba(26, 21, 39, 0.9)"
        color={'white'}
        borderRadius="xl"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
      >
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <ModalHeader
              maxHeight={'100px'}
              p={0}
              color={'white'}
              display={'flex'}
              alignItems={'center'}
            >
              <Flex flexDirection={'column'}>
                <Suspense fallback={<Loading />}>
                  <Heading
                    title={`Total Time Taken: ${timeTaken} seconds`}
                    tag={
                      !currentQuestion.userAnswer
                        ? 'Not Answered'
                        : currentQuestion.isCorrect
                        ? 'Correct'
                        : 'Wrong'
                    }
                    tagMarginBottom={0}
                    marginBottom="0"
                    tagColor={
                      !currentQuestion.userAnswer
                        ? 'blue'
                        : currentQuestion.isCorrect
                        ? 'green'
                        : 'red'
                    }
                    tagFontSize="xl"
                    tagFontWeight="bold"
                  />
                </Suspense>
              </Flex>
            </ModalHeader>
            <ModalCloseButton
              style={{
                right: '10px',
                transition: 'backgroundColor 0.3s, color 0.3s',
              }}
              onMouseEnter={() => setIsCloseButtonHovered(true)}
              onMouseLeave={() => setIsCloseButtonHovered(false)}
              bg={'purple.300'}
            />
            <ModalBody
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
              width={'100%'}
              userSelect={'none'}
              px={'15px'}
              py={0}
            >
              <Suspense fallback={<Loading />}>
                <GivenQuizInterface
                  quizGivenSummary={quizGivenSummary}
                  currentQuestionIndex={currentQuestionIndex}
                />
              </Suspense>
            </ModalBody>
            <ModalFooter
              pt={0}
              w={'100%'}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
            >
              <Text textColor={'white'} marginBottom={4} marginTop={2}>
                Explanation: {currentQuestion.explanation}
              </Text>
              <Flex
                justifyContent={'center'}
                gap={'40px'}
                w="100%"
                flexDirection={'row-reverse'}
              >
                {currentQuestionIndex < quizGivenSummary.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Suspense fallback={<Loading />}>
                      <Button
                        borderRadius={'full'}
                        color={'white'}
                        rightIcon={
                          <ArrowRightSVG
                            width={'20px'}
                            height={'20px'}
                            fill={'#fff'}
                          />
                        }
                        onClick={handleNextQuestion}
                        mt={5}
                        size={'lg'}
                        width={'150px'}
                        bg={'purple.500'}
                        _hover={{
                          bg: 'purple.600',
                        }}
                      >
                        Next
                      </Button>
                    </Suspense>
                  </motion.div>
                )}
                {currentQuestionIndex >= 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Suspense fallback={<Loading />}>
                      <Button
                        w={'100%'}
                        borderRadius={'full'}
                        color={'white'}
                        leftIcon={
                          <ArrowLeftSVG
                            width={'20px'}
                            height={'20px'}
                            fill={'#fff'}
                          />
                        }
                        onClick={handlePrevQuestion}
                        mt={5}
                        size={'lg'}
                        width={'150px'}
                        bg={'purple.500'}
                        _hover={{
                          bg: 'purple.600',
                        }}
                      >
                        Previous
                      </Button>
                    </Suspense>
                  </motion.div>
                )}
              </Flex>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default QuizGivenSummary
