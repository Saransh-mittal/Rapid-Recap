import CircleAndSocietyData from '../assets/CircleAndSocietyData'

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

export function formatDate(datetime) {
  // Extract the date part
  const datePattern = /^\d{4}-\d{2}-\d{2}/
  const match = datetime.match(datePattern)
  if (!match) return null

  // Parse the extracted date part
  const [year, month, day] = match[0].split('-')

  // Define month abbreviations
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Format the date into 'dd mmm yyyy'
  const formattedDate = `${day} ${months[parseInt(month, 10) - 1]} ${year}`
  return formattedDate
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
