// src/components/rewards/RewardTester.jsx
import React from 'react'
import { Button, VStack, HStack, Text } from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { addReward } from '../../redux/rewardsSlice'
import { REWARD_TYPES } from './constants/rewardTypes'

export const RewardTester = () => {
  const dispatch = useDispatch()

  const showRQMBoost = () => {
    dispatch(
      addReward({
        type: REWARD_TYPES.RQM_BOOST,
        title: 'RQM Boost Unlocked!',
        description:
          'Your dedication earned you a bonus! Next quiz score will be multiplied by 1.5x.',
        multiplier: 1.5,
        duration: 3600, // 1 hour in seconds
      }),
    )
  }

  const showIQBoost = () => {
    dispatch(
      addReward({
        type: REWARD_TYPES.IQ_BOOST,
        title: 'IQ Score Boost!',
        description:
          'Your knowledge is expanding! Your IQ score has increased.',
        prevScore: 105,
        newScore: 110,
      }),
    )
  }

  const showStreakSurge = () => {
    dispatch(
      addReward({
        type: REWARD_TYPES.STREAK_SURGE,
        title: '7-Day Streak!',
        description: 'A Week of Excellence',
        rewards: [
          {
            title: 'Bonus XP',
            amount: '20 XP',
            color: '#FDB813',
          },
          {
            title: 'RQM Boost',
            amount: '1.5x Multiplier',
            color: '#818CF8',
          },
        ],
      }),
    )
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Text fontSize="xl" fontWeight="bold">
        Reward System Tester
      </Text>

      <HStack spacing={4}>
        <Button colorScheme="purple" onClick={showRQMBoost}>
          Show RQM Boost
        </Button>

        <Button colorScheme="blue" onClick={showIQBoost}>
          Show IQ Boost
        </Button>
        <Button colorScheme="yellow" onClick={showStreakSurge}>
          Show Streak Surge
        </Button>
      </HStack>
    </VStack>
  )
}
