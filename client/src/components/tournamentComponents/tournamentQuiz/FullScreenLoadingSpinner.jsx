// FullScreenLoadingSpinner.js
import React, { useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  useTheme,
  usePrefersReducedMotion,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { keyframes } from '@emotion/react'
import FixedBackground from '../../miscellaneous/FixedBackground'

const FullScreenLoadingSpinner = React.memo(() => {
  const theme = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()

  // Memoized animations to prevent recalculation on every render
  const spinAnimation = useMemo(() => {
    if (prefersReducedMotion) return undefined
    return `${keyframes`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `} 1s linear infinite`
  }, [prefersReducedMotion])

  const pulseAnimation = useMemo(() => {
    if (prefersReducedMotion) return undefined
    return `${keyframes`
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    `} 1.5s ease-in-out infinite`
  }, [prefersReducedMotion])

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
      <FixedBackground />
      <Box
        as={motion.div}
        width="100px"
        height="100px"
        borderRadius="50%"
        border="4px solid"
        borderColor="transparent"
        borderTopColor={theme.colors.yellow[400]}
        animation={spinAnimation}
        mb="4"
      />
      <Text
        as={motion.p}
        fontSize="2xl"
        fontWeight="bold"
        color="white"
        animation={pulseAnimation}
      >
        Loading ...
      </Text>
    </Flex>
  )
})

export default FullScreenLoadingSpinner
