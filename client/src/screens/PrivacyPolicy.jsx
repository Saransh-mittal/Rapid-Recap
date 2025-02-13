import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Shield,
  Lock,
  User,
  Bell,
  Database,
  Globe,
  Mail,
  Trash,
} from 'lucide-react'

// Create motion components from Chakra components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const PrivacyPolicy = () => {
  const cardBg = '#241f35'
  const iconBg = '#2d2642'

  const floatingAnimation = {
    y: ['-10px', '10px'],
    transition: {
      duration: 5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  }

  const sections = [
    {
      icon: User,
      title: 'Information We Collect',
      content:
        'We collect basic account information (email, username), and if you register without Google Sign-In, your password (which we encrypt using bcryptjs). We also collect quiz performance data and app usage statistics to improve your learning experience.',
    },
    {
      icon: Lock,
      title: 'Data Security',
      content:
        'Your password is encrypted using industry-standard bcryptjs hashing. We use secure measures to protect all your information and never share your personal data with third parties.',
    },
    {
      icon: Database,
      title: 'How We Use Your Data',
      content:
        'Your data helps us personalize your learning experience, track your progress, and maintain your rankings in tournaments and societies.',
    },
    {
      icon: Mail,
      title: 'Communications',
      content:
        'We may send you: 1) Important updates about your account and achievements, 2) Tournament notifications, and 3) Feedback surveys to improve the app experience and usability. You can manage these preferences in settings.',
    },
    {
      icon: Globe,
      title: 'Your Rights',
      content:
        'You can access and update your account information at any time through the app settings.',
    },
    {
      icon: Trash,
      title: 'Account Deletion',
      content:
        'You can permanently delete your account and associated data by visiting the Delete Account page (/delete-account) in your app settings.',
    },
  ]

  return (
    <Box minH="100vh" py={8} px={4} position="relative" overflow="hidden">
      {/* Animated background elements */}
      <MotionBox
        position="absolute"
        top="5%"
        left="5%"
        w="4px"
        h="4px"
        borderRadius="full"
        bg="pink.500"
        opacity={0.2}
        animate={floatingAnimation}
      />
      {/* Add more floating elements with different positions and delays */}

      <Container maxW="4xl" position="relative">
        <VStack spacing={12}>
          <MotionBox
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            textAlign="center"
            mt={12}
          >
            <MotionFlex
              justify="center"
              mb={6}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                duration: 1.5,
              }}
            >
              <Box
                position="relative"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  right: '-10px',
                  bottom: '-10px',
                  bg: 'rgba(236, 72, 153, 0.1)',
                  borderRadius: 'full',
                  filter: 'blur(15px)',
                  animation: 'pulse 2s infinite',
                }}
              >
                <Icon
                  as={Shield}
                  w={20}
                  h={20}
                  color="pink.500"
                  filter="drop-shadow(0 0 10px #EC4899)"
                />
              </Box>
            </MotionFlex>

            <Heading
              fontSize={{ base: '4xl', md: '6xl' }}
              bgGradient="linear(to-r, pink.400, purple.400)"
              bgClip="text"
              mb={4}
              letterSpacing="tight"
              fontWeight="bold"
              filter="drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))"
            >
              Privacy Policy
            </Heading>
            <Text
              color="gray.300"
              fontSize="lg"
              textShadow="0 0 10px rgba(255,255,255,0.1)"
            >
              Last updated: January 31, 2025
            </Text>
          </MotionBox>

          <VStack spacing={8} width="100%">
            {sections.map((section, index) => (
              <MotionBox
                key={section.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.2,
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                width="100%"
              >
                <Box
                  bg={cardBg}
                  rounded="2xl"
                  p={8}
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.1)"
                  boxShadow="0 8px 32px rgba(0,0,0,0.2)"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(236, 72, 153, 0.1)',
                  }}
                  transition="all 0.3s ease"
                >
                  <HStack
                    align="flex-start"
                    spacing={6}
                    display={{ base: 'none', md: 'flex' }}
                  >
                    <Box
                      bg={iconBg}
                      p={4}
                      rounded="xl"
                      boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                    >
                      <Icon
                        as={section.icon}
                        boxSize={6}
                        color="pink.400"
                        filter="drop-shadow(0 0 4px rgba(236, 72, 153, 0.4))"
                      />
                    </Box>
                    <Box>
                      <Heading
                        as="h2"
                        size="lg"
                        color="pink.400"
                        mb={3}
                        letterSpacing="tight"
                        fontWeight="bold"
                      >
                        {section.title}
                      </Heading>
                      <Text
                        color="gray.300"
                        lineHeight="tall"
                        fontSize="md"
                        letterSpacing="wide"
                      >
                        {section.content}
                      </Text>
                    </Box>
                  </HStack>
                  <VStack
                    align="center"
                    spacing={6}
                    display={{ base: 'flex', md: 'none' }}
                  >
                    <Box
                      bg={iconBg}
                      p={4}
                      rounded="xl"
                      boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                    >
                      <Icon
                        as={section.icon}
                        boxSize={6}
                        color="pink.400"
                        filter="drop-shadow(0 0 4px rgba(236, 72, 153, 0.4))"
                      />
                    </Box>
                    <Box>
                      <Heading
                        as="h2"
                        size="lg"
                        color="pink.400"
                        mb={3}
                        letterSpacing="tight"
                        fontWeight="bold"
                        textAlign={'center'}
                      >
                        {section.title}
                      </Heading>
                      <Text
                        color="gray.300"
                        lineHeight="tall"
                        fontSize="md"
                        letterSpacing="wide"
                        textAlign={'center'}
                      >
                        {section.content}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </VStack>

          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            textAlign="center"
            color="gray.400"
            pb={8}
          >
            <Text fontSize="lg">Contact us at: team@rapidrecap.ai</Text>
            <Text mt={2} fontSize="lg">
              Rapid Recap Inc, Jaipur, India
            </Text>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  )
}

export default PrivacyPolicy
