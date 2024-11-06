export const parseTimeString = timeString => {
  if (!timeString) return null

  const matches = timeString.match(
    /(\d+)days\s+(\d+)hrs\s+(\d+)mins\s+(\d+)secs/,
  )
  if (!matches) return null

  const days = parseInt(matches[1])
  const hours = parseInt(matches[2])
  const minutes = parseInt(matches[3])
  const seconds = parseInt(matches[4])

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds:
      days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds,
  }
}
