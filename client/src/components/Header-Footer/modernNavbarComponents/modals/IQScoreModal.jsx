// File path: components/IQScoreModal.jsx

import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
  lazy,
  Suspense,
} from 'react'
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
  Container,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Icon,
  useMediaQuery,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Brain, Crown, TrendingUp } from 'lucide-react'

import CircleAndSocietyData from '../../../../assets/CircleAndSocietyData'

// Lazy load components
const Heading = lazy(() => import('../../../miscellaneous/HeadingComponent'))
const EnhancedSocietyCircle = lazy(() =>
  import(
    '../../../profileComponents/RightProfileSectionComponents/RankAndSocietySubCompnents/EnhancedSocietyCircle'
  ),
)

const IQScoreModal = React.memo(({ setShowIQScoreModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useSelector(state => state.auth)
  const { t } = useTranslation('IQScoreModal')
  const [showBrainModal, setShowBrainModal] = useState(false)
  const [showCircleModal, setShowCircleModal] = useState(false)
  const [prefersReducedMotion] = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  )

  const USER_IQ = useMemo(() => user?.IQ_score, [user])
  const USER_RANK = useMemo(() => user?.rank, [user])

  const circleAndSociety = useMemo(() => {
    return (
      CircleAndSocietyData.find(
        data =>
          data.IQ_Lower <= USER_IQ &&
          (data.IQ_Upper ? data.IQ_Upper > USER_IQ : true),
      ) || CircleAndSocietyData[CircleAndSocietyData.length - 1]
    )
  }, [USER_IQ])

  useEffect(() => {
    onOpen()
  }, [onOpen])

  const handleClose = useCallback(() => {
    onClose()
    setShowIQScoreModal(false)
  }, [onClose, setShowIQScoreModal])

  const handleBrainClick = useCallback(() => setShowBrainModal(true), [])
  const handleCircleClick = useCallback(() => setShowCircleModal(true), [])

  const StatCard = React.memo(({ icon, label, value, helpText }) => (
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
  ))

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          size={{ base: 'full', md: 'xl' }}
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
                      <Suspense fallback={<Spinner color="purple.500" />}>
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
                    animation={
                      prefersReducedMotion ? undefined : 'pulseGlow 2s infinite'
                    }
                  >
                    <Flex align="center" gap={3}>
                      <Icon as={TrendingUp} w={5} h={5} color="purple.400" />
                      <Text color="gray.300">
                        {t('achievementBanner', { USER_IQ, USER_RANK }) ||
                          `IQ: ${USER_IQ}, Rank: ${USER_RANK}`}
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
})

export default IQScoreModal
