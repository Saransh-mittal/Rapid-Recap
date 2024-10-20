import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
  Container,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const LanguageSelection = ({ onLanguageSelect }) => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.500, indigo.600)',
    'linear(to-br, purple.700, indigo.800)',
  )
  const textColor = useColorModeValue('white', 'gray.100')
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.200')

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="container.xl" h="100vh">
        <Flex direction="column" align="center" justify="center" h="full">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="extrabold"
                color={textColor}
                textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                letterSpacing="wider"
              >
                Select Your Language
              </Heading>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color={textColor}
                textAlign="center"
                maxW="600px"
                opacity={0.8}
              >
                Choose your preferred language to embark on an enchanting
                journey through Rapid Recap.
              </Text>
              <Flex mt={8} justifyContent="center" flexWrap="wrap">
                <LanguageButton
                  language="English"
                  onClick={() => onLanguageSelect('en')}
                  mr={{ base: 0, md: 4 }}
                  mb={{ base: 4, md: 0 }}
                />
                <LanguageButton
                  language="हिंदी"
                  onClick={() => onLanguageSelect('hi')}
                />
              </Flex>
            </VStack>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  )
}

const LanguageButton = ({ language, onClick, ...rest }) => (
  <Button
    onClick={onClick}
    size="lg"
    fontSize="xl"
    fontWeight="semibold"
    color="white"
    bg="whiteAlpha.200"
    _hover={{
      bg: 'whiteAlpha.300',
      transform: 'translateY(-2px)',
      boxShadow: 'lg',
    }}
    _active={{
      bg: 'whiteAlpha.400',
      transform: 'translateY(0)',
    }}
    transition="all 0.2s"
    borderRadius="full"
    px={8}
    py={6}
    {...rest}
  >
    {language}
  </Button>
)

export default LanguageSelection
