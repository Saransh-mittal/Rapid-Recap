import React from 'react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { keyframes } from '@emotion/react'

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const ServiceScreen = ({
  title,
  description,
  quote,
  quoteAuthor,
  titleColor = 'pink.400',
  descriptionColor = 'gray.300',
  quoteColor = 'pink.300',
}) => {
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
        bg="rgba(26, 32, 44, 0.8)"
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
              color={titleColor}
              textAlign="center"
              fontWeight="bold"
              letterSpacing="wide"
            >
              {title}
            </Heading>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Text
              fontSize="xl"
              color={descriptionColor}
              textAlign="center"
              lineHeight="tall"
            >
              {description}
            </Text>
          </motion.div>
          {quote && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Text
                fontSize="md"
                color={quoteColor}
                textAlign="center"
                fontStyle="italic"
                mt={4}
              >
                "{quote}"
                <br />
                {quoteAuthor && `- ${quoteAuthor}`}
              </Text>
            </motion.div>
          )}
        </VStack>
      </Box>
    </Box>
  )
}

export default ServiceScreen
