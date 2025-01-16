// src/utils/tournamentRewards.js
import { REWARD_TYPES } from '../components/rewards'
import axios from 'axios'
import { addReward } from '../redux/rewardsSlice'
import { setUser } from '../redux/authSlice'

const getRewardConfig = (badge, t) => {
  const configs = {
    RANK_1: {
      type: REWARD_TYPES.IQ_BOOST,
      tournamentReward: true,
      rank: 'RANK_1',
      title: t('tournamentRewards.ranks.RANK_1.title'),
      description: t('tournamentRewards.ranks.RANK_1.description'),
      order: 1,
    },
    RANK_2: {
      type: REWARD_TYPES.IQ_BOOST,
      tournamentReward: true,
      rank: 'RANK_2',
      title: t('tournamentRewards.ranks.RANK_2.title'),
      description: t('tournamentRewards.ranks.RANK_2.description'),
      order: 2,
    },
    RANK_3: {
      type: REWARD_TYPES.IQ_BOOST,
      tournamentReward: true,
      rank: 'RANK_3',
      title: t('tournamentRewards.ranks.RANK_3.title'),
      description: t('tournamentRewards.ranks.RANK_3.description'),
      order: 3,
    },
    ACE: {
      type: REWARD_TYPES.TOURNAMENT_ACE,
      title: t('tournamentRewards.badges.ACE.title'),
      description: t('tournamentRewards.badges.ACE.description'),
      rewards: [
        {
          icon: 'Shield',
          title: t('tournamentRewards.badges.ACE.rewards.insightRadar.title'),
          description: t(
            'tournamentRewards.badges.ACE.rewards.insightRadar.description',
          ),
        },
        {
          icon: 'Zap',
          title: t('tournamentRewards.badges.ACE.rewards.rqmAmplifier.title'),
          description: t(
            'tournamentRewards.badges.ACE.rewards.rqmAmplifier.description',
          ),
        },
      ],
      order: 4,
    },
    PRO: {
      type: REWARD_TYPES.TOURNAMENT_PRO,
      title: t('tournamentRewards.badges.PRO.title'),
      description: t('tournamentRewards.badges.PRO.description'),
      rewards: [
        {
          icon: 'Zap',
          title: t('tournamentRewards.badges.PRO.rewards.rqmAmplifier.title'),
          description: t(
            'tournamentRewards.badges.PRO.rewards.rqmAmplifier.description',
          ),
        },
      ],
      order: 5,
    },
    CHAMP: {
      type: REWARD_TYPES.TOURNAMENT_CHAMP,
      title: t('tournamentRewards.badges.CHAMP.title'),
      description: t('tournamentRewards.badges.CHAMP.description'),
      rewards: [
        {
          icon: 'Shield',
          title: t('tournamentRewards.badges.CHAMP.rewards.insightRadar.title'),
          description: t(
            'tournamentRewards.badges.CHAMP.rewards.insightRadar.description',
          ),
        },
      ],
      order: 6,
    },
  }

  return configs[badge.badgeName]
}

const processReward = ({ reward, badge, user, t }) => {
  if (!reward) return null

  // Replace category placeholder in strings
  const replaceCategory = text => {
    return text.replace(
      /{category}/g,
      t(`categorySelector.categories.${badge.text.toLocaleLowerCase()}`),
    )
  }

  const processedReward = { ...reward, badge }

  // Handle IQ boost rewards (RANK_1, RANK_2, RANK_3)
  if (reward.type === REWARD_TYPES.IQ_BOOST && user?.tournamentIQBoosts) {
    // Find matching IQ boost data for this tournament
    const iqBoostData = user.tournamentIQBoosts.find(
      boost =>
        boost.tournamentNumber === badge.tournamentNumber &&
        getRankString(boost.rank) === badge.badgeName,
    )

    if (iqBoostData) {
      processedReward.prevScore = iqBoostData.prevIQ
      processedReward.newScore = iqBoostData.boostedIQ
    }
  }

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

// Helper function to convert numeric rank to string rank
const getRankString = rank => {
  switch (rank) {
    case 1:
      return 'RANK_1'
    case 2:
      return 'RANK_2'
    case 3:
      return 'RANK_3'
    default:
      return null
  }
}

export const tournamentRewardsClaim = async ({ user, dispatch, t }) => {
  try {
    if (!user) return

    // get all the badges of the just previous tournament
    const tournamentBadges = user.unClaimedValidBadges

    if (tournamentBadges.length === 0) return

    // Sort badges by their reward priority
    const sortedBadges = tournamentBadges
      .map(badge => ({
        ...badge,
        rewardConfig: getRewardConfig(badge, t),
      }))
      .filter(badge => badge.rewardConfig)
      .sort((a, b) => a.rewardConfig.order - b.rewardConfig.order)

    // Process and dispatch rewards sequentially
    for (const badge of sortedBadges) {
      const processedReward = processReward({
        reward: badge.rewardConfig,
        badge,
        user,
        t,
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
