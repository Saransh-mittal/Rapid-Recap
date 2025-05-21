// components/quickClashComponents/team/JoinTeamModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  VStack,
  Text,
  Icon,
  HStack,
  Divider,
  PinInput,
  PinInputField,
  Flex,
  Box,
  Heading,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { UserPlus, Users, Key, Zap, Crown, Star } from 'lucide-react'

const MotionModalContent = motion(ModalContent)
const MotionBox = motion(Box)
const MotionFlex = motion(Flex) // Kept for consistency, though not heavily used for new animations
const MotionDivider = motion(Divider) // Kept for consistency

/**
 * Ultra-premium Modal for joining an existing team with sleek, engaging design
 */
const JoinTeamModal = ({ isOpen, onClose, onJoin }) => {
  const { t } = useTranslation('QuickClash')
  const [teamCode, setTeamCode] = useState('')
  const [loading, setLoading] = useState(false)

  // Responsive adjustments
  const modalSize = useBreakpointValue({ base: 'xs', sm: 'sm', md: 'md' })
  const pinSize = useBreakpointValue({ base: 'sm', md: 'md' }) // PinInput overall size
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const iconSize = useBreakpointValue({ base: 4, md: 5 })
  const pinWidth = useBreakpointValue({ base: '40px', sm: '46px', md: '52px' })
  const pinHeight = useBreakpointValue({ base: '40px', sm: '46px', md: '52px' })
  const pinFontSize = useBreakpointValue({ base: 'lg', sm: 'xl', md: '2xl' }) // Font size inside PinInputField
  const pinSpacing = useBreakpointValue({ base: 1.5, sm: 2, md: 2.5 })

  useEffect(() => {
    if (!isOpen) {
      setTeamCode('')
      // setLoading(false); // Optionally reset loading state if modal can be closed while loading
    }
  }, [isOpen])

  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 280, damping: 24, mass: 0.9 },
    },
    exit: {
      opacity: 0,
      y: 30,
      scale: 0.92,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
  }

  const starVariants = {
    initial: { scale: 0, rotate: -45, opacity: 0 },
    animate: {
      scale: [0, 1.3, 1],
      rotate: [-45, 15, 0],
      opacity: [0, 1, 1],
      transition: { duration: 0.6, delay: 0.9, ease: [0.25, 1, 0.5, 1] },
    },
  }

  const pinContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.35 },
    },
  }

  const handleSubmit = async e => {
    if (e) e.preventDefault()
    if (teamCode.length !== 6 || loading) return
    setLoading(true)
    try {
      await onJoin(teamCode)
      // On successful join, onClose might be called by parent, which resets teamCode via useEffect
      // If not, reset here:
      // setTeamCode('');
    } catch (error) {
      console.error('Error joining team:', error)
      // Consider adding a toast notification here for user feedback on error
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTeamCode('')
    onClose()
  }

  const handlePinChange = value => {
    setTeamCode(value)
  }

  const handlePinComplete = value => {
    // setTeamCode(value); // onChange already does this
    // PinInput's onComplete is reliable
    setTimeout(() => handleSubmit(), 200) // Slight delay for UX
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      size={modalSize}
      motionPreset="none"
    >
      <ModalOverlay
        bg="rgba(6, 7, 22, 0.9)"
        backdropFilter="blur(16px) saturate(180%)"
      />
      <MotionModalContent
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        bg="rgba(18, 20, 48, 0.92)"
        backdropFilter="blur(24px) saturate(150%)"
        borderWidth="1px"
        borderColor="rgba(138, 143, 255, 0.18)"
        boxShadow="0 25px 70px -15px rgba(46, 52, 122, 0.35), 0 10px 25px -10px rgba(0,0,0,0.35), inset 0 1px 1px rgba(138, 143, 255, 0.1)"
        borderRadius="2xl"
        pb={6}
        overflow="hidden"
        position="relative"
        maxW={{ base: '95vw', sm: '430px' }}
        mx={{ base: 2, sm: 'auto' }}
      >
        <Box
          position="absolute"
          top="-30%"
          left="-20%"
          width="150%"
          height="400px"
          bgGradient="radial(circle at 30% 30%, rgba(101, 31, 255, 0.12), transparent 65%)"
          filter="blur(110px)"
          opacity="0.6"
          animation="pulseGlow 12s infinite alternate ease-in-out"
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="-30%"
          right="-20%"
          width="150%"
          height="300px"
          bgGradient="radial(circle at 70% 70%, rgba(38, 78, 255, 0.1), transparent 65%)"
          filter="blur(100px)"
          opacity="0.5"
          borderRadius="full"
          animation="pulseGlow 14s infinite alternate-reverse ease-in-out .5s"
          zIndex={0}
        />
        <style>
          {`
            @keyframes pulseGlow {
              0% { opacity: 0.4; transform: scale(1) rotate(-20deg); }
              100% { opacity: 0.7; transform: scale(1.08) rotate(-12deg); }
            }
          `}
        </style>

        <Box
          position="relative"
          borderBottomWidth="1px"
          borderImage="linear-gradient(to right, transparent, rgba(138, 143, 255, 0.25), transparent) 1"
          bg="rgba(28, 32, 70, 0.35)"
          pb={5}
          pt={6}
          px={6}
          mb={5}
        >
          <ModalCloseButton
            color="whiteAlpha.800"
            _hover={{
              color: 'white',
              bg: 'rgba(255, 255, 255, 0.12)',
              transform: 'scale(1.15) rotate(90deg)',
            }}
            _active={{
              bg: 'rgba(255,255,255,0.18)',
              transform: 'scale(1.05) rotate(90deg)',
            }}
            size="lg"
            top={4}
            right={4}
            borderRadius="full"
            transition="all 0.25s cubic-bezier(0.68, -0.55, 0.27, 1.55)"
            zIndex="docked"
            aria-label="Close modal"
          />

          <Flex direction="column" align="center" position="relative">
            <MotionBox
              animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
              mb={4}
              p={3.5}
              borderRadius="full"
              bgGradient="radial(circle, rgba(101, 31, 255, 0.18), transparent 70%)"
              boxShadow="0 0 35px rgba(101, 31, 255, 0.2), 0 0 12px rgba(255, 200, 61, 0.1) inset"
              border="1px solid rgba(138, 143, 255, 0.15)"
              position="relative"
            >
              <Icon
                as={Crown}
                color="rgba(255, 200, 61, 1)"
                boxSize={8}
                filter="drop-shadow(0 0 8px rgba(255,200,61,0.6))"
              />
              <MotionBox
                position="absolute"
                top="-8px"
                right="-8px"
                variants={starVariants}
                initial="initial"
                animate="animate"
              >
                <Icon
                  as={Star}
                  color="rgba(255, 200, 61, 1)"
                  boxSize={4.5}
                  filter="drop-shadow(0 0 5px rgba(255,200,61,0.4))"
                />
              </MotionBox>
            </MotionBox>

            <Heading
              size={headingSize}
              fontWeight="bold"
              textAlign="center"
              bgGradient="linear(to-r, purple.300, whiteAlpha.900, purple.300)"
              bgClip="text"
              letterSpacing="0.05em"
              textShadow="0 4px 20px rgba(138, 143, 255, 0.25), 0 1px 4px rgba(255,255,255,0.15)"
            >
              {t('Join Existing Team')}
            </Heading>
          </Flex>
        </Box>

        <ModalBody
          pt={2}
          pb={8}
          px={{ base: 5, md: 7 }}
          zIndex={1}
          position="relative"
        >
          <VStack spacing={7} align="stretch">
            <MotionFlex // MotionFlex for the container of PinInput
              variants={pinContainerVariants}
              initial="hidden"
              animate="visible"
              direction="column"
              align="center"
              width="100%"
            >
              <FormControl>
                <FormLabel
                  textAlign="center"
                  color="blue.200" // Ensure blue.200 is defined in your theme
                  mb={5}
                  fontSize="lg"
                  fontWeight="medium"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={Key} mr={2.5} color="blue.200" boxSize={5} />
                  {t('Enter Team Code')}
                </FormLabel>

                <Flex justify="center" width="100%">
                  <PinInput
                    value={teamCode}
                    onChange={handlePinChange}
                    onComplete={handlePinComplete}
                    type="alphanumeric"
                    size={pinSize}
                    otp // Shows dots for entered characters
                    isDisabled={loading} // Disables the whole PinInput set if loading
                    autoFocus // Focuses the first *enabled* PinInputField
                  >
                    {[0, 1, 2, 3, 4, 5].map(index => {
                      const isCurrentFieldDisabled =
                        loading ||
                        (teamCode.length < 6
                          ? index !== teamCode.length
                          : index !== 5)

                      return (
                        <PinInputField
                          key={index}
                          bg="rgba(28, 32, 70, 0.75)"
                          color="whiteAlpha.900"
                          borderColor="rgba(138, 143, 255, 0.25)"
                          borderWidth="1.5px"
                          borderRadius="lg"
                          fontSize={pinFontSize}
                          fontWeight="semibold"
                          width={pinWidth}
                          height={pinHeight}
                          textAlign="center"
                          mx={pinSpacing}
                          _hover={
                            !isCurrentFieldDisabled
                              ? {
                                  // Apply hover only if not disabled
                                  borderColor: 'purple.300', // Ensure purple.300 is defined
                                  boxShadow:
                                    '0 0 15px rgba(171, 108, 237, 0.3)',
                                }
                              : {}
                          }
                          _focus={{
                            // These styles apply when the field is focused (and enabled)
                            borderColor: 'purple.300',
                            boxShadow:
                              '0 0 0 3px rgba(171, 108, 237, 0.45), 0 0 25px rgba(171, 108, 237, 0.35)',
                            bg: 'rgba(32, 37, 80, 0.85)',
                          }}
                          // To show "○" as placeholder for empty non-focused fields:
                          // placeholder={isCurrentFieldDisabled || teamCode[index] ? undefined : "○"}
                          // However, `otp` prop handles the visual part well.
                          // If you want "○" explicitly, you might need to not use `otp` and handle display manually.
                          _placeholder={{ color: 'whiteAlpha.400' }} // Default placeholder style if used
                          sx={{ caretColor: 'purple.300' }} // Ensure purple.300 is defined
                          transition="all 0.25s ease-out"
                          isDisabled={isCurrentFieldDisabled}
                        />
                      )
                    })}
                  </PinInput>
                </Flex>

                <FormHelperText
                  color="whiteAlpha.600"
                  textAlign="center"
                  mt={5}
                  fontSize="sm"
                >
                  {t('Enter the 6-character code to join a team')}
                </FormHelperText>
              </FormControl>
            </MotionFlex>

            <MotionDivider
              width="85%"
              my={3}
              opacity={0.7}
              initial={{ width: '0%' }}
              animate={{ width: '85%' }}
              transition={{ delay: 0.55, duration: 0.9, ease: 'circOut' }}
              css={{
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(138, 143, 255, 0.2) 50%, transparent 100%)',
              }}
            />

            <MotionBox // MotionBox for the info section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5, ease: 'easeOut' }}
              bg="rgba(25, 29, 60, 0.65)"
              _hover={{ bg: 'rgba(28, 32, 70, 0.75)' }}
              p={5}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="rgba(138, 143, 255, 0.12)"
              width="100%"
              boxShadow="0 8px 30px -5px rgba(0, 0, 0, 0.25)"
              position="relative"
              overflow="hidden"
              // transition="background 0.3s ease-out, border-color 0.3s ease-out"
            >
              <Box
                position="absolute"
                top="-80px"
                left="-40px"
                width="25px"
                height="calc(100% + 160px)"
                bg="rgba(161, 165, 255, 0.07)"
                transform="rotate(30deg)"
                opacity="0.9"
                filter="blur(6px)"
                zIndex={0}
                pointerEvents="none"
              />

              <VStack
                align="stretch"
                spacing={3.5}
                position="relative"
                zIndex={1}
              >
                <Flex align="center" justify="space-between">
                  <HStack spacing={3}>
                    <Icon as={Users} color="blue.200" boxSize={iconSize + 1} />
                    <Text color="gray.50" fontWeight="bold" fontSize="lg">
                      {t('Team Information')}
                    </Text>
                  </HStack>
                  <Box
                    h="4px"
                    w="35px"
                    bgGradient="linear(to-r, purple.400, blue.300)" // Ensure these colors are in theme
                    borderRadius="full"
                    opacity={0.75}
                  />
                </Flex>

                <HStack pl={1} spacing={3} opacity={0.9}>
                  <Icon as={Zap} color="blue.300" boxSize={4} />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('You can get a team code from a team leader')}
                  </Text>
                </HStack>

                <HStack pl={1} spacing={3} opacity={0.9}>
                  <Icon as={Zap} color="blue.300" boxSize={4} />
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t('Teams can have up to 4 members')}
                  </Text>
                </HStack>
              </VStack>
            </MotionBox>
          </VStack>
        </ModalBody>

        <ModalFooter
          px={{ base: 5, md: 7 }}
          pt={4}
          pb={2}
          justifyContent="space-between"
          borderTopWidth="1px"
          borderImage="linear-gradient(to right, transparent, rgba(138, 143, 255, 0.18), transparent) 1"
          mt={4}
        >
          <Button
            variant="ghost"
            onClick={handleClose}
            color="whiteAlpha.700"
            _hover={{
              bg: 'whiteAlpha.100',
              color: 'whiteAlpha.900',
              transform: 'scale(1.03)',
            }}
            _active={{ bg: 'whiteAlpha.150', transform: 'scale(0.98)' }}
            size="lg"
            fontWeight="semibold"
            px={6}
            transition="all 0.2s ease-out"
            borderRadius="lg"
          >
            {t('Cancel')}
          </Button>

          <Button
            bgGradient="linear(to-r, purple.500, blue.500)" // Ensure these colors are in theme
            _hover={{
              bgGradient: 'linear(to-r, purple.400, blue.400)',
              transform: 'translateY(-3px) scale(1.02)',
              boxShadow: '0 8px 25px -8px rgba(128, 90, 213, 0.7)',
            }}
            _active={{
              bgGradient: 'linear(to-r, purple.600, blue.600)',
              transform: 'translateY(-1px) scale(1)',
              boxShadow: '0 5px 18px -8px rgba(128, 90, 213, 0.6)',
            }}
            color="white"
            fontWeight="bold"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText={t('Joining...')}
            isDisabled={teamCode.length !== 6 || loading}
            leftIcon={<Icon as={UserPlus} boxSize={5} />}
            boxShadow="0 6px 18px -8px rgba(128, 90, 213, 0.6)"
            transition="all 0.25s cubic-bezier(0.68, -0.55, 0.27, 1.55)"
            size="lg"
            px={6}
            borderRadius="lg"
          >
            {t('Join Team')}
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  )
}

export default JoinTeamModal
