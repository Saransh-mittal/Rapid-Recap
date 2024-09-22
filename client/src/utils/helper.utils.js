import CircleAndSocietyData from '../assets/CircleAndSocietyData'
import axios from 'axios'
import i18n from 'i18next'

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

export const changeLanguage = async (lng, setLoading, setCurrentLanguage) => {
  try {
    setLoading && setLoading(true) // Start loading
    await i18n.changeLanguage(lng)
    setCurrentLanguage && setCurrentLanguage(lng) // Update the local state

    // Send request to the server to update user language
    await axios.post('/api/user/language', { language: lng })

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
    console.log('Feedback submitted successfully!')
  } catch (error) {
    console.error('Error submitting feedback:', error)
  }
}
