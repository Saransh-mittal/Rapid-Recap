import React from 'react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { keyframes } from '@emotion/react'

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const ServiceScreen = () => {
  return (
    <Box
      height="100vh"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundSize="400% 400%"
      animation={`${gradientAnimation} 15s ease infinite`}
      overflow="hidden"
    >
      <Box
        bg="rgba(26, 32, 44, 0.7)"
        backdropFilter="blur(10px)"
        borderRadius="xl"
        p={12}
        boxShadow="0 8px 32px rgba(31, 38, 135, 0.37)"
        maxWidth="600px"
        width="90%"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <VStack spacing={8} align="center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heading
              as="h1"
              size="2xl"
              color="pink.400"
              textAlign="center"
              fontWeight="bold"
              letterSpacing="wide"
            >
              Tournament Under Maintenance
            </Heading>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Text
              fontSize="xl"
              color="gray.300"
              textAlign="center"
              lineHeight="tall"
            >
              We're enhancing our tournament system to provide you with an even
              more thrilling gaming experience. Please check back soon to join
              the action.
            </Text>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Text
              fontSize="md"
              color="pink.300"
              textAlign="center"
              fontStyle="italic"
              mt={4}
            >
              "The key is not the will to win… everybody has that. It is the
              will to prepare to win that is important."
              <br />- Bobby Knight
            </Text>
          </motion.div>
        </VStack>
      </Box>
    </Box>
  )
}

export default ServiceScreen
