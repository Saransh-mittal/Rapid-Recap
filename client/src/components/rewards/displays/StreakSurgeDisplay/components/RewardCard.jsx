import React from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const RewardCard = ({ reward, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      style={{ width: '100%' }}
    >
      <HStack
        bg="linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))"
        p={4}
        borderRadius="xl"
        spacing={4}
        border="1px solid"
        borderColor="whiteAlpha.100"
        boxShadow="lg"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'xl',
        }}
        transition="all 0.2s"
      >
        <Box
          bg={reward.gradient}
          p={3}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow={`0 0 20px ${reward.color}20`}
        >
          {reward.icon}
        </Box>

        <Box>
          <Text color="whiteAlpha.900" fontSize="md" mb={0.5}>
            {reward.title}
          </Text>
          <Text color={reward.color} fontWeight="bold" fontSize="lg">
            {reward.amount}
          </Text>
        </Box>
      </HStack>
    </motion.div>
  )
}

export default RewardCard
