import React from 'react'
import { VStack, Text, Box, Flex, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Star, Zap, Crown } from 'lucide-react'
import PowerBoostDisplay from '../../articleComponents/articleHeaderComponents/PowerBoostDisplay'
import { useSelector } from 'react-redux'

const BoostIcon = ({ icon: Icon, isActive }) => {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      position="relative"
      w="40px"
      h="40px"
      borderRadius="xl"
      overflow="hidden"
      bg={
        isActive
          ? 'linear-gradient(135deg, #6366F1 0%, #9333EA 50%, #7C3AED 100%)'
          : 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)'
      }
      transition="all 0.3s ease"
    >
      {isActive && (
        <Box
          as={motion.div}
          position="absolute"
          inset="0.1px"
          borderRadius="xl"
          border="2px solid"
          borderColor="rgba(255, 215, 0, 0.6)"
          zIndex={2}
          animate={{
            borderColor: [
              'rgba(255, 215, 0, 0.6)',
              'rgba(255, 215, 0, 0.9)',
              'rgba(255, 215, 0, 0.6)',
            ],
            boxShadow: [
              'inset 0 0 10px rgba(255, 215, 0, 0.3)',
              'inset 0 0 20px rgba(255, 215, 0, 0.5)',
              'inset 0 0 10px rgba(255, 215, 0, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        p={2}
        position="relative"
      >
        <Box
          as={motion.div}
          color="white"
          animate={
            isActive
              ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={20} strokeWidth={2} />
        </Box>
      </Flex>
    </Box>
  )
}

const InstructionModalBody = ({
  isQuinBoostAvailable,
  isBoosted,
  categoryBoost,
}) => {
  const { articleData } = useSelector(state => state.articles)
  const instructions = [
    'Quiz will contain utmost five questions.',
    'All questions will be from the given article only.',
    'All questions are compulsory to attempt.',
    'At last, you will get your score and your percentile.',
    "You can't leave the quiz in between.",
    'Attempting the quiz will affect your IQ score.',
  ]

  return (
    <Box
      color="white"
      p={4}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color="purple.200"
        textAlign="center"
        mb={6}
      >
        Quiz Instructions
      </Text>

      <Text fontStyle="italic" fontWeight="bold" mb={4}>
        Please read all instructions carefully before starting the quiz:
      </Text>

      <VStack spacing={4} align="stretch" mb={6}>
        {instructions.map((instruction, index) => (
          <Box
            key={index}
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Flex align="center">
              <Box
                as="span"
                fontWeight="bold"
                fontSize="lg"
                color="purple.200"
                mr={3}
              >
                {index + 1}.
              </Box>
              <Text fontSize="lg" fontWeight="semibold" mb={0} color="white">
                {instruction}
              </Text>
            </Flex>
          </Box>
        ))}
      </VStack>

      {/* <Box
        mt={4}
        p={4}
        borderRadius="xl"
        bg="rgba(30, 30, 40, 0.6)"
        backdropFilter="blur(10px)"
        width="fit-content"
      >
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="whiteAlpha.900"
          textAlign="center"
          mb={3}
        >
          Active Boosts
        </Text>
        <HStack spacing={4} justify="center">
          <BoostIcon icon={Star} isActive={isBoosted} />
          <BoostIcon icon={Zap} isActive={isQuinBoostAvailable} />
          <BoostIcon icon={Crown} isActive={categoryBoost} />
        </HStack>
      </Box> */}
      <PowerBoostDisplay
        categoryBoost={articleData?.isArticleCategoryBoosted}
      />
    </Box>
  )
}

export default InstructionModalBody
