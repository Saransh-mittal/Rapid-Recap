import React, { Suspense } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Stack,
  Text,
  HStack,
  VStack,
  Badge,
  Avatar,
  Spinner,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Zap, Target, Star } from 'lucide-react'
import { fadeIn, slideIn } from './ChampionDetailsModal/animations'

// Lazy load components
const IQJourneyGraph = React.lazy(() =>
  import('./ChampionDetailsModal/IQJourneyGraph'),
)
const StatCard = React.lazy(() => import('./ChampionDetailsModal/StatCard'))
const QuizStatsCard = React.lazy(() =>
  import('./ChampionDetailsModal/QuizStatsCard'),
)
const LeagueInfoCard = React.lazy(() =>
  import('./ChampionDetailsModal/LeagueInfoCard'),
)
const AchievementsCard = React.lazy(() =>
  import('./ChampionDetailsModal/AchievementsCard'),
)
const PerformanceInsightsCard = React.lazy(() =>
  import('./ChampionDetailsModal/PerformanceInsightsCard'),
)

// Loading fallback component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={4}>
    <Spinner color="white" size="md" />
  </Box>
)

const ChampionDetailsModal = ({ isOpen, onClose, champion }) => {
  const { t } = useTranslation('ChampionDetailsModal')
  if (!champion) return null

  const rankColors = {
    1: 'yellow.400',
    2: 'gray.300',
    3: 'orange.300',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '4xl' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="rgba(13, 16, 31, 0.95)"
        boxShadow="dark-lg"
        borderRadius={{ base: 0, md: '2xl' }}
        border="1px solid"
        borderColor="whiteAlpha.100"
        my={{ base: 0, md: '3.75rem' }}
        overflow="hidden"
        style={{
          animation: `${fadeIn} 0.4s ease-out forwards`,
        }}
      >
        {/* Decorative top gradient */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="200px"
          bgGradient={
            champion.finalRank <= 3
              ? 'linear(to-r, pink.500, purple.500)'
              : 'linear(to-r, purple.600, blue.600)'
          }
          opacity={0.1}
        />

        <ModalCloseButton
          color="white"
          size="lg"
          zIndex={2}
          transition="all 0.3s"
          _hover={{
            transform: 'rotate(90deg)',
          }}
          sx={{ WebkitTapHighlightColor: 'transparent' }}
        />

        {/* Header Section */}
        <ModalHeader
          pt={{ base: 6, md: 8 }}
          pb={{ base: 4, md: 6 }}
          px={{ base: 4, md: 6 }}
        >
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={{ base: 3, md: 4 }}
            align={{ base: 'center', md: 'center' }}
            w="full"
            style={{
              animation: `${slideIn} 0.5s ease-out forwards`,
            }}
          >
            {/* Avatar Section */}
            <Box
              w={{ base: '72px', md: '60px' }}
              h={{ base: '72px', md: '60px' }}
              bg="rgba(255, 255, 255, 0.03)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="3px solid"
              borderColor={rankColors[champion.finalRank] || 'whiteAlpha.300'}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: `0 0 20px ${
                  rankColors[champion.finalRank] || 'whiteAlpha.300'
                }`,
              }}
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(to-br, whiteAlpha.100, transparent)"
                opacity={0.5}
              />
              <Avatar
                size="full"
                src={champion.profilePicture}
                bg="transparent"
                zIndex={1}
              />
            </Box>

            {/* Name and Rank Section */}
            <VStack
              align={{ base: 'center', md: 'start' }}
              spacing={1}
              flex="1"
            >
              <HStack spacing={3}>
                <Text
                  color="white"
                  fontSize={{ base: '2xl', md: '2xl' }}
                  fontWeight="bold"
                >
                  {champion.name}
                </Text>
                <Badge
                  colorScheme={champion.finalRank <= 3 ? 'pink' : 'purple'}
                  variant="solid"
                  px={2}
                  py={1}
                  borderRadius="md"
                  transition="all 0.3s"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
                  }}
                >
                  {t('Rank')} #{champion.finalRank}
                </Badge>
              </HStack>

              <HStack spacing={4}>
                <Text color="whiteAlpha.900" fontSize="md">
                  {champion.username}
                </Text>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  transition="all 0.3s"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(66, 153, 225, 0.3)',
                  }}
                >
                  {champion.circle}
                </Badge>
              </HStack>
            </VStack>
          </Stack>
        </ModalHeader>

        <ModalBody pb={8} px={6}>
          <VStack spacing={8}>
            {/* IQ Journey Graph */}
            <Suspense fallback={<LoadingFallback />}>
              <IQJourneyGraph
                start={champion.iqScore.start}
                current={champion.iqScore.final}
                peak={champion.iqScore.peak}
              />
            </Suspense>

            {/* Primary Stats Grid */}
            <Box
              display="grid"
              gridTemplateColumns={{
                base: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
              gap={4}
              w="full"
            >
              <Suspense fallback={<LoadingFallback />}>
                <StatCard
                  icon={Zap}
                  label={t('Exp Level')}
                  value={champion.experienceLevel}
                  delay={0.2}
                />
              </Suspense>
              <Suspense fallback={<LoadingFallback />}>
                <StatCard
                  icon={Target}
                  label={t('Submissions')}
                  value={champion.quizStats.total}
                  delay={0.3}
                />
              </Suspense>
              <Suspense fallback={<LoadingFallback />}>
                <StatCard
                  icon={Star}
                  label={t('RQM Score')}
                  value={champion.rqmScore.average}
                  subValue={`Peak: ${champion.rqmScore.highest}`}
                  delay={0.4}
                />
              </Suspense>
            </Box>

            <Box as="hr" borderColor="whiteAlpha.200" w="full" my={4} />

            {/* Quiz Stats Section */}
            <Suspense fallback={<LoadingFallback />}>
              <QuizStatsCard stats={champion.quizStats} t={t} />
            </Suspense>

            {/* League Info */}
            <Suspense fallback={<LoadingFallback />}>
              <LeagueInfoCard champion={champion} t={t} />
            </Suspense>

            {/* Achievements */}
            <Suspense fallback={<LoadingFallback />}>
              <AchievementsCard champion={champion} t={t} />
            </Suspense>

            {/* Performance Insights */}
            <Suspense fallback={<LoadingFallback />}>
              <PerformanceInsightsCard champion={champion} t={t} />
            </Suspense>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ChampionDetailsModal
