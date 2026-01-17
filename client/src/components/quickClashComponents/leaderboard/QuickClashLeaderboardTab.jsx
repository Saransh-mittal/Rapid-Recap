// components/quickClashComponents/leaderboard/QuickClashLeaderboardTab.jsx
// Inline leaderboard component for the bottom navigation tab
// Non-modal version of QuickClashLeaderboardModal

import React, { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trophy, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useInView } from 'react-intersection-observer'
import { notificationManager } from '../../../utils/notifications'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

// Import custom components
import LeaderboardCard from './components/LeaderboardCard'
import LeaderboardPodium from './components/LeaderboardPodium'
import SearchBar from './components/SearchBar'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'
import EmptyState from './components/EmptyState'
import PaginationInfo from './components/PaginationInfo'

const QuickClashLeaderboardTab = () => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const currentUserId = user?._id

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '200px',
  })

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
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, searchDebounce])

  // Fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard(1, true)
  }, [fetchLeaderboard])

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

  // Trigger load more when sentinel is in view
  useEffect(() => {
    if (inView && pagination.hasMore && !loading && !nextPageLoading && !backgroundFetching) {
      handleLoadMore()
    }
  }, [inView, pagination.hasMore, loading, nextPageLoading, backgroundFetching, handleLoadMore])

  // Handle search clear
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchDebounce('')
  }, [])

  // Handle view profile
  const handleViewProfile = useCallback(
    userId => {
      quizAudioService.playButtonClick()
      navigate(`/quickclash/profile/${userId}`)
    },
    [navigate],
  )

  // Handle retry on error
  const handleRetry = useCallback(() => {
    fetchLeaderboard(1, true)
  }, [fetchLeaderboard])

  // Prepare data for display
  const isSearching = searchQuery !== ''

  // Logic:
  // If searching: Show all in list
  // If NOT searching: Show top 3 in podium, rest in list.
  // BUT we need to ensure the top 3 are actually rank 1,2,3. If page 1 starts at rank 21 (impossible normally), we shouldn't show podium.

  const showPodium = !isSearching && leaderboardData.length > 0 && leaderboardData[0].rank === 1

  const listUsers = showPodium
    ? leaderboardData.filter(u => u.rank > 3)
    : leaderboardData

  const podiumUsers = showPodium
    ? leaderboardData.filter(u => u.rank <= 3)
    : []

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
      <div className="px-3 pb-6 pt-2">
        <AnimatePresence>
          {/* PODIUM SECTION */}
          {showPodium && (
            <LeaderboardPodium
              topUsers={podiumUsers}
              currentUserId={currentUserId}
              onViewProfile={handleViewProfile}
            />
          )}

          {/* LIST SECTION */}
          <div className="space-y-1">
            {listUsers.map(user => (
              <LeaderboardCard
                key={user._id}
                user={user}
                currentUserId={currentUserId}
                rank={user.rank}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>

          {/* Next page loading indicator / Sentinel */}
          {(nextPageLoading || pagination.hasMore) && (
            <div ref={loadMoreRef} className="flex justify-center py-6 min-h-[50px]">
              {nextPageLoading && <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />}
            </div>
          )}

          {/* End message */}
          {!pagination.hasMore && leaderboardData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 mb-2"
            >
              <div className="h-px w-full bg-white/5 mb-3" />
              <p className="text-center text-white/30 text-[10px] uppercase tracking-widest font-medium">
                {t('End of leaderboard')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Page Header (Search + Title) - Sticky or Scrollable? User asked to remove V2 Header.
          Let's make this part simple and part of the flow. */}

      {/* Title Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            {t('Leaderboard')}
          </h2>
        </div>
        <p className="text-xs text-white/50 pl-1">
          {t('Compete with players worldwide')}
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleClearSearch={handleClearSearch}
      />

      {/* Content */}
      {renderContent()}

      {/* Pagination Info Badge (Floating or fixed at bottom of list) */}
      {!loading && leaderboardData.length > 0 && (
         <div className="px-4 pb-4">
           <PaginationInfo pagination={pagination} />
         </div>
      )}
    </div>
  )
}

export default memo(QuickClashLeaderboardTab)
