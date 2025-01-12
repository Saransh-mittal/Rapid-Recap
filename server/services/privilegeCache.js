// services/privilegeCache.js

const cache = require('memory-cache')
const User = require('../model/userSchema')
const moment = require('moment-timezone')

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
    const user = await User.findById(userId).select('badges').lean()

    if (!user?.badges) {
      return { rqmBoost: false, radar: false }
    }

    const now = moment().tz('Asia/Kolkata')

    // If no specific category, check all categories
    if (!category) {
      const validBadges = user.badges.filter(
        badge =>
          badge.canBeClaimedUntil &&
          moment(badge.canBeClaimedUntil).isAfter(now) &&
          ['ACE', 'PRO', 'CHAMP'].includes(badge.badgeName),
      )

      // Group badges by category
      const privilegesByCategory = {}
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

      return {
        privilegesByCategory,
        hasAnyPrivilege: validBadges.length > 0,
      }
    }

    // For specific category
    const validBadges = user.badges.filter(
      badge =>
        badge.canBeClaimedUntil &&
        moment(badge.canBeClaimedUntil).isAfter(now) &&
        ['ACE', 'PRO', 'CHAMP'].includes(badge.badgeName) &&
        badge.text === category,
    )

    return {
      rqmBoost: validBadges.some(badge =>
        ['ACE', 'PRO'].includes(badge.badgeName),
      ),
      radar: validBadges.some(badge =>
        ['ACE', 'CHAMP'].includes(badge.badgeName),
      ),
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
