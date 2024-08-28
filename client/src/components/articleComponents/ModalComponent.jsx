import React, { useMemo, useCallback, lazy, Suspense } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  ModalCloseButton,
  Text,
  Flex,
  Skeleton,
  SkeletonCircle,
  Spinner,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Lazy load components and assets
const Countdown = lazy(() => import('./Countdown'))
const ArrowRightSVG = lazy(() => import('../../assets/svg/ArrowRightSVG'))

const ModalComponent = ({
  isAnswered,
  isOpen,
  onClose,
  setIsCloseButtonHovered,
  renderModalBody,
  load,
  showInstruction,
  startQuiz,
  handleNextQuestion,
  currentQuestionIndex,
  totalQuestions,
  submitted,
  submitLoad,
  timeTaken,
  userAnswers,
  handleSubmitQuiz,
  timer,
  setSubmitted,
  showGetSetGo,
}) => {
  const textColor = 'white'
  const { t } = useTranslation('ModalComponent')

  // Memoize the button text based on the state
  const buttonText = useMemo(() => {
    if (showInstruction) return t('StartQuiz')
    if (currentQuestionIndex < totalQuestions - 1 && !submitted)
      return t('NextQuestion')
    return t('FinishQuiz')
  }, [showInstruction, currentQuestionIndex, totalQuestions, submitted])

  const buttonAction = useCallback(() => {
    if (showInstruction) {
      return startQuiz
    }
    if (currentQuestionIndex === totalQuestions - 1 && !submitted) {
      return () => handleSubmitQuiz({ timeTaken, userAnswers, setSubmitted })
    }
    return handleNextQuestion
  }, [
    showInstruction,
    startQuiz,
    currentQuestionIndex,
    totalQuestions,
    submitted,
    handleSubmitQuiz,
    timeTaken,
    userAnswers,
    setSubmitted,
    handleNextQuestion,
  ])

  // Adding a simple console log to check if the function is being called
  const handleClick = () => {
    const action = buttonAction()
    action()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '2xl' }}>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(40px) hue-rotate(90deg)"
      />
      <ModalContent
        bg="rgba(26, 21, 39, 0.9)"
        color={textColor}
        borderRadius="xl"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
        className="animated-gradient scene"
        overflow={'hidden'}
      >
        {timer && (
          <SkeletonCircle
            color="red"
            isLoaded={!load}
            marginTop={load ? '10px' : '0'}
            size={load ? '20' : 'auto'}
            marginBottom={load ? '10px' : '0'}
          >
            {!submitted && timer && (
              <Suspense fallback={<Spinner />}>
                <Countdown
                  timer={timer}
                  submitted={submitted}
                  start={!showInstruction}
                />
              </Suspense>
            )}
          </SkeletonCircle>
        )}
        <ModalCloseButton
          zIndex={1}
          backgroundColor="purple.300"
          style={{
            right: '10px',
            color: 'white',
            transition: 'background-color 0.3s, color 0.3s',
          }}
          onMouseEnter={() =>
            setIsCloseButtonHovered && setIsCloseButtonHovered(true)
          }
          onMouseLeave={() =>
            setIsCloseButtonHovered && setIsCloseButtonHovered(false)
          }
        />
        <ModalBody w={'100%'} h={'100%'} p={0}>
          {renderModalBody()}
        </ModalBody>
        {!submitted && (
          <Flex flexDirection={'column'} color={'white'} w={'100%'}>
            {load && showInstruction && (
              <Text
                fontSize="lg"
                fontWeight={'semibold'}
                color={textColor}
                textAlign={'center'}
              >
                {t('QuizIsGenerating')}
              </Text>
            )}
            <Skeleton
              isLoaded={!load}
              borderRadius={'10px'}
              marginBottom={load ? '10px' : ''}
              w={'100%'}
            >
              {totalQuestions && !showGetSetGo && (
                <ModalFooter w={'100%'}>
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
                    <Suspense fallback={<Spinner />}>
                      <Button
                        borderRadius={'full'}
                        color={'white'}
                        rightIcon={
                          <ArrowRightSVG
                            height={'20px'}
                            width={'20px'}
                            fill={'#fff'}
                          />
                        }
                        onClick={handleClick}
                        isDisabled={showInstruction ? false : !isAnswered}
                        size="lg"
                        width={{ base: '100%', lg: '50%' }}
                        bg={
                          isAnswered || showInstruction
                            ? 'purple.500'
                            : 'rgba(255, 255, 255, 0.1)'
                        }
                        _hover={{
                          bg:
                            isAnswered || showInstruction
                              ? 'purple.600'
                              : 'rgba(255, 255, 255, 0.15)',
                        }}
                        isLoading={submitLoad}
                      >
                        {buttonText}
                      </Button>
                    </Suspense>
                  </motion.div>
                </ModalFooter>
              )}
            </Skeleton>
          </Flex>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalComponent
