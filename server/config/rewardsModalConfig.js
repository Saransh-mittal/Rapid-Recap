// src/constants/rewardsModalConfig.js

// Get next Sunday's date
const getNextSunday = () => {
  const today = new Date()
  const nextSunday = new Date()
  nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7))
  nextSunday.setHours(23, 59, 59, 999)
  return nextSunday
}

const REWARDS_MODAL_CONFIG = {
  EXPIRY_DATE: getNextSunday(),
  FEATURE_START_DATE: new Date('2025-01-16'), // Current date from your system
}

module.exports = { REWARDS_MODAL_CONFIG }
