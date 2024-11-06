import { useState, useEffect } from 'react'
import { parseTimeString } from '../utils/time.utils'
import { setTournamentStartTime } from '../redux/tournamentSlice'
import { useDispatch } from 'react-redux'

const useCountdown = ({ timeString }) => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const dispatch = useDispatch()
  useEffect(() => {
    const parsedTime = parseTimeString(timeString)
    if (!parsedTime) return

    // Initialize with parsed values immediately
    setCountdown({
      days: parsedTime.days,
      hours: parsedTime.hours,
      minutes: parsedTime.minutes,
      seconds: parsedTime.seconds,
    })

    let timeLeft = parsedTime.totalSeconds

    const timer = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(timer)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      timeLeft -= 1

      const days = Math.floor(timeLeft / (24 * 60 * 60))
      const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
      const seconds = timeLeft % 60
      const daysHours = `${days}days ${hours}hrs ${minutes}mins ${seconds}secs`
      dispatch(setTournamentStartTime(daysHours))
      setCountdown({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeString])

  return countdown
}

export default useCountdown
