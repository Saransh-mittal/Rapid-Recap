import React, { Suspense, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Button as ChakraButton,
  VStack,
  HStack,
  Box,
  Flex,
  Badge,
  useColorModeValue,
  useToast,
  Heading,
  Grid,
  Icon,
  ModalCloseButton,
  InputGroup,
  InputRightElement,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { CopyIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import MessageCircleSVG from '../../assets/svg/MessageCircleSVG'
import UserFriendsSVG from '../../assets/svg/UserFriendsSVG'
import BrainSVG from '../../assets/svg/BrainSVG'
import CalendarSVG from '../../assets/svg/CalenderSVG'
import ArrowRightSVG from '../../assets/svg/ArrowRightSVG'
import CheckCircle from '../../assets/svg/CheckCircle'
import UserSVG from '../../assets/svg/UserSVG'
import Button from '../miscellaneous/ButtonComponent'
import { useNavigate } from 'react-router-dom'

const Register = React.lazy(() => import('../../screens/Register'))

const MotionBox = motion(Box)

const GradientText = ({ children, gradient }) => (
  <Text as="span" bgGradient={gradient} bgClip="text" fontWeight="extrabold">
    {children}
  </Text>
)

const GuestLoginModal = ({
  isOpen,
  onClose,
  guestName = 'GuestUser1',
  guestPassword = null,
  guestId,
  onOpen,
}) => {
  const [copied, setCopied] = useState({ username: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const toast = useToast()
  const {
    onOpen: onOpenRegister,
    onClose: onCloseRegister,
    isOpen: isOpenRegister,
  } = useDisclosure()
  const navigate = useNavigate()

  const bgGradient = useColorModeValue(
    'linear(to-br, gray.900, gray.800)',
    'linear(to-br, gray.900, gray.800)',
  )
  const borderColor = useColorModeValue('gray.700', 'gray.700')

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [type]: true })
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000)
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const limitations = [
    {
      text: 'No access to WiseWeb feature (making friends and chatting)',
      icon: MessageCircleSVG,
    },
    { text: 'IQ score will not be generated', icon: BrainSVG },
    { text: 'No circle or society assignment', icon: UserFriendsSVG },
    { text: 'No enrollment in seasons', icon: CalendarSVG },
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={{ base: 'full', md: '2xl' }}
            isCentered
            scrollBehavior="inside"
          >
            <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.300" />
            <ModalContent
              as={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              bgGradient={bgGradient}
              color="white"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="2xl"
            >
              <ModalCloseButton color="white" />
              <ModalHeader fontSize="3xl" fontWeight="bold" pb={2}>
                <Flex align="center" gap={3}>
                  <Box bg="blue.500" p={2} borderRadius="full">
                    <UserSVG height="25px" width="25px" fill={'white'} />
                  </Box>
                  <Heading size="lg">
                    Welcome to{' '}
                    <GradientText gradient="linear(to-r, blue.400, teal.300)">
                      Rapid Recap!
                    </GradientText>
                  </Heading>
                </Flex>
              </ModalHeader>

              <ModalBody>
                <VStack spacing={6} align="stretch">
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    bg="gray.800"
                    p={6}
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                    boxShadow="lg"
                  >
                    <Text fontSize="xl" fontWeight="medium" mb={4}>
                      Your{' '}
                      <GradientText gradient="linear(to-r, purple.400, pink.300)">
                        guest profile
                      </GradientText>{' '}
                      has been generated successfully. Here are your login
                      details:
                    </Text>
                    <Flex gap={4} flexDirection={{ base: 'column', md: 'row' }}>
                      {[
                        { label: 'Username', value: guestName },
                        { label: 'Password', value: guestPassword },
                      ].map(({ label, value }) => (
                        <Box
                          key={label}
                          bg="gray.700"
                          p={4}
                          borderRadius="lg"
                          flex={1}
                          position="relative"
                          overflow="hidden"
                        >
                          <Box
                            position="absolute"
                            top="-20px"
                            right="-20px"
                            width="80px"
                            height="80px"
                            borderRadius="full"
                            bg="whiteAlpha.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          />
                          <Text color="gray.400" mb={1} fontWeight="bold">
                            {label}
                          </Text>
                          <Flex justify="space-between" align="center">
                            {label === 'Password' ? (
                              value === null ? (
                                <Text
                                  fontWeight="extrabold"
                                  fontSize="lg"
                                  color="yellow.300"
                                >
                                  Password has been changed
                                </Text>
                              ) : (
                                <InputGroup size="md">
                                  <Text
                                    fontWeight="extrabold"
                                    fontSize="md"
                                    color="blue.300"
                                  >
                                    {showPassword ? value : '************'}
                                  </Text>
                                  <InputRightElement width="4.5rem">
                                    <ChakraButton
                                      h="1.75rem"
                                      size="sm"
                                      onClick={togglePasswordVisibility}
                                      variant="ghost"
                                      position={'absolute'}
                                      right={0}
                                      bottom={'30%'}
                                      _hover={{ bg: 'whiteAlpha.200' }}
                                    >
                                      {showPassword ? (
                                        <ViewOffIcon />
                                      ) : (
                                        <ViewIcon />
                                      )}
                                    </ChakraButton>
                                  </InputRightElement>
                                </InputGroup>
                              )
                            ) : (
                              <Text
                                fontWeight="extrabold"
                                fontSize="lg"
                                color="blue.300"
                              >
                                {value}
                              </Text>
                            )}
                            <ChakraButton
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                copyToClipboard(value, label.toLowerCase())
                              }
                              leftIcon={
                                copied[label.toLowerCase()] ? (
                                  <CheckCircle
                                    height={'20px'}
                                    width={'20px'}
                                    fill="white"
                                  />
                                ) : (
                                  <CopyIcon size={16} />
                                )
                              }
                              _hover={{ bg: 'whiteAlpha.200' }}
                              isDisabled={
                                label === 'Password' && value === null
                              }
                            >
                              {copied[label.toLowerCase()] ? 'Copied' : 'Copy'}
                            </ChakraButton>
                          </Flex>
                        </Box>
                      ))}
                    </Flex>
                  </MotionBox>
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    bg="green.900"
                    p={4}
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor="green.700"
                    boxShadow="md"
                  >
                    <Flex align="center" gap={3}>
                      <Text fontSize="sm" fontStyle="italic">
                        Your guest access is valid for{' '}
                        <Badge
                          colorScheme="green"
                          fontSize="0.9em"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          fontWeight="extrabold"
                        >
                          7 days
                        </Badge>
                        . During this period, you can transfer or export your
                        data and progress to a new, unregistered email address.{' '}
                        <Text as="span" fontWeight="bold">
                          Please note
                        </Text>{' '}
                        that after the 7-day window, your guest ID will expire,
                        and any unsaved progress will be lost.
                      </Text>
                    </Flex>
                  </MotionBox>
                  <Box>
                    <Heading size="md" mb={4}>
                      <GradientText gradient="linear(to-r, red.400, orange.300)">
                        Guest Account Limitations
                      </GradientText>
                    </Heading>
                    <Grid
                      templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                      }}
                      gap={4}
                    >
                      {limitations.map((limitation, index) => (
                        <MotionBox
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          bg="gray.800"
                          p={4}
                          borderRadius="lg"
                          borderWidth={1}
                          borderColor="gray.700"
                          boxShadow="md"
                        >
                          <Flex align="center" gap={3}>
                            <Box
                              bg="red.500"
                              p={2}
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Icon
                                as={limitation.icon}
                                boxSize={5}
                                // bg={'white'}
                                color="white"
                              />
                            </Box>
                            <Text fontWeight="medium" fontSize="sm">
                              {limitation.text}
                            </Text>
                          </Flex>
                        </MotionBox>
                      ))}
                    </Grid>
                  </Box>
                </VStack>
              </ModalBody>

              <ModalFooter bg="gray.800" justifyContent={'center'}>
                <HStack spacing={4} w={'100%'} justifyContent={'center'}>
                  <Button
                    colorScheme="blue"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                    transition="all 0.2s"
                    buttonW={'175px'}
                    onClick={() => {
                      onOpenRegister()
                      onClose()
                    }}
                  >
                    Secure Your Progress
                    <Flex right={0} top={'21%'} position={'absolute'}>
                      <ArrowRightSVG
                        height={'20px'}
                        width={'20px'}
                        fill={'white'}
                      />
                    </Flex>
                  </Button>
                  <Button
                    colorScheme="green"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/profile/${guestName}`)}
                  >
                    View Profile
                  </Button>
                  <Button onClick={onClose}>Close</Button>
                </HStack>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
      <Suspense fallback={<Spinner />}>
        <Register
          isOpen={isOpenRegister}
          onClose={onCloseRegister}
          exportData={true}
          guestId={guestId}
          onOpenGuest={onOpen}
        />
      </Suspense>
    </>
  )
}

export default GuestLoginModal
