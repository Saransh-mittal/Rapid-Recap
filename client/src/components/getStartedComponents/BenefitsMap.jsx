import React from 'react'
import {
  Box,
  Heading,
  Text,
  Flex,
  Circle,
  Icon,
  useColorModeValue,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowForwardIcon, ArrowDownIcon } from '@chakra-ui/icons'
import { Parallax, ParallaxProvider } from 'react-scroll-parallax'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const BenefitItem = ({ icon, title, description, index, speed }) => (
  <Parallax speed={speed}>
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      mb={8}
      textAlign="center"
      width="100%"
    >
      <Circle
        size={{ base: '60px', md: '80px' }}
        bg="rgba(78, 205, 196, 0.1)"
        color="brand.500"
        mb={4}
        mx="auto"
        borderWidth="2px"
        borderColor="brand.500"
      >
        <Icon as={icon} boxSize={{ base: 8, md: 10 }} />
      </Circle>
      <Heading size="md" mb={2} color="brand.500">
        {title}
      </Heading>
      <Text fontSize="sm" maxWidth="250px" mx="auto">
        {description}
      </Text>
    </MotionBox>
  </Parallax>
)

const Arrow = ({ direction = 'right' }) => {
  const ArrowIcon = direction === 'down' ? ArrowDownIcon : ArrowForwardIcon
  return (
    <MotionFlex
      justify="center"
      align="center"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      my={2}
    >
      <ArrowIcon
        boxSize={6}
        color="brand.500"
        transform={direction === 'left' ? 'rotate(180deg)' : undefined}
      />
    </MotionFlex>
  )
}

const BenefitsMap = () => {
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(0, 0, 0, 0.8)',
  )
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <ParallaxProvider>
      <Box py={20} position="relative" overflow="hidden">
        <Parallax speed={-5}>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg={bgColor}
            backdropFilter="blur(5px)"
          />
        </Parallax>
        <Box
          maxWidth="1200px"
          margin="0 auto"
          position="relative"
          zIndex={1}
          px={4}
        >
          <Parallax speed={-2}>
            <Heading
              as="h2"
              size={{ base: 'xl', md: '2xl' }}
              textAlign="center"
              mb={16}
              color="brand.500"
              fontWeight="bold"
              letterSpacing="wide"
            >
              Empowering Your Knowledge Journey
            </Heading>
          </Parallax>

          <VStack spacing={8} align="stretch">
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
            >
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>📰</Text>
                )}
                title="Curated News"
                description="Access high-quality, tailored news content"
                index={0}
                speed={2}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🧠</Text>
                )}
                title="Active Learning"
                description="Engage with interactive quizzes"
                index={1}
                speed={3}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>📊</Text>
                )}
                title="Track Progress"
                description="Monitor your growing Information Quotient (IQ)"
                index={2}
                speed={2}
              />
            </Flex>

            <Arrow direction="down" />

            <Parallax speed={5}>
              <Flex justify="center" align="center">
                <MotionBox
                  bg="brand.500"
                  p={8}
                  borderRadius="lg"
                  width={{ base: '100%', md: '80%' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Heading
                    size={{ base: 'md', md: 'lg' }}
                    mb={4}
                    textAlign="center"
                    color="white"
                  >
                    Why Information Retention Matters
                  </Heading>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    textAlign="center"
                    color="white"
                    lineHeight="tall"
                  >
                    Retaining information enhances your critical thinking,
                    decision-making, and problem-solving skills. It allows you
                    to form connections between different topics, fostering
                    creativity and innovation, ultimately leading to personal
                    and professional growth.
                  </Text>
                </MotionBox>
              </Flex>
            </Parallax>

            <Arrow direction="down" />

            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
            >
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🏆</Text>
                )}
                title="Competitive Edge"
                description="Excel in your professional and academic pursuits"
                index={3}
                speed={2}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🌐</Text>
                )}
                title="Informed Citizen"
                description="Contribute meaningfully to societal discussions"
                index={4}
                speed={3}
              />
              {isMobile ? (
                <Arrow direction="down" />
              ) : (
                <Box width="5%" display="flex" justifyContent="center">
                  <Arrow direction="right" />
                </Box>
              )}
              <BenefitItem
                icon={() => (
                  <Text fontSize={{ base: '3xl', md: '4xl' }}>🚀</Text>
                )}
                title="Personal Growth"
                description="Continuously expand your knowledge and capabilities"
                index={5}
                speed={2}
              />
            </Flex>
          </VStack>
        </Box>
      </Box>
    </ParallaxProvider>
  )
}

export default BenefitsMap
