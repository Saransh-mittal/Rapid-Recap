// screens/AppStartScreen.jsx
import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Swords, Home, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

// Motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)

const AppStartScreen = () => {
  const { t } = useTranslation('AppStartScreen')
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  }

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 15,
        delay: 0.2,
      },
    },
  }

  // Option card variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12, delay: 0.5 },
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 25px rgba(124, 58, 237, 0.6)',
      transition: { type: 'spring', stiffness: 300, damping: 10 },
    },
    tap: { scale: 0.98 },
  }

  // Handle navigation choices
  const handleQuickClash = () => {
    navigate('/quickclash')
  }

  const handleContinue = () => {
    navigate('/home')
  }

  return (
    <MotionBox
      minH="100vh"
      w="100%"
      position="relative"
      overflow="hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Container maxW="container.lg" py={8} zIndex={1} position="relative">
        {/* Header section */}
        <VStack spacing={4} mb={12} textAlign="center">
          <MotionHeading
            fontSize={{ base: '3xl', md: '6xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, purple.400, blue.400)"
            bgClip="text"
            variants={headerVariants}
          >
            {t('Rapid Recap AI')}
          </MotionHeading>

          <MotionText
            color="whiteAlpha.800"
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="700px"
            variants={itemVariants}
          >
            {t('Welcome back')}
            {user?.name && `, ${user.name}`}. {t('Choose your journey')}
          </MotionText>

          <MotionBox variants={itemVariants}>
            <Flex justify="center">
              <Icon as={Sparkles} color="yellow.400" boxSize={5} />
            </Flex>
          </MotionBox>
        </VStack>

        {/* Options grid */}
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={{ base: 5, md: 8 }}
          maxW="800px"
          mx="auto"
          px={{ base: 4, md: 0 }}
        >
          {/* Quick Clash option */}
          <MotionBox
            as="button"
            onClick={handleQuickClash}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            height={{ base: '180px', md: '250px' }}
            bg="rgba(88, 65, 151, 0.15)"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            borderWidth="1px"
            borderColor="purple.500"
            boxShadow="0 0 15px rgba(124, 58, 237, 0.3)"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgGradient:
                'linear(to-br, rgba(124, 58, 237, 0.1), rgba(72, 87, 217, 0.1))',
              zIndex: -1,
            }}
          >
            <Box
              position="absolute"
              top="10px"
              right="10px"
              bg="purple.500"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {t('NEW')}
            </Box>

            <Flex
              bg="rgba(124, 58, 237, 0.3)"
              p={4}
              borderRadius="full"
              mb={3}
              boxShadow="0 0 20px rgba(124, 58, 237, 0.5)"
            >
              <Icon
                as={Swords}
                boxSize={{ base: 8, md: 10 }}
                color="purple.300"
              />
            </Flex>

            <Heading
              size={{ base: 'md', md: 'lg' }}
              mb={2}
              textAlign="center"
              color="white"
            >
              {t('Quick Clash')}
            </Heading>

            <Text
              color="whiteAlpha.800"
              fontSize={{ base: 'sm', md: 'md' }}
              textAlign="center"
            >
              {t('Challenge others in knowledge battles')}
            </Text>
          </MotionBox>

          {/* Continue to App option */}
          <MotionBox
            as="button"
            onClick={handleContinue}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            height={{ base: '180px', md: '250px' }}
            bg="rgba(49, 130, 206, 0.15)"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            borderWidth="1px"
            borderColor="blue.500"
            boxShadow="0 0 15px rgba(49, 130, 206, 0.3)"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgGradient:
                'linear(to-br, rgba(49, 130, 206, 0.1), rgba(44, 82, 130, 0.1))',
              zIndex: -1,
            }}
          >
            <Flex
              bg="rgba(49, 130, 206, 0.3)"
              p={4}
              borderRadius="full"
              mb={3}
              boxShadow="0 0 20px rgba(49, 130, 206, 0.5)"
            >
              <Icon as={Home} boxSize={{ base: 8, md: 10 }} color="blue.300" />
            </Flex>

            <Heading
              size={{ base: 'md', md: 'lg' }}
              mb={2}
              textAlign="center"
              color="white"
            >
              {t('Continue to App')}
            </Heading>

            <Text
              color="whiteAlpha.800"
              fontSize={{ base: 'sm', md: 'md' }}
              textAlign="center"
            >
              {t('Explore news, quizzes and more')}
            </Text>
          </MotionBox>
        </SimpleGrid>

        {/* Footer */}
        <MotionBox
          mt={12}
          textAlign="center"
          opacity={0.5}
          variants={itemVariants}
        >
          <Text fontSize="xs" color="whiteAlpha.600">
            © {new Date().getFullYear()} Rapid Recap AI
          </Text>
        </MotionBox>
      </Container>
    </MotionBox>
  )
}

export default AppStartScreen
