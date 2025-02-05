import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Icon,
  Button,
  Heading,
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'

const PrizeCard = ({ position, amount, isHighlighted }) => {
  return (
    <Box
      p={4}
      bg="gray.800"
      borderRadius="xl"
      border="1px solid"
      borderColor={isHighlighted ? 'yellow.400' : 'whiteAlpha.200'}
      boxShadow={`0 4px 12px ${isHighlighted ? 'yellow.400' : 'blue.400'}10`}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)' }}
      position="relative"
      overflow="hidden"
      width="full"
    >
      <HStack justify="space-between" align="center">
        <HStack spacing={3}>
          <Icon
            as={StarIcon}
            color={isHighlighted ? 'yellow.400' : 'blue.400'}
            boxSize={6}
          />
          <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900">
            {position}
          </Text>
        </HStack>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color={isHighlighted ? 'yellow.400' : 'blue.400'}
        >
          ₹{amount}
        </Text>
      </HStack>
    </Box>
  )
}

const FebruaryRewardsPromo = ({ isOpen, onClose }) => {
  const prizes = [
    { position: '1st', amount: '500', isHighlighted: true },
    { position: '2nd', amount: '300', isHighlighted: false },
    { position: '3rd', amount: '200', isHighlighted: false },
    { position: '4th-10th', amount: '100', isHighlighted: false },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        mx={4}
        bg="gray.900"
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <ModalHeader>
          <VStack spacing={2} align="center">
            <Heading size="lg" color="white">
              RAPID RECAP
            </Heading>
            <VStack spacing={1}>
              <Heading
                size="xl"
                bgGradient="linear(to-r, yellow.400, yellow.300)"
                bgClip="text"
              >
                February Special
              </Heading>
              <HStack spacing={2}>
                <Icon as={StarIcon} color="yellow.400" />
                <Text color="whiteAlpha.900">Compete & Win Cash Rewards</Text>
                <Icon as={StarIcon} color="yellow.400" />
              </HStack>
            </VStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton color="whiteAlpha.800" />

        <ModalBody pb={6}>
          <VStack spacing={4}>
            {prizes.map(prize => (
              <PrizeCard
                key={prize.position}
                position={prize.position}
                amount={prize.amount}
                isHighlighted={prize.isHighlighted}
              />
            ))}

            <Text
              fontSize="sm"
              color="whiteAlpha.700"
              textAlign="center"
              mt={2}
            >
              Top 10 players on the leaderboard win cash prizes!
            </Text>

            <Button
              colorScheme="yellow"
              size="lg"
              width="full"
              mt={4}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              onClick={onClose}
            >
              Start Playing Now
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default FebruaryRewardsPromo
