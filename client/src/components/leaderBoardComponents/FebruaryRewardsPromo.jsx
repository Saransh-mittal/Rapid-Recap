import React, { useState } from 'react'
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
  Icon,
  Button,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import {
  FaTrophy,
  FaClock,
  FaInstagram,
  FaShieldAlt,
  FaGift,
  FaCheckCircle,
  FaCopy,
  FaArrowRight,
  FaExclamationCircle,
} from 'react-icons/fa'

// Prize Card Component for Quick View
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

// Detailed Process Component
const DetailedProcess = () => {
  const cardBg = useColorModeValue('whiteAlpha.200', 'whiteAlpha.100')

  return (
    <VStack spacing={6} width="full">
      {/* Winner Selection */}
      <Box w="full" bg={cardBg} borderRadius="xl" p={4}>
        <HStack mb={3}>
          <Icon as={FaTrophy} color="blue.300" boxSize={5} />
          <Heading size="sm" color="blue.200">
            Winner Selection
          </Heading>
        </HStack>
        <Text color="gray.300" fontSize="sm">
          Top 10 players will be finalized on March 1st, 2025. Each winner
          receives a unique claiming code.
        </Text>
      </Box>

      {/* How to Claim */}
      <Box w="full" bg={cardBg} borderRadius="xl" p={4}>
        <HStack mb={3}>
          <Icon as={FaGift} color="blue.300" boxSize={5} />
          <Heading size="sm" color="blue.200">
            How to Claim
          </Heading>
        </HStack>

        <VStack align="stretch" spacing={4}>
          {/* Initial Steps */}
          <Box>
            <HStack mb={2}>
              <Icon as={FaGift} color="blue.400" boxSize={4} />
              <Text color="gray.200" fontSize="sm" fontWeight="medium">
                Initial Steps
              </Text>
            </HStack>
            <VStack align="start" spacing={2} pl={6}>
              {[
                'Follow @rrapidrecap on Instagram',
                'DM your unique code to us',
                'Wait for verification response',
              ].map((step, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FaArrowRight} color="blue.400" boxSize={3} />
                  <Text color="gray.300" fontSize="sm">
                    {step}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Verification Process */}
          <Box>
            <HStack mb={2}>
              <Icon as={FaShieldAlt} color="green.400" boxSize={4} />
              <Text color="gray.200" fontSize="sm" fontWeight="medium">
                Verification Process
              </Text>
            </HStack>
            <VStack align="start" spacing={2} pl={6}>
              {[
                'Our team will verify your unique code',
                "Upon successful verification, we'll request your UPI ID",
                'Payment will be processed after UPI verification',
              ].map((step, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FaArrowRight} color="blue.400" boxSize={3} />
                  <Text color="gray.300" fontSize="sm">
                    {step}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Deadline */}
      <Box w="full" bg={cardBg} borderRadius="xl" p={4}>
        <HStack mb={3}>
          <Icon as={FaClock} color="blue.300" boxSize={5} />
          <Heading size="sm" color="blue.200">
            Important Deadline
          </Heading>
        </HStack>
        <Text color="gray.300" fontSize="sm">
          Claim your prize before March 7th, 2025 (11:59 PM)
          <br />
          Unclaimed prizes will expire automatically
        </Text>
      </Box>
    </VStack>
  )
}

// Main Component
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
          <Tabs variant="soft-rounded" colorScheme="yellow" mb={4}>
            <TabList justifyContent="center" mb={4}>
              <Tab
                _selected={{
                  color: 'black',
                  bg: 'yellow.400',
                }}
                color="yellow.400"
              >
                Quick View
              </Tab>
              <Tab
                _selected={{
                  color: 'black',
                  bg: 'yellow.400',
                }}
                color="yellow.400"
              >
                How to Claim
              </Tab>
            </TabList>

            <TabPanels>
              {/* Quick View Panel */}
              <TabPanel p={0}>
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
                </VStack>
              </TabPanel>

              {/* Detailed Process Panel */}
              <TabPanel p={0}>
                <DetailedProcess />
              </TabPanel>
            </TabPanels>
          </Tabs>

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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default FebruaryRewardsPromo
