// client/src/services/analyticsService.js
// API service for Quick Clash Validation Analytics Dashboard

import axios from 'axios'

const API_BASE = '/api/admin/analytics'

/**
 * Get analytics overview with all KPIs
 * @param {number} days - Number of days for the date range
 * @returns {Promise<Object>} Overview data
 */
export const getAnalyticsOverview = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/overview`, {
    params: { days },
  })
  return response.data
}

/**
 * Get footfall and traffic metrics
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Footfall data
 */
export const getFootfallMetrics = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/footfall`, {
    params: { days },
  })
  return response.data
}

/**
 * Get bounce rate metrics
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Bounce rate data
 */
export const getBounceRates = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/bounce`, {
    params: { days },
  })
  return response.data
}

/**
 * Get retention metrics
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Retention data
 */
export const getRetentionMetrics = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/retention`, {
    params: { days },
  })
  return response.data
}

/**
 * Get engagement metrics
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Engagement data
 */
export const getEngagementMetrics = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/engagement`, {
    params: { days },
  })
  return response.data
}

/**
 * Get streak metrics
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Streak data
 */
export const getStreakMetrics = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/streaks`, {
    params: { days },
  })
  return response.data
}

/**
 * Get viral K-coefficient
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Viral data
 */
export const getViralCoefficient = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/viral`, {
    params: { days },
  })
  return response.data
}

/**
 * Get viral trend over time
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Trend data
 */
export const getViralTrend = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/viral/trend`, {
    params: { days },
  })
  return response.data
}

/**
 * Get conversion metrics
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Conversion data
 */
export const getConversionMetrics = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/conversion`, {
    params: { days },
  })
  return response.data
}

/**
 * Get validation verdict
 * @param {number} days - Number of days
 * @returns {Promise<Object>} Verdict data
 */
export const getValidationVerdict = async (days = 30) => {
  const response = await axios.get(`${API_BASE}/verdict`, {
    params: { days },
  })
  return response.data
}

/**
 * Get access list
 * @returns {Promise<Object>} Access list
 */
export const getAccessList = async () => {
  const response = await axios.get(`${API_BASE}/access`)
  return response.data
}

/**
 * Grant analytics access
 * @param {Object} params - { userId, accessLevel, notes }
 * @returns {Promise<Object>} Result
 */
export const grantAccess = async ({ userId, accessLevel = 'viewer', notes = '' }) => {
  const response = await axios.post(`${API_BASE}/access/grant`, {
    userId,
    accessLevel,
    notes,
  })
  return response.data
}

/**
 * Revoke analytics access
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
export const revokeAccess = async (userId) => {
  const response = await axios.delete(`${API_BASE}/access/${userId}`)
  return response.data
}

export default {
  getAnalyticsOverview,
  getFootfallMetrics,
  getBounceRates,
  getRetentionMetrics,
  getEngagementMetrics,
  getStreakMetrics,
  getViralCoefficient,
  getViralTrend,
  getConversionMetrics,
  getValidationVerdict,
  getAccessList,
  grantAccess,
  revokeAccess,
}
