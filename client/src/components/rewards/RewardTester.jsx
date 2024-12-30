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
        type: REWARD_TYPES.QUIN_BOOST,
        title: 'RQM Boost Unlocked!',
        description:
          'Your dedication earned you a bonus! Next quiz score will be multiplied by 1.5x.',
        multiplier: 1.5,
        duration: 3600, // 1 hour in seconds
      }),
    )
  }

  const showIQBoost = () => {
    // dispatch(
    //   addReward({
    //     type: REWARD_TYPES.IQ_BOOST,
    //     title: 'IQ Score Boost!',
    //     description:
    //       'Your knowledge is expanding! Your IQ score has increased.',
    //     prevScore: 105,
    //     newScore: 110,
    //   }),
    // )
    dispatch(
      addReward({
        type: REWARD_TYPES.IQ_BOOST,
        tournamentReward: true,
        rank: 'RANK_1',
        title: 'Tournament Champion IQ Boost!',
        description:
          'Your legendary performance has greatly enhanced your Intelligence!',
        prevScore: 110,
        newScore: 120,
      }),
    )
    // dispatch(
    //   addReward({
    //     type: REWARD_TYPES.IQ_BOOST,
    //     tournamentReward: true,
    //     rank: 'RANK_2',
    //     title: 'Elite Performance IQ Boost!',
    //     description:
    //       'Your exceptional skills have significantly boosted your Intelligence!',
    //     prevScore: 110,
    //     newScore: 115,
    //   }),
    // )
    // dispatch(
    //   addReward({
    //     type: REWARD_TYPES.IQ_BOOST,
    //     tournamentReward: true,
    //     rank: 'RANK_3',
    //     title: 'Rising Star IQ Boost!',
    //     description:
    //       'Your outstanding achievement has increased your Intelligence!',
    //     prevScore: 110.3,
    //     newScore: 112.8,
    //   }),
    // )
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

  const showTournamentWinner = () => {
    // For ACE PLAYER (1st Rank)
    dispatch(
      addReward({
        type: REWARD_TYPES.TOURNAMENT_ACE,
        title: 'LEGENDARY ACE',
        description: 'Champion of {{category}} Category!',
        category: '{{category}}',
        rewards: [
          {
            icon: 'Shield',
            title: 'Category Insight Radar',
            description:
              'Preview article difficulties in {{category}} category (Mon-Fri).',
          },
          {
            icon: 'Zap',
            title: "Champion's RQM Amplifier",
            description:
              '1.5x RQM boost in {{category}} category quizzes (Mon-Fri).',
          },
        ],
      }),
    )

    // // For PRO PLAYER (2nd Rank)
    // dispatch(
    //   addReward({
    //     type: REWARD_TYPES.TOURNAMENT_PRO,
    //     title: 'ELITE VIRTUOSO',
    //     description: 'Elite Excellence in {{category}} Category!',
    //     category: '{{category}}',
    //     rewards: [
    //       {
    //         icon: 'Zap',
    //         title: 'Elite RQM Amplifier',
    //         description: '1.5x RQM boost in {{category}} category quizzes (Mon-Fri).',
    //       },
    //     ],
    //   }),
    // )

    // // For CHAMP PLAYER (3rd Rank)
    // dispatch(
    //   addReward({
    //     type: REWARD_TYPES.TOURNAMENT_CHAMP,
    //     title: 'RISING CHAMPION',
    //     description: 'Outstanding Achiever in {{category}} Category!',
    //     category: '{{category}}',
    //     rewards: [
    //       {
    //         icon: 'Shield',
    //         title: 'Category Insight Radar',
    //         description:
    //           'Preview article difficulties in {{category}} category (Mon-Fri).',
    //       },
    //     ],
    //   }),
    // )
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Text fontSize="xl" fontWeight="bold">
        Reward System Tester
      </Text>

      <HStack spacing={4}>
        {/* <Button colorScheme="purple" onClick={showRQMBoost}>
          Show RQM Boost
        </Button> */}

        <Button colorScheme="blue" onClick={showIQBoost}>
          Show IQ Boost
        </Button>
        <Button colorScheme="blue" onClick={showTournamentWinner}>
          Tournament Winner
        </Button>
        {/* <Button colorScheme="yellow" onClick={showStreakSurge}>
          Show Streak Surge
        </Button> */}
      </HStack>
    </VStack>
  )
}
