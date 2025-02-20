// services/privilegeCache.js

const cache = require('memory-cache')
const User = require('../model/userSchema')
const moment = require('moment-timezone')
const { checkActiveAbilities } = require('./abilityService')
const {
  isCategoryBoost,
} = require('./abilityServices/tournamentAbilityService')

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Cache service for category privileges
 */
const privilegeCache = {
  /**
   * Generate cache key based on userId and optional category
   */
  getKey: (userId, category) => {
    if (!category) {
      return `privilege_${userId}_all`
    }
    return `privilege_${userId}_${category}`
  },

  /**
   * Get category privileges from cache or DB
   */
  async getPrivileges({ userId, category }) {
    const cacheKey = this.getKey(userId, category)
    let privileges = cache.get(cacheKey)

    if (!privileges) {
      privileges = await this.fetchPrivilegesFromDB({ userId, category })
      cache.put(cacheKey, privileges, CACHE_TTL)
    }

    return privileges
  },

  /**
   * Fetch privileges from database
   */
  async fetchPrivilegesFromDB({ userId, category }) {
    try {
      // Get user badges
      const user = await User.findById(userId).select('badges').lean()

      // Get active abilities
      const activeAbilities = await checkActiveAbilities({ userId })

      const now = moment().tz('Asia/Kolkata')

      // Filter active category boosts
      const activeCategoryBoosts = activeAbilities.filter(
        ability =>
          ability.name.includes('Boost') &&
          isCategoryBoost(ability.name) &&
          !ability.isBadgePowerUp &&
          (ability.expiresAt > new Date() || ability.expiresAt === null),
      )
      const activeCategoryRadar = activeAbilities.filter(
        ability =>
          ability.name.includes('Radar') &&
          !ability.isBadgePowerUp &&
          (ability.expiresAt > new Date() || ability.expiresAt === null),
      )

      // If no specific category provided, check all categories
      if (!category) {
        // Process badges
        const validBadges = (user?.badges || []).filter(
          badge =>
            badge.canBeClaimedUntil &&
            moment(badge.canBeClaimedUntil).isAfter(now) &&
            ['ACE', 'PRO', 'CHAMP'].includes(badge.badgeName),
        )

        // Initialize privileges by category
        const privilegesByCategory = {}

        // Add privileges from badges
        validBadges.forEach(badge => {
          if (!privilegesByCategory[badge.text]) {
            privilegesByCategory[badge.text] = {
              rqmBoost: false,
              radar: false,
            }
          }

          if (['ACE', 'PRO'].includes(badge.badgeName)) {
            privilegesByCategory[badge.text].rqmBoost = true
          }
          if (['ACE', 'CHAMP'].includes(badge.badgeName)) {
            privilegesByCategory[badge.text].radar = true
          }
        })

        // Add privileges from active category boosts
        activeCategoryBoosts.forEach(boost => {
          const boostCategory = boost.name.split(' ')[0]
          if (!privilegesByCategory[boostCategory]) {
            privilegesByCategory[boostCategory] = {
              rqmBoost: false,
              radar: false,
            }
          }
          privilegesByCategory[boostCategory].rqmBoost = true
        })
        activeCategoryRadar.forEach(radar => {
          const radarCategory = radar.name.split(' ')[0]
          if (!privilegesByCategory[radarCategory]) {
            privilegesByCategory[radarCategory] = {
              rqmBoost: false,
              radar: false,
            }
          }
          privilegesByCategory[radarCategory].radar = true
        })

        return {
          privilegesByCategory,
          hasAnyPrivilege:
            validBadges.length > 0 ||
            activeCategoryBoosts.length > 0 ||
            activeCategoryRadar.length > 0,
        }
      }

      // For specific category
      const validBadges = (user?.badges || []).filter(
        badge =>
          badge.canBeClaimedUntil &&
          moment(badge.canBeClaimedUntil).isAfter(now) &&
          ['ACE', 'PRO', 'CHAMP'].includes(badge.badgeName) &&
          badge.text === category,
      )

      // Check for active category boost for the specific category
      const hasCategoryBoost = activeCategoryBoosts.some(
        boost => boost.name.split(' ')[0] === category,
      )
      const hasCategoryRadar = activeCategoryRadar.some(
        radar => radar.name.split(' ')[0] === category,
      )

      return {
        rqmBoost:
          validBadges.some(badge => ['ACE', 'PRO'].includes(badge.badgeName)) ||
          hasCategoryBoost,
        radar:
          validBadges.some(badge =>
            ['ACE', 'CHAMP'].includes(badge.badgeName),
          ) || hasCategoryRadar,
      }
    } catch (error) {
      console.error('Error fetching privileges:', error)
      throw error
    }
  },

  /**
   * Check if user has privileges for a specific category
   */
  async hasPrivilegesForCategory({ userId, category, privileges }) {
    if (!privileges) {
      privileges = await this.getPrivileges({ userId, category: undefined })
    }

    return (
      privileges.privilegesByCategory &&
      privileges.privilegesByCategory[category] &&
      (privileges.privilegesByCategory[category].rqmBoost ||
        privileges.privilegesByCategory[category].radar)
    )
  },

  /**
   * Clear cache for a specific user and category
   */
  clearCache({ userId, category }) {
    const cacheKey = this.getKey(userId, category)
    cache.del(cacheKey)

    // If clearing a specific category, also clear the 'all' cache
    if (category) {
      cache.del(this.getKey(userId, undefined))
    }
  },
}

module.exports = privilegeCache
