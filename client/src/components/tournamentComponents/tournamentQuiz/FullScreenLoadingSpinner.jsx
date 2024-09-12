import React from 'react'
import { Box, Flex, Text, keyframes, useTheme } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const FullScreenLoadingSpinner = () => {
  const theme = useTheme()

  return (
    <Flex
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="gray.900"
      zIndex="9999"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box
        as={motion.div}
        width="100px"
        height="100px"
        borderRadius="50%"
        border="4px solid"
        borderColor="transparent"
        borderTopColor={theme.colors.yellow[400]}
        animation={`${spin} 1s linear infinite`}
        mb="4"
      />
      <Text
        as={motion.p}
        fontSize="2xl"
        fontWeight="bold"
        color="white"
        animation={`${pulse} 1.5s ease-in-out infinite`}
      >
        Loading ...
      </Text>
    </Flex>
  )
}

export default FullScreenLoadingSpinner
