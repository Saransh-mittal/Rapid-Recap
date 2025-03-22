// components/quickClashComponents/ChallengeAnalysisModal.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  Center,
  Button,
  Flex,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Brain, XCircle, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import useDailyTasks from '../../customHooks/useDailyTasks'

// Lazy loaded tab components
const PerformanceTab = lazy(() => import('./analysisComponents/PerformanceTab'))
const KnowledgeTab = lazy(() => import('./analysisComponents/KnowledgeTab'))
const LearningTab = lazy(() => import('./analysisComponents/LearningTab'))
const BattleTab = lazy(() => import('./analysisComponents/BattleTab'))
const BattleResultsBanner = lazy(() =>
  import('./analysisComponents/BattleResultsBanner'),
)

// Motion components
const MotionBox = motion(Box)

const ChallengeAnalysisModal = ({ isOpen, onClose, challengeId }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const toast = useToast()
  const { trackAnalysisView } = useDailyTasks()

  // Background colors - more soothing gradient
  const bgGradient = useColorModeValue(
    'linear-gradient(to bottom, #161229, #0a0816)',
    'linear-gradient(to bottom, #161229, #0a0816)',
  )

  // Track which tab panels have been viewed
  const [viewedTabs, setViewedTabs] = useState({ 0: true })

  const handleTabChange = index => {
    setActiveTab(index)
    setViewedTabs(prev => ({ ...prev, [index]: true }))
  }

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!isOpen || !challengeId) return

      try {
        setLoading(true)
        setError(null)

        // First try to get existing analysis
        let response = await axios.get(
          `/api/quickClash/analysis/${challengeId}`,
        )

        // If no analysis exists, generate one
        if (!response.data.analysis) {
          toast({
            title: t('Generating analysis'),
            description: t('Please wait while we analyze your battle...'),
            status: 'info',
            duration: 3000,
            isClosable: true,
          })

          response = await axios.post(
            `/api/quickClash/analysis/${challengeId}/generate`,
          )
        }

        if (response.data?.analysis) {
          setAnalysis(response.data.analysis)
        } else {
          throw new Error(t('Failed to generate analysis'))
        }
      } catch (err) {
        console.error('Error fetching analysis:', err)
        setError(err.response?.data?.message || t('Failed to load analysis'))
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [isOpen, challengeId, toast, t])
  useEffect(() => {
    if (analysis) {
      // Track when user views an analysis
      trackAnalysisView()
    }
  }, [analysis, trackAnalysisView])

  // Calculate some derived values for display
  const userIsWinner =
    analysis?.engagement?.winner &&
    user?._id === analysis.engagement.winner.toString()

  const isTie = !analysis?.engagement?.winner && analysis?.battleMetrics

  // Loading spinner
  if (loading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent
          bg={bgGradient}
          margin={0}
          borderRadius={0}
          height="100vh"
        >
          <Center h="100%">
            <VStack spacing={6}>
              <Spinner
                size="xl"
                thickness="4px"
                color="purple.500"
                speed="0.65s"
              />
              <Text color="whiteAlpha.800" fontSize="lg">
                {t('Analyzing your battle performance...')}
              </Text>
            </VStack>
          </Center>
        </ModalContent>
      </Modal>
    )
  }

  // Error state
  if (error) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent
          bg={bgGradient}
          margin={0}
          borderRadius={0}
          height="100vh"
        >
          <Center h="100%" flexDirection="column" p={6}>
            <Icon as={XCircle} boxSize={12} color="red.400" mb={4} />
            <Text fontSize="xl" mb={4} color="white" textAlign="center">
              {t('Error Loading Analysis')}
            </Text>
            <Text color="whiteAlpha.800" mb={6} textAlign="center">
              {error}
            </Text>
            <Button onClick={onClose} leftIcon={<ArrowLeft size={16} />}>
              {t('Back to Challenges')}
            </Button>
          </Center>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg={bgGradient}
        margin={0}
        borderRadius={0}
        height="100vh"
        color="white"
        p={0}
      >
        {/* Mobile-optimized header with back button */}
        <Flex
          position="sticky"
          top={0}
          zIndex={10}
          w="100%"
          p={3}
          bg="rgba(10, 8, 22, 0.95)"
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          align="center"
        >
          <IconButton
            icon={<ArrowLeft size={18} />}
            onClick={onClose}
            variant="ghost"
            color="white"
            aria-label="Back"
            mr={2}
          />

          <HStack flex={1}>
            <Icon as={Brain} color="purple.400" boxSize={5} />
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
              {t('AI Battle Analysis')}
            </Text>
          </HStack>

          <HStack spacing={2}>
            {analysis?.battleMetrics?.category && (
              <Badge colorScheme="purple" fontSize="xs">
                {analysis.battleMetrics.category}
              </Badge>
            )}

            {analysis?.battleMetrics?.difficulty && (
              <Badge
                colorScheme={
                  analysis.battleMetrics.difficulty === 'easy'
                    ? 'green'
                    : analysis.battleMetrics.difficulty === 'medium'
                    ? 'blue'
                    : 'red'
                }
                fontSize="xs"
                display={{ base: 'none', sm: 'flex' }}
              >
                {analysis.battleMetrics.difficulty}
              </Badge>
            )}
          </HStack>
        </Flex>

        <VStack
          spacing={4}
          align="stretch"
          h="calc(100% - 56px)"
          overflow="auto"
          px={{ base: 3, md: 6 }}
          py={4}
        >
          {/* Battle Results Banner */}
          {analysis && (
            <Suspense fallback={<Box h="100px" w="100%" />}>
              <BattleResultsBanner
                analysis={analysis}
                userIsWinner={userIsWinner}
                isTie={isTie}
                userId={user?._id}
              />
            </Suspense>
          )}

          {/* Main Content Tabs */}
          <Tabs
            variant="soft-rounded"
            colorScheme="purple"
            index={activeTab}
            onChange={handleTabChange}
            isFitted
            size="sm"
            mt={2}
          >
            <TabList
              mb={4}
              overflowX="auto"
              py={2}
              css={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              <Tab
                whiteSpace="nowrap"
                py={2}
                px={{ base: 2, sm: 3 }}
                fontSize={{ base: 'xs', sm: 'sm' }}
              >
                {t('Performance')}
              </Tab>
              <Tab
                whiteSpace="nowrap"
                py={2}
                px={{ base: 2, sm: 3 }}
                fontSize={{ base: 'xs', sm: 'sm' }}
              >
                {t('Knowledge')}
              </Tab>
              <Tab
                whiteSpace="nowrap"
                py={2}
                px={{ base: 2, sm: 3 }}
                fontSize={{ base: 'xs', sm: 'sm' }}
              >
                {t('Learning')}
              </Tab>
              <Tab
                whiteSpace="nowrap"
                py={2}
                px={{ base: 2, sm: 3 }}
                fontSize={{ base: 'xs', sm: 'sm' }}
              >
                {t('Battle')}
              </Tab>
            </TabList>

            <TabPanels>
              {/* Only render tab content that has been viewed */}
              <TabPanel p={0}>
                <Suspense
                  fallback={
                    <Center h="200px">
                      <Spinner />
                    </Center>
                  }
                >
                  {analysis && <PerformanceTab analysis={analysis} />}
                </Suspense>
              </TabPanel>

              <TabPanel p={0}>
                {viewedTabs[1] && (
                  <Suspense
                    fallback={
                      <Center h="200px">
                        <Spinner />
                      </Center>
                    }
                  >
                    {analysis && <KnowledgeTab analysis={analysis} t={t} />}
                  </Suspense>
                )}
              </TabPanel>

              <TabPanel p={0}>
                {viewedTabs[2] && (
                  <Suspense
                    fallback={
                      <Center h="200px">
                        <Spinner />
                      </Center>
                    }
                  >
                    {analysis && <LearningTab analysis={analysis} t={t} />}
                  </Suspense>
                )}
              </TabPanel>

              <TabPanel p={0}>
                {viewedTabs[3] && (
                  <Suspense
                    fallback={
                      <Center h="200px">
                        <Spinner />
                      </Center>
                    }
                  >
                    {analysis && (
                      <BattleTab
                        analysis={analysis}
                        userIsWinner={userIsWinner}
                        isTie={isTie}
                        t={t}
                      />
                    )}
                  </Suspense>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </ModalContent>
    </Modal>
  )
}

export default ChallengeAnalysisModal
