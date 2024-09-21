import React, { lazy, Suspense, useMemo, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Progress,
  Flex,
  Heading,
  SimpleGrid,
  Badge,
  Button,
  Spinner,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

import TrophySVG from '../../assets/svg/TrophySVG'
import Target from '../../assets/svg/Target'
import ClockSVG from '../../assets/svg/ClockSVG'
import CategoryStatsCard from './CategoryStatsCard'

// Lazy load heavy components
const CategoryCard = lazy(() => import('./CategoryCard'))
const QuizBG = lazy(() => import('./tournamentQuiz/QuizBG'))
const UserSVG = lazy(() => import('../../assets/svg/UserSVG'))

const UserStatsModal = ({ isOpen, onClose, userStats, t }) => {
  const statsRef = React.useRef(null)
  const navigate = useNavigate()

  // Memoize category stats for better performance
  const categoryStats = useMemo(
    () => userStats?.categoryStats || [],
    [userStats],
  )

  // Memoized navigation handler to avoid recreating on each render
  const handleProfileNavigation = useCallback(() => {
    if (userStats) {
      navigate(`/profile/${userStats.inGameName}`)
    }
  }, [navigate, userStats])

  if (!userStats) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent
        color="white"
        borderRadius="lg"
        boxShadow="0 0 20px rgba(255, 215, 0, 0.3)"
        ref={statsRef}
      >
        {/* Lazy load background */}
        <Suspense fallback={<Spinner />}>
          <QuizBG />
        </Suspense>
        <ModalHeader
          fontSize="3xl"
          fontWeight="bold"
          textAlign="center"
          borderBottom="2px solid"
          borderColor="gold"
          pb={4}
        >
          {t('playerStatistics')}
        </ModalHeader>
        <ModalCloseButton color="gold" />
        <ModalBody w={'90%'}>
          <VStack spacing={8} align="stretch" py={6}>
            <Box>
              <Heading size="lg" mb={4} color="gold">
                {t('overallPerformance')}
              </Heading>
              <HStack
                justify="space-between"
                bg="whiteAlpha.200"
                p={4}
                borderRadius="md"
              >
                <HStack>
                  <TrophySVG color="gold" size={32} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">{t('totalScore')}</Text>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl' }}
                      fontWeight="bold"
                      color="gold"
                    >
                      {userStats.totalScore}
                    </Text>
                  </VStack>
                </HStack>
                <Badge fontSize={{ base: 'sm', md: 'lg' }}>
                  {t('quizCount')} {userStats.completedCategories.length}
                </Badge>
              </HStack>
            </Box>

            <Box>
              <Heading size="lg" mb={4} color="gold">
                {t('categoryBreakdown')}
              </Heading>
              <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
                spacing={4}
              >
                {categoryStats.map((stat, index) => (
                  <CategoryStatsCard
                    key={index}
                    stat={stat}
                    t={t}
                    userStats={userStats}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
          <Flex justifyContent="center" mt={6}>
            {/* Lazy load UserSVG */}
            <Suspense fallback={<Spinner />}>
              <Button
                leftIcon={<UserSVG fill={'white'} />}
                colorScheme="pink"
                onClick={handleProfileNavigation}
              >
                {t('viewProfile')}
              </Button>
            </Suspense>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default UserStatsModal
