import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Image,
  Container,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const Welcome = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.500, indigo.600)',
    'linear(to-br, purple.700, indigo.800)',
  )
  const textColor = useColorModeValue('white', 'gray.100')
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.200')

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="container.xl" h="100vh">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="full"
        >
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            p={10}
            bg="whiteAlpha.100"
            backdropFilter="blur(10px)"
            borderRadius="3xl"
            boxShadow="2xl"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={8} align="center">
              <Image
                src="/images/rrlogo_512.png"
                boxSize={{ base: '150px', md: '200px' }}
                mb={8}
                filter="drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.3))"
              />
              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="extrabold"
                color={textColor}
                textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                textAlign="center"
              >
                Welcome to Rapid Recap!
              </Heading>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                color={textColor}
                textAlign="center"
                maxW="800px"
                lineHeight="1.6"
                opacity={0.8}
              >
                Embark on a journey of knowledge and discovery. Stay informed,
                challenge yourself, and grow with every recap!
              </Text>
            </VStack>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  )
}

export default Welcome
