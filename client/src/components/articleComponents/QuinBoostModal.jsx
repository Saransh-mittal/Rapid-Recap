import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Box,
  Flex,
  Progress,
  Button,
  VStack,
  Badge,
  useMediaQuery,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Star, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const QuinBoostModal = ({
  isOpen,
  onClose,
  currentQuizCount = 0,
  isStateBoosted,
}) => {
  const { t } = useTranslation('QuinBoostModal')
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  const getNextBoostThreshold = count => Math.floor(count / 6) * 6 + 6
  const nextBoost = getNextBoostThreshold(currentQuizCount)
  const quizzesRemaining = nextBoost - currentQuizCount
  const progress = ((currentQuizCount % 6) / 5) * 100

  const isQuinBoostActivated =
    currentQuizCount > 0 && currentQuizCount % 5 === 0

  const MotionBox = motion(Box)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isLargerThan768 ? '2xl' : 'full'}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(8px)" />
      <ModalContent
        bg="linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
        color="white"
        mx={4}
        borderRadius="xl"
        boxShadow="0 0 20px rgba(255, 255, 255, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <ModalCloseButton />
        <ModalHeader>
          <Flex
            direction="column"
            align="center"
            pb={6}
            borderBottom="2px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <Flex align="center" gap={3}>
              <Star size={28} color="#FFD700" />
              <Text
                fontSize={['3xl', '4xl']}
                fontWeight="bold"
                bgGradient="linear(to-r, #FFD700, #FFA500)"
                bgClip="text"
                letterSpacing="wide"
              >
                {t('Quin Boost')}
              </Text>
              <Star size={28} color="#FFD700" />
            </Flex>
            <Text
              color="gray.400"
              fontSize="lg"
              fontStyle="italic"
              mt={3}
              textAlign="center"
            >
              {isQuinBoostActivated ? t('boostActivated') : t('levelUpSkill')}
            </Text>
          </Flex>
        </ModalHeader>

        <ModalBody py={8}>
          <VStack spacing={8}>
            <MotionBox
              w="full"
              bg={
                isQuinBoostActivated
                  ? 'rgba(255, 215, 0, 0.1)'
                  : 'rgba(255, 255, 255, 0.05)'
              }
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor={
                isQuinBoostActivated
                  ? 'rgba(255, 215, 0, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)'
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: isQuinBoostActivated
                  ? 'rgba(255, 215, 0, 0.15)'
                  : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Clock size={24} color="#FFD700" />
                <Text fontSize="xl" fontWeight="bold">
                  {isQuinBoostActivated
                    ? t('QuinBoostActivated')
                    : isStateBoosted
                    ? t('QuinBoostActive')
                    : t('QuinBoostInactive')}
                </Text>
              </Flex>

              <Box mb={4}>
                <Flex justify="space-between" mb={2}>
                  <Text color="gray.300">
                    {t('Current Quiz')}: {currentQuizCount}
                  </Text>
                  <Badge
                    bg="rgba(255, 215, 0, 0.2)"
                    color="#FFD700"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {isQuinBoostActivated
                      ? t('BoostActive')
                      : `${t('Next Boost')}: ${nextBoost}`}
                  </Badge>
                </Flex>
                <Progress
                  value={progress}
                  size="lg"
                  borderRadius="full"
                  colorScheme="yellow"
                  bg="whiteAlpha.200"
                  sx={{
                    '& > div': {
                      background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    },
                  }}
                />
              </Box>

              <Text color="gray.400" fontSize="md" textAlign="center">
                {isQuinBoostActivated
                  ? t('boostActivatedMessage')
                  : quizzesRemaining > 0
                  ? `${quizzesRemaining - 1} ${t('quizzesUntilBoost')}`
                  : t('boostReady')}
              </Text>
            </MotionBox>

            <MotionBox
              w="full"
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Star size={24} color="#FFD700" />
                <Text fontSize="xl" fontWeight="bold">
                  {t('SuperchargeRQM')}
                </Text>
              </Flex>
              <Text color="gray.400">{t('boostDescription')}</Text>
            </MotionBox>

            <MotionBox
              w="full"
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Flex align="center" gap={3} mb={4}>
                <Clock size={24} color="#FFD700" />
                <Text fontSize="xl" fontWeight="bold">
                  {t('ActivationPattern')}
                </Text>
              </Flex>
              <Text color="gray.400">{t('activationDescription')}</Text>
            </MotionBox>
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="2px solid"
          borderColor="rgba(255, 255, 255, 0.1)"
          pt={6}
        >
          <Button
            w="full"
            size="lg"
            bg="linear-gradient(90deg, #FFD700, #FFA500)"
            color="black"
            _hover={{
              bg: 'linear-gradient(90deg, #FFA500, #FF8C00)',
              transform: 'translateY(-2px)',
            }}
            onClick={onClose}
            fontWeight="bold"
            letterSpacing="wide"
          >
            {t('Continue')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default QuinBoostModal
