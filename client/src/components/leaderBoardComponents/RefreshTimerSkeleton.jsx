import React from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { keyframes, css } from '@emotion/react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const shimmerAnimation = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

const shimmerStyle = css`
  animation: ${shimmerAnimation} 2s linear infinite;
`

const RefreshTimerSkeleton = () => {
  const timeUnits = ['DAYS', 'HOURS', 'MINS', 'SECS']

  const shimmerGradient =
    'linear-gradient(90deg, rgba(147, 112, 219, 0.05) 0%, rgba(147, 112, 219, 0.2) 50%, rgba(147, 112, 219, 0.05) 100%)'

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        px={4}
        py={3}
        borderRadius="xl"
        bg="rgba(20, 20, 43, 0.6)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        maxW="fit-content"
        mx="auto"
      >
        {/* Title Shimmer */}
        <Flex justify="center" mb={2}>
          <Box
            h="16px"
            w="96px"
            background={shimmerGradient}
            backgroundSize="1000px 100%"
            css={shimmerStyle}
            borderRadius="sm"
          />
        </Flex>

        {/* Timer Units */}
        <Flex justify="center" align="center" gap={3}>
          {timeUnits.map(unit => (
            <Flex key={unit} direction="column" align="center">
              <Box
                w={{ base: '45px', md: '50px' }}
                h={{ base: '45px', md: '50px' }}
                bg="rgba(147, 112, 219, 0.3)"
                borderRadius="lg"
                position="relative"
                overflow="hidden"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  background={shimmerGradient}
                  backgroundSize="1000px 100%"
                  css={shimmerStyle}
                />
              </Box>
              <Text
                fontSize="xs"
                mt={1}
                color="whiteAlpha.700"
                fontWeight="medium"
                letterSpacing="wider"
              >
                {unit}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </MotionBox>
  )
}

export default RefreshTimerSkeleton
