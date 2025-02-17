import CircleAndSocietyData from '../assets/CircleAndSocietyData'
import axios from 'axios'
import i18n from 'i18next'
import { isClient } from './environment'

export const findSocietyAndCircle = IQ => {
  for (let i = 0; i < CircleAndSocietyData.length; i++) {
    const { IQ_Lower, IQ_Upper } = CircleAndSocietyData[i]
    if (IQ >= IQ_Lower && (IQ_Upper === null || IQ < IQ_Upper)) {
      return CircleAndSocietyData[i]
    }
  }
  return null
}

export const safelyAccessProperty = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

export const parseURL = url => {
  const urlObj = new URL(url)
  return urlObj.pathname.split('/').filter(Boolean)
}

export const getCategory = () => {
  if (!isClient) return null
  const segments = parseURL(window.location.href)
  const homeIndex = segments.indexOf('home')
  if (homeIndex !== -1 && homeIndex < segments.length - 1) {
    return segments[homeIndex + 1]
  }
  return null
}

export const getArticleId = () => {
  const segments = parseURL(window.location.href)
  const articleIndex = segments.indexOf('article')
  if (articleIndex !== -1 && articleIndex < segments.length - 1) {
    return segments[articleIndex + 1]
  }
  return null
}

export function formatDate(datetime, lang) {
  if (!datetime) return null // Handle cases where datetime is undefined or null

  // Parse the date string and return a Date object
  const date = new Date(datetime)
  if (isNaN(date)) return null // Handle invalid dates

  // Format the date based on the locale ('en' for English, 'hi' for Hindi)
  const locale = lang === 'hi' ? 'hi-IN' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatRemainingTime = milliseconds => {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000))
  const hours = Math.floor(
    (milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
  )
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))

  let timeString = ''
  if (days > 0) timeString += `${days} day `
  if (hours > 0) timeString += `${hours} hrs `
  if (minutes > 0) timeString += `${minutes} min`

  return timeString.trim()
}

export const formatSoundType = type => {
  return type.replace(/([A-Z])/g, ' $1').trim()
}

export const changeLanguage = async (
  lng,
  setLoading,
  setCurrentLanguage,
  changeUserFrontendLanguage,
) => {
  try {
    setLoading && setLoading(true) // Start loading
    await i18n.changeLanguage(lng)
    setCurrentLanguage && setCurrentLanguage(lng) // Update the local state

    // Send request to the server to update user language
    await axios.post('/api/user/language', { language: lng })
    changeUserFrontendLanguage(lng) // Update the Redux store
    setLoading && setLoading(false) // End loading
  } catch (error) {
    console.error('Error changing language:', error)
  }
}

export const formatLocalDateTime = dateString => {
  const date = new Date(dateString)
  return date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export const handleSubmitFeedback = async (rating, feedback, storyId) => {
  try {
    if (storyId === null) {
      console.error('Story ID is missing!')
      return
    }
    await axios.post('/api/contact/feedback/story', {
      storyId,
      rating,
      message: feedback,
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
  }
}

export const handleQuizFeedback = async (rating, feedback, quizId) => {
  try {
    if (quizId === null) {
      console.error('Quiz ID is missing!')
      return
    }
    await axios.post('/api/contact/feedback/quiz', {
      quizId,
      rating,
      message: feedback,
    })
  } catch (error) {
    console.error('Error submitting quiz feedback:', error)
  }
}

export const handleTournamentFeedback = async (
  rating,
  feedback,
  tournamentId,
) => {
  try {
    if (tournamentId === null) {
      console.error('Tournament ID is missing!')
      return
    }
    await axios.post('/api/contact/feedback/tournament', {
      tournamentId,
      rating,
      message: feedback,
    })
  } catch (error) {
    console.error('Error submitting tournament feedback:', error)
  }
}

// Helper function to format number with one decimal place
export const formatNumber = num => {
  return Number(num).toFixed(1)
}

export const isCategoryBoost = abilityName => {
  return (
    abilityName.endsWith('Boost') &&
    !['QuinBoost', 'QuizBoost'].includes(abilityName)
  )
}

// Helper function to extract category from ability name
export const getCategoryFromBoost = abilityName => {
  return abilityName.replace(' Boost', '')
}

export const calculateTotalEffect = (activeAbilities, type = 'BOOST') => {
  const effects = {
    multiplier: 1,
  }

  if (!Array.isArray(activeAbilities)) {
    return effects
  }

  const typeAbilities = activeAbilities.filter(ability => ability.type === type)

  if (typeAbilities.length > 0) {
    // Find the highest multiplier from active abilities
    const baseBoost = Math.max(
      ...typeAbilities.map(ability => ability.multiplier || 1),
    )

    // Add 0.25x for each additional boost after the first
    const additionalBoosts = (typeAbilities.length - 1) * 0.25

    // Calculate total and cap at 2x
    effects.multiplier = Math.min(baseBoost + additionalBoosts, 2)
  }

  return effects
}
