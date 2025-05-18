// components/quickClashComponents/team/TeamBattleList.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Flex,
  Divider,
  Center,
  Spinner,
  useToast,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, PlusCircle, Users, Trophy } from 'lucide-react'

// Custom components
import TeamBattleItem from './TeamBattleItem'
import EmptyBattlesState from './EmptyBattlesState'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

/**
 * Component to display a list of team battles
 */
const TeamBattleList = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const { getSocket } = useSocket()

  // State
  const [activeTab, setActiveTab] = useState('active')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Get team battle data from hook
  const {
    activeBattles,
    activeBattlesLoading,
    activeBattlesError,
    activeBattlesHasMore,

    completedBattles,
    completedBattlesLoading,
    completedBattlesError,
    completedBattlesHasMore,

    loadTeamBattles,
    loadMoreTeamBattles,
    goToBattle,
  } = useQuickClashTeamBattle()

  // Join teams socket room when component mounts
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.emit('quickClash:viewTeamBattles')
      console.log('Joined quickClash:teams room from TeamBattleList')
    }
  }, [getSocket])

  // Fetch active battles on mount
  useEffect(() => {
    loadTeamBattles('active')
  }, [loadTeamBattles])

  // Handle tab change
  const handleTabChange = useCallback(
    tab => {
      setActiveTab(tab)

      // Load data for the selected tab if not already loaded
      if (tab === 'active' && !activeBattles.length && !activeBattlesLoading) {
        loadTeamBattles('active')
      } else if (
        tab === 'completed' &&
        !completedBattles.length &&
        !completedBattlesLoading
      ) {
        loadTeamBattles('completed')
      }
    },
    [
      activeBattles.length,
      activeBattlesLoading,
      completedBattles.length,
      completedBattlesLoading,
      loadTeamBattles,
    ],
  )

  // Handle refreshing battle list
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    loadTeamBattles(activeTab).finally(() => {
      setRefreshing(false)
    })
  }, [activeTab, loadTeamBattles])

  // Handle loading more battles
  const handleLoadMore = useCallback(() => {
    loadMoreTeamBattles(activeTab)
  }, [activeTab, loadMoreTeamBattles])

  // Handle clicking Enter on a battle
  const handleEnterBattle = useCallback(
    battleId => {
      goToBattle(battleId)
    },
    [goToBattle],
  )

  // Get current battles based on active tab
  const currentBattles =
    activeTab === 'active' ? activeBattles : completedBattles
  const isCurrentLoading =
    (activeTab === 'active' ? activeBattlesLoading : completedBattlesLoading) ||
    loading
  const currentError =
    activeTab === 'active' ? activeBattlesError : completedBattlesError
  const hasMore =
    activeTab === 'active' ? activeBattlesHasMore : completedBattlesHasMore

  // Render loading state
  if (isCurrentLoading && currentBattles.length === 0) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.700"
            color="purple.500"
            size="xl"
          />
          <Text color="whiteAlpha.700">{t('Loading team battles...')}</Text>
        </VStack>
      </Center>
    )
  }

  // Render error state
  if (currentError && currentBattles.length === 0) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Icon as={RefreshCw} color="red.400" boxSize={10} />
          <Text color="red.400">{currentError}</Text>
          <Button
            leftIcon={<RefreshCw size={18} />}
            colorScheme="purple"
            onClick={handleRefresh}
          >
            {t('Try Again')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      width="100%"
    >
      {/* Header with tabs and actions */}
      <MotionFlex
        variants={itemVariants}
        justify="space-between"
        align="center"
        mb={4}
      >
        <HStack spacing={4}>
          <Button
            variant={activeTab === 'active' ? 'solid' : 'ghost'}
            colorScheme="purple"
            size="sm"
            onClick={() => handleTabChange('active')}
            leftIcon={<Icon as={Users} boxSize={4} />}
          >
            {t('Active Battles')}
          </Button>
          <Button
            variant={activeTab === 'completed' ? 'solid' : 'ghost'}
            colorScheme="purple"
            size="sm"
            onClick={() => handleTabChange('completed')}
            leftIcon={<Icon as={Trophy} boxSize={4} />}
          >
            {t('Completed')}
          </Button>
        </HStack>

        <HStack spacing={3}>
          <MotionButton
            leftIcon={<RefreshCw size={18} />}
            colorScheme="purple"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={refreshing}
            loadingText={t('Refreshing')}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            {t('Refresh')}
          </MotionButton>
        </HStack>
      </MotionFlex>

      {/* Team battle list */}
      {currentBattles.length === 0 ? (
        <EmptyBattlesState
          type={activeTab === 'active' ? 'active' : 'completed'}
          onCreateMatch={() => {
            // Navigate to teams tab where user can create/join team
            window.location.hash = 'teams'
          }}
        />
      ) : (
        <VStack spacing={4} align="stretch">
          {currentBattles.map((battle, index) => (
            <TeamBattleItem
              key={battle._id}
              battle={battle}
              index={index}
              onEnter={handleEnterBattle}
            />
          ))}

          {/* Load more button */}
          {hasMore && (
            <Center mt={4}>
              <Button
                onClick={handleLoadMore}
                colorScheme="purple"
                variant="outline"
                isLoading={isCurrentLoading && currentBattles.length > 0}
                loadingText={t('Loading more')}
              >
                {t('Load More')}
              </Button>
            </Center>
          )}
        </VStack>
      )}
    </MotionBox>
  )
}

export default TeamBattleList
