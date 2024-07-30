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
