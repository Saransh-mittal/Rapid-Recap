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
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import GivenQuizInterface from './GivenQuizInterface'
import Loading from '../../miscellaneous/Loading'
import Heading from '../../miscellaneous/HeadingComponent'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import useSound from '../../../customHooks/useSound'
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

  const fetchQuizSummary = async () => {
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
  }

  const handleNextQuestion = () => {
    playClick()
    if (currentQuestionIndex < quizGivenSummary.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    playClick()
    if (currentQuestionIndex >= 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1)
    }
  }

  useEffect(() => {
    if (!fetchQuizSummaryFromAnotherComp) fetchQuizSummary()
    else setIsLoading(false)
  }, [])

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
                <Heading
                  title={`Total Time Taken: ${timeTaken} seconds`}
                  tag={
                    !quizGivenSummary[currentQuestionIndex].userAnswer
                      ? 'Not Answered'
                      : quizGivenSummary[currentQuestionIndex].isCorrect
                      ? 'Correct'
                      : 'Wrong'
                  }
                  tagMarginBottom={0}
                  marginBottom="0"
                  tagColor={
                    !quizGivenSummary[currentQuestionIndex].userAnswer
                      ? 'blue'
                      : quizGivenSummary[currentQuestionIndex].isCorrect
                      ? 'green'
                      : 'red'
                  }
                  tagFontSize="xl"
                  tagFontWeight="bold"
                />
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
              <GivenQuizInterface
                quizGivenSummary={quizGivenSummary}
                currentQuestionIndex={currentQuestionIndex}
              />
            </ModalBody>
            <ModalFooter
              pt={0}
              w={'100%'}
              display={'flex'}
              justifyContent={'center'}
              flexDirection={'column'}
            >
              <Text textColor={'white'} marginBottom={4} marginTop={2}>
                Explanation:{' '}
                {quizGivenSummary[currentQuestionIndex].explanation}
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
                    <Button
                      borderRadius={'full'}
                      color={'white'}
                      rightIcon={<ArrowRight />}
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
                    <Button
                      w={'100%'}
                      borderRadius={'full'}
                      color={'white'}
                      leftIcon={<ArrowLeft />}
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
