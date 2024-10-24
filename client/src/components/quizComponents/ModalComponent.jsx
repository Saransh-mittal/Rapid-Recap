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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import QuizBG from '../tournamentComponents/tournamentQuiz/QuizBG'
import FixedBackground from '../miscellaneous/FixedBackground'

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
  setMessageForTournament,
  setUserEligibleForTournament,
  timer,
  setSubmitted,
  showGetSetGo,
  quizStatus,
  size = 'full',
  isTournament = false,
}) => {
  const { t } = useTranslation('ModalComponent')

  const getColor = (defaultColor, tournamentColor) =>
    isTournament ? tournamentColor : defaultColor

  const buttonText = useMemo(() => {
    if (showInstruction) return t('StartQuiz')
    if (currentQuestionIndex < totalQuestions - 1 && !submitted)
      return t('NextQuestion')
    return t('FinishQuiz')
  }, [
    showInstruction,
    quizStatus,
    currentQuestionIndex,
    totalQuestions,
    submitted,
  ])

  const buttonAction = useCallback(() => {
    if (showInstruction) {
      return startQuiz
    }
    if (currentQuestionIndex === totalQuestions - 1 && !submitted) {
      return () =>
        handleSubmitQuiz({
          timeTaken,
          userAnswers,
          setSubmitted,
          setMessageForTournament,
          setUserEligibleForTournament,
        })
    }
    return handleNextQuestion
  }, [
    showInstruction,
    quizStatus,
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

  const handleClick = () => {
    const action = buttonAction()
    action()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnOverlayClick={false}
    >
      <ModalContent
        bg="rgba(26, 21, 39, 1)"
        bgPosition="center"
        bgSize="cover"
        bgRepeat="no-repeat"
        color={getColor('white', 'rgba(255, 223, 0, 0.9)')}
        className="animated-gradient scene"
        borderRadius="xl"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
        overflow="hidden"
        position="relative"
      >
        {isTournament ? <QuizBG /> : <FixedBackground starCount={15} />}
        {timer > 0 && (
          <SkeletonCircle
            color="red"
            isLoaded={!load}
            marginTop={load ? '10px' : '0'}
            size={load ? '20' : 'auto'}
            marginBottom={load ? '10px' : '0'}
          >
            {!submitted && timer > 0 && (
              <Suspense fallback={null}>
                <Countdown
                  timer={timer}
                  submitted={submitted}
                  start={!showInstruction && quizStatus === 'in_progress'}
                  isTournament={isTournament}
                />
              </Suspense>
            )}
          </SkeletonCircle>
        )}
        {!showGetSetGo && (
          <ModalCloseButton
            zIndex={2}
            backgroundColor={getColor('purple.300', 'rgba(255, 215, 0, 0.8)')}
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
        )}
        <ModalBody w={'100%'} h={'100%'} p={0}>
          {renderModalBody()}
        </ModalBody>
        {!submitted && (
          <Flex
            flexDirection={'column'}
            color={getColor('white', 'yellow.400')}
            w={'100%'}
          >
            {load && showInstruction && (
              <Text
                fontSize="lg"
                fontWeight={'semibold'}
                color={getColor('white', 'yellow.300')}
                textAlign={'center'}
              >
                {t('QuizIsGenerating')}
              </Text>
            )}
            {(totalQuestions || quizStatus === 'in_progress') &&
              !showGetSetGo && (
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
                    <Suspense fallback={null}>
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
                          isAnswered ||
                          showInstruction ||
                          quizStatus === 'in_progress'
                            ? getColor('purple.500', 'rgba(255, 215, 0, 0.5)')
                            : 'rgba(255, 255, 255, 0.1)'
                        }
                        _hover={{
                          bg:
                            isAnswered ||
                            showInstruction ||
                            quizStatus === 'in_progress'
                              ? getColor('purple.600', 'rgba(255, 215, 0, 0.6)')
                              : 'rgba(255, 255, 255, 0.15)',
                        }}
                        isLoading={submitLoad || load}
                      >
                        {buttonText}
                      </Button>
                    </Suspense>
                  </motion.div>
                </ModalFooter>
              )}
          </Flex>
        )}
      </ModalContent>
    </Modal>
  )
}

export default ModalComponent
