// components/quickClashComponents/leaderboard/QuickClashLeaderboardModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  Text,
  Flex,
  Icon,
  Center,
  Spinner,
  Divider,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trophy } from 'lucide-react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { notificationManager } from '../../../utils/notifications'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

// Import custom components
import LeaderboardCard from './components/LeaderboardCard'
import SearchBar from './components/SearchBar'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'
import EmptyState from './components/EmptyState'
import PaginationInfo from './components/PaginationInfo'
import useInfiniteScroll from './hooks/useInfiniteScroll'

// Styled motion components
const MotionBox = motion(Box)
const MotionText = motion(Text)

const QuickClashLeaderboardModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const currentUserId = user?._id
  const scrollRef = useRef(null)

  // State management
  const [leaderboardData, setLeaderboardData] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalUsers: 0,
    totalPages: 0,
    hasMore: false,
  })
  const [loading, setLoading] = useState(true)
  const [nextPageLoading, setNextPageLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDebounce, setSearchDebounce] = useState('')
  const [backgroundFetching, setBackgroundFetching] = useState(false)

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(
    async (pageNum = 1, replace = true) => {
      try {
        if (pageNum === 1) {
          setLoading(true)
        } else {
          setNextPageLoading(true)
        }

        setError(null)

        const response = await axios.get('/api/quickClash/leaderboard', {
          params: {
            page: pageNum,
            limit: pagination.limit,
            search: searchDebounce,
          },
        })

        if (response.data.success) {
          if (replace) {
            setLeaderboardData(response.data.users || [])
          } else {
            setLeaderboardData(prev => [
              ...prev,
              ...(response.data.users || []),
            ])
          }
          setPagination(response.data.pagination || pagination)
        } else {
          setError(response.data.message || t('Failed to load leaderboard'))
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError(
          error.response?.data?.message || t('Failed to load leaderboard'),
        )
        notificationManager.error(
          t('Error'),
          error.response?.data?.message || t('Failed to load leaderboard')
        )
      } finally {
        setLoading(false)
        setNextPageLoading(false)
        setBackgroundFetching(false)
      }
    },
    [pagination.limit, searchDebounce, t],
  )

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchDebounce) {
        setSearchDebounce(searchQuery)
        setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on new search
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchDebounce])

  // Fetch leaderboard when dependencies change
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard(1, true)
    }
  }, [isOpen, fetchLeaderboard])

  // Fetch first page when search changes
  useEffect(() => {
    if (searchDebounce !== '') {
      fetchLeaderboard(1, true)
    }
  }, [searchDebounce, fetchLeaderboard])

  // Handle loading next page (for infinite scroll)
  const handleLoadMore = useCallback(() => {
    const nextPage = pagination.page + 1
    setBackgroundFetching(true)
    fetchLeaderboard(nextPage, false)
  }, [pagination.page, fetchLeaderboard])

  // Set up infinite scrolling
  useInfiniteScroll(scrollRef, {
    hasMore: pagination.hasMore,
    loading: loading || nextPageLoading,
    backgroundFetching,
    onLoadMore: handleLoadMore,
    threshold: 200,
  })

  // Handle search clear
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchDebounce('')
  }, [])

  // Handle view profile
  const handleViewProfile = useCallback(
    inGameName => {
      quizAudioService.playButtonClick() // Sound for profile click
      navigate(`/profile/${inGameName}`)
      onClose()
    },
    [navigate, onClose],
  )

  // Handle close with sound
  const handleClose = useCallback(() => {
    quizAudioService.playDismiss()
    onClose()
  }, [onClose])

  // Handle retry on error
  const handleRetry = useCallback(() => {
    fetchLeaderboard(1, true)
  }, [fetchLeaderboard])

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3,
      },
    },
  }

  // Render content based on state
  const renderContent = () => {
    if (loading && leaderboardData.length === 0) {
      return <LoadingState />
    }

    if (error && leaderboardData.length === 0) {
      return <ErrorState error={error} onRetry={handleRetry} />
    }

    if (leaderboardData.length === 0) {
      return (
        <EmptyState
          searchQuery={searchQuery}
          handleClearSearch={handleClearSearch}
        />
      )
    }

    return (
      <AnimatePresence>
        <VStack spacing={0} align="stretch" px={3} pb={6} pt={2}>
          {leaderboardData.map(user => (
            <LeaderboardCard
              key={user._id}
              user={user}
              currentUserId={currentUserId}
              rank={user.rank}
              onViewProfile={handleViewProfile}
            />
          ))}

          {/* Next page loading indicator */}
          {nextPageLoading && (
            <Center py={4}>
              <Spinner color="purple.500" size="sm" />
            </Center>
          )}

          {/* End message */}
          {!pagination.hasMore && leaderboardData.length > 0 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Divider my={3} opacity={0.1} />
              <Text
                textAlign="center"
                color="whiteAlpha.500"
                fontSize="2xs"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                {t('End of leaderboard')}
              </Text>
            </MotionBox>
          )}
        </VStack>
      </AnimatePresence>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: 'lg' }}
      motionPreset="none"
      isCentered={false}
    >
      <ModalOverlay
        as={motion.div}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        backdropFilter="blur(8px)"
        bg="rgba(0, 0, 0, 0.7)"
      />

      <ModalContent
        as={motion.div}
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        bg="rgba(13, 16, 31, 0.95)"
        borderRadius={{ base: 0, md: 'xl' }}
        overflow="hidden"
        maxH={{ base: '100vh', md: '90vh' }}
        my={{ base: 0, md: '5vh' }}
        mx={{ base: 0, md: 4 }}
        h={{ base: '100vh', md: 'auto' }}
        display="flex"
        flexDirection="column"
        backdropFilter="blur(10px)"
        borderWidth={{ base: 0, md: '1px' }}
        borderColor="rgba(255, 255, 255, 0.06)"
        boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      >
        {/* Decorative header gradient */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="100px"
          bgGradient="linear(to-b, rgba(138, 75, 255, 0.08), transparent)"
          pointerEvents="none"
          zIndex={0}
        />

        <ModalHeader
          p={4}
          display="flex"
          alignItems="center"
          borderBottomWidth="1px"
          borderBottomColor="rgba(255, 255, 255, 0.06)"
          position="relative"
          zIndex={1}
        >
          <MotionBox
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
          >
            <Icon as={Trophy} color="#FFD700" mr={3} boxSize={5} />
          </MotionBox>
          <MotionText
            color="white"
            fontWeight="semibold"
            fontSize="lg"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {t('Quick Clash Leaderboard')}
          </MotionText>

          <ModalCloseButton color="white" size="md" mt={0.5} mr={1} onClick={handleClose} />
        </ModalHeader>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleClearSearch={handleClearSearch}
        />

        {/* Main content area */}
        <ModalBody
          p={0}
          overflowY="auto"
          flex="1"
          ref={scrollRef}
          sx={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              background: 'rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(140, 90, 220, 0.5)',
              borderRadius: '24px',
            },
          }}
          css={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(140, 90, 220, 0.5) rgba(0, 0, 0, 0.1)',
          }}
        >
          {renderContent()}
        </ModalBody>

        {/* Pagination info */}
        {!loading && leaderboardData.length > 0 && (
          <PaginationInfo pagination={pagination} />
        )}
      </ModalContent>
    </Modal>
  )
}

export default React.memo(QuickClashLeaderboardModal)
