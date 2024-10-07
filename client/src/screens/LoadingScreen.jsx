import React from 'react'
import { Box, Text, Flex, Progress, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import rrlogo from '/images/rrlogo.webp'

const LoadingScreen = ({ progress }) => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="black"
      zIndex="9999"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Flex gap={2}>
          <Image src={rrlogo} width={'40px'} height={'50px'} />
          <Text fontSize="4xl" fontWeight="bold" color="white" mb={8}>
            Rapid Recap
          </Text>
        </Flex>
      </motion.div>

      <Flex direction="column" align="center" width="80%" maxWidth="400px">
        <Progress
          value={progress}
          width="100%"
          colorScheme="purple"
          height="4px"
          mb={4}
        />
        <Text color="white" fontSize="sm">
          {progress}% Loaded
        </Text>
      </Flex>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Text color="gray.500" fontSize="md" mt={8} textAlign="center">
          Prepare for an enlightening journey...
        </Text>
      </motion.div>
    </Box>
  )
}

export default LoadingScreen
