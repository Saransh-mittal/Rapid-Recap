// components/quickClashComponents/ResultsModal.jsx
import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
  VStack,
  Text,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, ArrowLeft } from 'lucide-react'

const MotionBox = motion(Box)

const ResultsModal = ({ isOpen, onClose, score, scoreDetails, navigateToList, challenge, user }) => {
  const { t } = useTranslation('QuickClash')

  // Determine betting info
  const userId = user?._id
  const isChallenger = challenge?.challenger?._id === userId || challenge?.challenger === userId
  const betInfo = isChallenger ? challenge?.betting?.challenger : challenge?.betting?.opponent
  const opponentBetInfo = isChallenger ? challenge?.betting?.opponent : challenge?.betting?.challenger

  const hasBet = betInfo?.betPlaced
  const isSettled = challenge?.betting?.settled
  const betResult = betInfo?.betResult
  const trophiesGained = betInfo?.trophiesGained || 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
      motionPreset="scale"
      size="md"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="rgba(26, 21, 39, 0.95)"
        borderWidth="1px"
        borderColor="purple.500"
        borderRadius="xl"
        boxShadow="0 4px 20px rgba(138, 43, 226, 0.3)"
      >
        <ModalHeader color="white">
          <HStack>
            <Icon as={Trophy} color="yellow.400" />
            <Text>{t('Challenge Complete!')}</Text>
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              <Icon as={Trophy} boxSize="80px" color="yellow.400" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <VStack spacing={2} mt={4}>
                  <Text fontSize="lg" color="whiteAlpha.900">
                    {t('Your Score')}
                  </Text>
                  <Text
                    fontSize="5xl"
                    fontWeight="bold"
                    color="white"
                    bgGradient="linear(to-r, yellow.300, orange.400)"
                    bgClip="text"
                  >
                    {score}
                  </Text>

                  {/* Score Breakdown Badges */}
                  {scoreDetails && (
                    <VStack spacing={2} mt={1}>
                      {scoreDetails.precisionBonus > 0 && (
                        <Badge
                          colorScheme="cyan"
                          variant="solid"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          boxShadow="0 0 10px rgba(0, 255, 255, 0.3)"
                        >
                          +{scoreDetails.precisionBonus} Precision Protocol
                        </Badge>
                      )}
                      {scoreDetails.scoreSurgeBonus > 0 && (
                        <Badge
                          colorScheme="orange"
                          variant="solid"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          boxShadow="0 0 10px rgba(255, 165, 0, 0.3)"
                        >
                          +{scoreDetails.scoreSurgeBonus} Score Surge
                        </Badge>
                      )}
                    </VStack>
                  )}
                </VStack>
              </motion.div>
            </MotionBox>

            {/* Betting Results Section */}
            {hasBet && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ width: '100%' }}
              >
                <Box
                  bg="whiteAlpha.100"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  w="100%"
                >
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="sm" fontWeight="bold" color="purple.300">
                      {t('Betting Results')}
                    </Text>

                    <HStack justify="space-between">
                      <Text color="whiteAlpha.800">{t('You bet:')}</Text>
                      <HStack>
                        <Icon as={Trophy} color="yellow.500" boxSize={3} />
                        <Text fontWeight="bold" color="white">{betInfo.betAmount}</Text>
                      </HStack>
                    </HStack>

                    {isSettled ? (
                      <>
                        <HStack justify="space-between">
                          <Text color="whiteAlpha.800">{t('Opponent bet:')}</Text>
                          <HStack>
                            <Icon as={Trophy} color="yellow.500" boxSize={3} />
                            <Text fontWeight="bold" color="white">{opponentBetInfo?.betAmount || 0}</Text>
                          </HStack>
                        </HStack>

                        <Box h="1px" bg="whiteAlpha.200" my={1} />

                        <HStack justify="space-between">
                          <Text fontWeight="bold" color={betResult === 'won' ? 'green.300' : betResult === 'lost' ? 'red.300' : 'gray.300'}>
                            {betResult === 'won' ? t('YOU WON') : betResult === 'lost' ? t('YOU LOST') : t('RETURNED')}
                          </Text>
                          <HStack>
                            <Text
                              fontWeight="bold"
                              color={trophiesGained > 0 ? 'green.300' : trophiesGained < 0 ? 'red.300' : 'white'}
                            >
                              {trophiesGained > 0 ? '+' : ''}{trophiesGained}
                            </Text>
                            <Icon as={Trophy} color="yellow.500" boxSize={3} />
                          </HStack>
                        </HStack>
                      </>
                    ) : (
                      <Text fontSize="xs" color="whiteAlpha.600" fontStyle="italic">
                        {t('Opponent\'s bet hidden until they finish')}
                      </Text>
                    )}
                  </VStack>
                </Box>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Alert
                status="info"
                variant="subtle"
                borderRadius="md"
                bg="rgba(66, 153, 225, 0.15)"
                borderLeftWidth="4px"
                borderLeftColor="blue.400"
              >
                <AlertIcon color="blue.400" />
                <Box>
                  <AlertTitle color="blue.200">
                    {t('Score Recorded!')}
                  </AlertTitle>
                  <AlertDescription color="whiteAlpha.900">
                    {t(
                      'Check back later to see the final results once your opponent completes the challenge.',
                    )}
                  </AlertDescription>
                </Box>
              </Alert>
            </motion.div>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            as={motion.button}
            onClick={navigateToList}
            bgGradient="linear(to-r, purple.500, purple.700)"
            _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
            rightIcon={<ArrowLeft />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Return to Challenges')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ResultsModal
