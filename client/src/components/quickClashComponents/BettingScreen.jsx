import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  SimpleGrid,
  Button,
  HStack,
  Icon,
  useToast,
  Flex,
  Badge,
  Progress,
} from '@chakra-ui/react'
import { FaTrophy, FaLock, FaClock } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const BettingScreen = ({
  challengeId,
  currentTrophies,
  onComplete,
  user,
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [selectedBet, setSelectedBet] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bet options
  const betOptions = [0, 1, 2, 5, 10]

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAutoSubmit = async () => {
    // If time runs out and no bet selected, default to 0
    if (selectedBet === null) {
      await handlePlaceBet(0)
    } else {
      // If bet selected but not confirmed, submit it
      await handlePlaceBet(selectedBet)
    }
  }

  const handlePlaceBet = async amount => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Call API to place bet
      await axios.post(`/api/quickClash/challenge/${challengeId}/bet`, {
        amount,
      })

      toast({
        title: t('Bet Placed'),
        description: t('You bet {{amount}} trophies', { amount }),
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      // Proceed to next phase
      onComplete(amount)
    } catch (error) {
      console.error('Error placing bet:', error)

      // If error (e.g., insufficient funds), try placing 0 bet as fallback
      if (amount > 0) {
        toast({
          title: t('Bet Failed'),
          description: t('Insufficient trophies or error. Defaulting to 0.'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        try {
            await axios.post(`/api/quickClash/challenge/${challengeId}/bet`, {
                amount: 0,
            })
            onComplete(0)
        } catch (retryError) {
             // If even 0 fails, just proceed locally to unblock user
             console.error('Error placing fallback bet:', retryError)
             onComplete(0)
        }
      } else {
         // If 0 bet failed, just proceed
         onComplete(0)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100%"
      w="100%"
      p={4}
      position="relative"
    >
      <VStack spacing={8} w="100%" maxW="md">
        {/* Header Section */}
        <VStack spacing={2}>
          <HStack
            bg="whiteAlpha.200"
            px={4}
            py={2}
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.300"
          >
            <Icon as={FaClock} color={timeLeft <= 10 ? 'red.400' : 'blue.400'} />
            <Text
              fontWeight="bold"
              color={timeLeft <= 10 ? 'red.400' : 'white'}
              fontSize="lg"
            >
              {timeLeft}s
            </Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            {t('Place Your Bet')}
          </Text>
          <Text color="whiteAlpha.700" textAlign="center">
            {t('Winner takes all! Bets are hidden until the end.')}
          </Text>
        </VStack>

        {/* Current Balance */}
        <HStack
          bg="purple.900"
          px={6}
          py={3}
          borderRadius="xl"
          border="1px solid"
          borderColor="purple.500"
          boxShadow="0 0 20px rgba(128, 90, 213, 0.3)"
        >
          <Icon as={FaTrophy} color="yellow.400" boxSize={6} />
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase">
              {t('Your Balance')}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="white">
              {currentTrophies}
            </Text>
          </VStack>
        </HStack>

        {/* Bet Options Grid */}
        <SimpleGrid columns={3} spacing={4} w="100%">
          {betOptions.map(amount => {
            const canAfford = currentTrophies >= amount
            const isSelected = selectedBet === amount

            return (
              <MotionButton
                key={amount}
                onClick={() => canAfford && setSelectedBet(amount)}
                isDisabled={!canAfford || isSubmitting}
                h="auto"
                py={6}
                variant="unstyled"
                position="relative"
                whileHover={canAfford ? { scale: 1.05 } : {}}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                display="flex"
                flexDirection="column"
                bg={
                  isSelected
                    ? 'purple.500'
                    : canAfford
                    ? 'whiteAlpha.100'
                    : 'whiteAlpha.50'
                }
                border="2px solid"
                borderColor={
                  isSelected
                    ? 'purple.300'
                    : canAfford
                    ? 'whiteAlpha.200'
                    : 'transparent'
                }
                borderRadius="xl"
                opacity={canAfford ? 1 : 0.5}
                _hover={{
                  bg: isSelected
                    ? 'purple.500'
                    : canAfford
                    ? 'whiteAlpha.200'
                    : 'whiteAlpha.50',
                }}
              >
                {!canAfford && (
                  <Icon
                    as={FaLock}
                    position="absolute"
                    top={2}
                    right={2}
                    color="whiteAlpha.400"
                    boxSize={3}
                  />
                )}
                <VStack spacing={1}>
                  <Icon
                    as={FaTrophy}
                    color={isSelected ? 'yellow.300' : 'yellow.500'}
                    boxSize={6}
                  />
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={isSelected ? 'white' : 'whiteAlpha.900'}
                  >
                    {amount}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={isSelected ? 'whiteAlpha.900' : 'whiteAlpha.600'}
                  >
                    {t('trophies')}
                  </Text>
                </VStack>
              </MotionButton>
            )
          })}
        </SimpleGrid>

        {/* Action Button */}
        <Button
          w="100%"
          size="lg"
          colorScheme="purple"
          onClick={() => handlePlaceBet(selectedBet)}
          isDisabled={selectedBet === null || isSubmitting}
          isLoading={isSubmitting}
          loadingText={t('Placing Bet...')}
          bgGradient="linear(to-r, purple.500, blue.500)"
          _hover={{
            bgGradient: 'linear(to-r, purple.600, blue.600)',
          }}
        >
          {selectedBet === null
            ? t('Select a Bet')
            : t('Confirm Bet of {{amount}}', { amount: selectedBet })}
        </Button>

        {/* Progress Bar for Timer */}
        <Box w="100%">
          <Progress
            value={(timeLeft / 30) * 100}
            size="xs"
            colorScheme={timeLeft <= 10 ? 'red' : 'blue'}
            borderRadius="full"
            bg="whiteAlpha.100"
          />
        </Box>
      </VStack>
    </Flex>
  )
}

export default BettingScreen
