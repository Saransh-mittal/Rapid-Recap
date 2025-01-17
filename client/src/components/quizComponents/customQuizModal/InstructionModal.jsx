import React from 'react'
import { VStack, Text, Box, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import PowerBoostDisplay from '../../articleComponents/articleHeaderComponents/PowerBoostDisplay'
import { useSelector } from 'react-redux'

const InstructionModalBody = () => {
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
      <PowerBoostDisplay
        categoryBoost={articleData?.isArticleCategoryBoosted}
      />
    </Box>
  )
}

export default InstructionModalBody
