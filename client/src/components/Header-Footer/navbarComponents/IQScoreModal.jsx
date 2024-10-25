import React, { useEffect, useCallback, Suspense, useState } from 'react'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  Flex,
  Spinner,
  Badge,
  Container,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Icon,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import CircleAndSocietyData from '../../../assets/CircleAndSocietyData'
import { useSelector } from 'react-redux'
import { Brain, Crown, TrendingUp } from 'lucide-react'
import { keyframes } from '@emotion/react'

// Lazy load components
const Heading = React.lazy(() => import('../../miscellaneous/HeadingComponent'))
const EnhancedSocietyCircle = React.lazy(() =>
  import(
    '../../profileComponents/RightProfileSectionComponents/RankAndSocietySubCompnents/EnhancedSocietyCircle'
  ),
)

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(124, 58, 237, 0); }
  100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
`

const IQScoreModal = ({ setShowIQScoreModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useSelector(state => state.auth)
  const { t } = useTranslation('IQScoreModal')
  const [showBrainModal, setShowBrainModal] = useState(false)
  const [showCircleModal, setShowCircleModal] = useState(false)
  const USER_IQ = user?.IQ_score
  const USER_RANK = user?.rank
  const isGuest = user?.role === 'guest'

  // Memoize the circleAndSociety calculation
  const circleAndSociety = React.useMemo(() => {
    const userCircleAndSociety = CircleAndSocietyData.find(
      data =>
        data.IQ_Lower <= USER_IQ &&
        (data.IQ_Upper ? data.IQ_Upper > USER_IQ : true),
    )
    return (
      userCircleAndSociety ||
      CircleAndSocietyData[CircleAndSocietyData.length - 1]
    )
  }, [USER_IQ])

  useEffect(() => {
    onOpen()
  }, [])

  const handleClose = useCallback(() => {
    onClose()
    setShowIQScoreModal(false)
  }, [onClose, setShowIQScoreModal])

  const handleBrainClick = useCallback(() => {
    setShowBrainModal(true)
  }, [])

  const handleCircleClick = useCallback(() => {
    setShowCircleModal(true)
  }, [])

  const LoadingSpinner = () => (
    <Flex justify="center" align="center" h="200px">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.700"
        color="purple.500"
        size="xl"
      />
    </Flex>
  )

  const StatCard = ({ icon, label, value, helpText }) => (
    <Box
      p={{ base: 2, md: 6 }}
      bg="rgba(45, 42, 71, 0.3)"
      borderRadius="xl"
      border="1px solid rgba(255, 255, 255, 0.05)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      }}
      transition="all 0.3s"
      position="relative"
      overflow="hidden"
    >
      <Flex align="center" mb={4}>
        <Icon as={icon} w={6} h={6} color="purple.400" mr={2} />
        <Stat>
          <StatLabel fontSize="lg" color="gray.300">
            {label}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color="white">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText color="gray.400" fontSize="sm">
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </Flex>
    </Box>
  )

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          size="xl"
          motionPreset="slideInBottom"
        >
          <ModalOverlay bg="rgba(15, 13, 21, 0.9)" backdropFilter="blur(8px)" />
          <ModalContent
            maxW={{ base: '95vw', md: '85vw', lg: '80vw' }}
            py={10}
            px={{ base: 0, md: 6 }}
            borderRadius="xl"
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            boxShadow="0 20px 40px rgba(0, 0, 0, 0.4)"
            color="white"
            fontFamily="'Roboto', sans-serif"
            border="1px solid rgba(255, 255, 255, 0.1)"
            animation={`${fadeIn} 0.3s ease-out`}
          >
            <ModalCloseButton
              color="white"
              onClick={handleClose}
              _hover={{
                bg: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.1)',
              }}
              transition="all 0.2s"
            />

            <ModalBody>
              <Container maxW="container.xl" p={0}>
                <VStack spacing={8} align="stretch">
                  <Flex
                    direction={{ base: 'column', md: 'row' }}
                    gap={6}
                    w="100%"
                  >
                    {/* Stats Section */}
                    <VStack spacing={6} flex={1}>
                      <StatCard
                        icon={Brain}
                        label={t('iqScore')}
                        value={USER_IQ}
                        helpText={t('iqScoreHelpText')}
                      />
                      <StatCard
                        icon={Crown}
                        label={t('rank')}
                        value={`#${USER_RANK}`}
                        helpText={t('rankHelpText')}
                      />
                    </VStack>

                    {/* Society Circle Section */}
                    <Flex
                      flex={1}
                      p={6}
                      bg="rgba(45, 42, 71, 0.3)"
                      borderRadius="xl"
                      border="1px solid rgba(255, 255, 255, 0.05)"
                      direction="column"
                      _hover={{
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                      }}
                      transition="all 0.3s"
                    >
                      <Heading
                        title={t('societyAndCircleTitle')}
                        size="md"
                        mb={6}
                      />
                      <Suspense fallback={<LoadingSpinner />}>
                        <EnhancedSocietyCircle
                          societyData={circleAndSociety}
                          handleBrainClick={handleBrainClick}
                          handleCircleClick={handleCircleClick}
                        />
                      </Suspense>
                    </Flex>
                  </Flex>

                  {/* Achievement Banner */}
                  <Box
                    p={4}
                    bg="rgba(124, 58, 237, 0.1)"
                    borderRadius="lg"
                    border="1px solid rgba(124, 58, 237, 0.2)"
                    animation={`${pulseGlow} 2s infinite`}
                  >
                    <Flex align="center" gap={3}>
                      <Icon as={TrendingUp} w={5} h={5} color="purple.400" />
                      <Text color="gray.300">
                        {t('achievementBanner', {
                          USER_IQ,
                          USER_RANK,
                        })}
                      </Text>
                    </Flex>
                  </Box>
                </VStack>
              </Container>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default IQScoreModal
