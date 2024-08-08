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
