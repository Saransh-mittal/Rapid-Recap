// src/utils/tournamentRewards.js
import { REWARD_TYPES } from '../components/rewards'
import axios from 'axios'
import { addReward } from '../redux/rewardsSlice'
import { setUser } from '../redux/authSlice'

const getRewardConfig = badge => {
  const configs = {
    RANK_1: {
      type: REWARD_TYPES.IQ_BOOST,
      tournamentReward: true,
      rank: 'RANK_1',
      title: 'Tournament Champion IQ Boost!',
      description:
        'Your legendary performance has greatly enhanced your Intelligence!',
      prevScore: 110,
      newScore: 120,
      order: 1,
    },
    RANK_2: {
      type: REWARD_TYPES.IQ_BOOST,
      tournamentReward: true,
      rank: 'RANK_2',
      title: 'Elite Performance IQ Boost!',
      description:
        'Your exceptional skills have significantly boosted your Intelligence!',
      prevScore: 110,
      newScore: 115,
      order: 2,
    },
    RANK_3: {
      type: REWARD_TYPES.IQ_BOOST,
      tournamentReward: true,
      rank: 'RANK_3',
      title: 'Rising Star IQ Boost!',
      description:
        'Your outstanding achievement has increased your Intelligence!',
      prevScore: 110.3,
      newScore: 112.8,
      order: 3,
    },
    ACE: {
      type: REWARD_TYPES.TOURNAMENT_ACE,
      title: 'LEGENDARY ACE',
      description: 'Champion of {category} Category!',
      rewards: [
        {
          icon: 'Shield',
          title: 'Category Insight Radar',
          description:
            'Preview article difficulties in {category} category (Mon-Fri).',
        },
        {
          icon: 'Zap',
          title: "Champion's RQM Amplifier",
          description:
            '1.5x RQM boost in {category} category quizzes (Mon-Fri).',
        },
      ],
      order: 4,
    },
    PRO: {
      type: REWARD_TYPES.TOURNAMENT_PRO,
      title: 'ELITE VIRTUOSO',
      description: 'Elite Excellence in {category} Category!',
      rewards: [
        {
          icon: 'Zap',
          title: 'Elite RQM Amplifier',
          description:
            '1.5x RQM boost in {category} category quizzes (Mon-Fri).',
        },
      ],
      order: 5,
    },
    CHAMP: {
      type: REWARD_TYPES.TOURNAMENT_CHAMP,
      title: 'RISING CHAMPION',
      description: 'Outstanding Achiever in {category} Category!',
      rewards: [
        {
          icon: 'Shield',
          title: 'Category Insight Radar',
          description:
            'Preview article difficulties in {category} category (Mon-Fri).',
        },
      ],
      order: 6,
    },
  }

  return configs[badge.badgeName]
}

const processReward = ({ reward, badge }) => {
  if (!reward) return null

  // Replace category placeholder in strings
  const replaceCategory = text => {
    return text.replace(/{category}/g, badge.text)
  }

  const processedReward = { ...reward, badge }
  processedReward.description = replaceCategory(processedReward.description)

  if (processedReward.rewards) {
    processedReward.rewards = processedReward.rewards.map(r => ({
      ...r,
      description: replaceCategory(r.description),
    }))
  }

  if (badge.text) {
    processedReward.category = badge.text
  }

  return processedReward
}

export const tournamentRewardsClaim = async ({ user, dispatch }) => {
  try {
    if (!user) return

    // get all the badges of the just previous tournament
    const tournamentBadges = user.unClaimedValidBadges

    if (tournamentBadges.length === 0) return

    // Sort badges by their reward priority
    const sortedBadges = tournamentBadges
      .map(badge => ({
        ...badge,
        rewardConfig: getRewardConfig(badge),
      }))
      .filter(badge => badge.rewardConfig)
      .sort((a, b) => a.rewardConfig.order - b.rewardConfig.order)

    // Process and dispatch rewards sequentially
    for (const badge of sortedBadges) {
      const processedReward = processReward({
        reward: badge.rewardConfig,
        badge,
      })

      if (processedReward) {
        dispatch(addReward(processedReward))
      }
    }
  } catch (error) {
    console.error('Error claiming tournament rewards:', error)
  }
}

export const handleTournamentRewardsClaim = async ({
  badge,
  dispatch,
  user,
}) => {
  try {
    const response = await axios.post('/api/user/claim-badge', {
      tournamentNumber: badge.tournamentNumber,
      badgeName: badge.badgeName,
    })
    dispatch(
      setUser({
        ...user,
        unClaimedValidBadges: user.unClaimedValidBadges.filter(
          b => b.badgeName !== badge.badgeName,
        ),
      }),
    )
    return response.data
  } catch (error) {
    console.error('Error claiming tournament rewards:', error)
  }
}
