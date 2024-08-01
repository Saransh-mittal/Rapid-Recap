// src/components/ModalComponent.js

import React from 'react'
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
  useColorModeValue,
} from '@chakra-ui/react'
import Countdown from './Countdown'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const ModalComponent = ({
  isAnswered,
  isOpen,
  onClose,
  isCloseButtonHovered,
  setIsCloseButtonHovered,
  isStartQuizButtonHovered,
  setIsStartQuizButtonHovered,
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
  state,
  isQuinBoostAvailable,
  showSubmittedInterface,
}) => {
  const textColor = 'white'

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
        {timer ? (
          <SkeletonCircle
            color="red"
            isLoaded={!load}
            marginTop={load ? '10px' : '0'}
            size={load ? '20' : 'auto'}
            marginBottom={load ? '10px' : '0'}
          >
            {!submitted && timer ? (
              <Countdown
                timer={timer}
                submitted={submitted}
                start={!showInstruction}
              />
            ) : null}
          </SkeletonCircle>
        ) : null}
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
                Quiz is generating. Wait for the start button....
              </Text>
            )}
            <Skeleton
              isLoaded={!load}
              borderRadius={'10px'}
              marginBottom={load ? '10px' : ''}
              w={'100%'}
            >
              {totalQuestions && (
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
                    <Button
                      borderRadius={'full'}
                      color={'white'}
                      rightIcon={<ArrowRight />}
                      onClick={
                        showInstruction
                          ? startQuiz
                          : currentQuestionIndex === totalQuestions - 1 &&
                            !submitted
                          ? () =>
                              handleSubmitQuiz({
                                timeTaken,
                                userAnswers,
                                setSubmitted,
                              })
                          : handleNextQuestion
                      }
                      isDisabled={showInstruction ? false : !isAnswered}
                      mt={5}
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
                      {showInstruction
                        ? 'Start Quiz'
                        : currentQuestionIndex < totalQuestions - 1 &&
                          !submitted
                        ? 'Next Question'
                        : 'Finish Quiz'}
                    </Button>
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
