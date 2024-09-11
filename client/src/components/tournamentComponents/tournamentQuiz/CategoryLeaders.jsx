import React from 'react'
import { Box, Flex, Text, VStack, HStack, keyframes } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaCrown, FaMedal } from 'react-icons/fa'

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
`

const LeaderCard = ({ rank, inGameName, score }) => {
  const bgGradient =
    rank === 1
      ? 'linear(to-b, rgba(255,215,0,0.3), rgba(255,215,0,0.1))'
      : rank === 2
      ? 'linear(to-b, rgba(255,165,0,0.3), rgba(255,165,0,0.1))'
      : 'linear(to-b, rgba(218,165,32,0.3), rgba(218,165,32,0.1))'

  const icon =
    rank === 1 ? (
      <FaCrown size="24px" color="#FFD700" />
    ) : (
      <FaMedal size="24px" color={rank === 2 ? '#FFA500' : '#DAA520'} />
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.2 }}
    >
      <Flex
        bg={bgGradient}
        borderRadius="lg"
        p={4}
        alignItems="center"
        justifyContent="space-between"
        boxShadow="xl"
        w="100%"
        backdropFilter="blur(5px)"
        border="1px solid rgba(255,215,0,0.2)"
        animation={rank === 1 ? `${glowAnimation} 2s infinite` : 'none'}
      >
        <HStack spacing={4}>
          <Box>{icon}</Box>
          <VStack alignItems="flex-start" spacing={0}>
            <Text fontWeight="bold" fontSize="xl" color="white">
              {inGameName}
            </Text>
            <Text fontSize="sm" color="rgba(255,255,255,0.8)">
              Rank: {rank}
            </Text>
          </VStack>
        </HStack>
        <Text fontWeight="bold" fontSize="2xl" color="white">
          {score}
        </Text>
      </Flex>
    </motion.div>
  )
}

const CategoryLeaders = ({ leaders }) => {
  return (
    <Box
      borderRadius="xl"
      p={6}
      mt={8}
      bg="rgba(0,0,0,0.6)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255,215,0,0.3)"
      boxShadow="0 0 20px rgba(255,215,0,0.2)"
    >
      <Text
        fontSize="2xl"
        fontWeight="bold"
        mb={6}
        color="rgba(255,223,0,0.9)"
        textAlign="center"
        textTransform="uppercase"
        letterSpacing="wide"
        textShadow="0 0 10px rgba(255,215,0,0.5)"
      >
        Category Leaders
      </Text>
      <VStack spacing={4} align="stretch">
        {leaders.map((leader, index) => (
          <LeaderCard
            key={leader.inGameName}
            rank={index + 1}
            inGameName={leader.inGameName}
            score={leader.score}
          />
        ))}
      </VStack>
    </Box>
  )
}

export default CategoryLeaders
