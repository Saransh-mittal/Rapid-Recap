import React, { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addNoteMessage } from '../../redux/appSlice'
import { setUser } from '../../redux/authSlice'
import { useTranslation } from 'react-i18next'

const TrackTime = ({ userId, articleId }) => {
  const dispatch = useDispatch()
  const startTimeRef = useRef(Date.now())
  const accumulatedTimeRef = useRef(0)
  const lastSentTimeRef = useRef(0)
  const isTrackingRef = useRef(true)
  const sendingPromiseRef = useRef(null)
  const lastXpAwardTimeRef = useRef(0)
  const { user } = useSelector(state => state.auth)
  const { t } = useTranslation('TrackTime')

  const getInactiveTime = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) return 3 * 60 * 1000
    if (window.matchMedia('(min-width: 768px)').matches) return 2 * 60 * 1000
    return 60 * 1000
  }, [])

  const sendTimeSpent = useCallback(
    async (forceSend = false) => {
      const now = Date.now()
      const timeSpent = now - startTimeRef.current
      accumulatedTimeRef.current += timeSpent

      // Only send if we've accumulated at least 5 seconds or force sending
      if (forceSend || accumulatedTimeRef.current >= 5000) {
        // If there's an ongoing send, wait for it to complete
        if (sendingPromiseRef.current) {
          await sendingPromiseRef.current
        }

        const payload = {
          userId,
          articleId,
          timeSpent: accumulatedTimeRef.current,
          timestamp: now,
        }

        sendingPromiseRef.current = await fetch('/api/timeSpent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        })

        try {
          const response = sendingPromiseRef.current

          const jsonData = await response.json()
          if (response.ok) {
            const XP_AWARD_COOLDOWN = 60 * 60 * 1000 // 1 hour in milliseconds
            if (
              jsonData.xpAwardedForTimeSpentMoreThan10Min &&
              now - lastXpAwardTimeRef.current > XP_AWARD_COOLDOWN
            ) {
              dispatch(setUser({ ...user, xp: user.xp + 10 }))
              dispatch(
                addNoteMessage({
                  messageType: 'xpAward',
                  xpAwarded: 10,
                  title: t(
                    'XP Awarded For Reading Articles More Than 10 Minutes',
                  ),
                  actions: [{ actionType: 'VIEW_EXPERIENCE' }],
                  duration: 15000,
                  width: '300px',
                  xpSource: t('10 Min Article Read'),
                }),
              )
              lastXpAwardTimeRef.current = now
            }
            lastSentTimeRef.current = now
            accumulatedTimeRef.current = 0
            startTimeRef.current = now
          } else {
            console.error('Failed to send time spent:', await response.text())
          }
        } catch (error) {
          console.error('Error sending time spent:', error)
        } finally {
          sendingPromiseRef.current = null
        }
      } else {
        startTimeRef.current = now
      }
    },
    [userId, articleId, dispatch, user],
  )

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      isTrackingRef.current = false
      sendTimeSpent(true)
    } else {
      isTrackingRef.current = true
      startTimeRef.current = Date.now()
    }
  }, [sendTimeSpent])

  const handleUnload = useCallback(() => {
    sendTimeSpent(true)
  }, [sendTimeSpent])

  useEffect(() => {
    const inactiveTime = getInactiveTime()
    let inactivityTimeout

    const resetInactivityTimeout = () => {
      clearTimeout(inactivityTimeout)
      inactivityTimeout = setTimeout(() => {
        isTrackingRef.current = false
        sendTimeSpent(true)
      }, inactiveTime)
    }

    const activityEvents = [
      'mousemove',
      'keydown',
      'scroll',
      'click',
      'touchstart',
    ]
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimeout, { passive: true })
    })

    const intervalId = setInterval(() => {
      if (isTrackingRef.current) {
        sendTimeSpent()
      }
    }, 30000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleUnload)

    resetInactivityTimeout()

    return () => {
      clearInterval(intervalId)
      clearTimeout(inactivityTimeout)
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimeout)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleUnload)
      sendTimeSpent(true)
    }
  }, [getInactiveTime, handleVisibilityChange, handleUnload, sendTimeSpent])

  return null
}

export default React.memo(TrackTime)
