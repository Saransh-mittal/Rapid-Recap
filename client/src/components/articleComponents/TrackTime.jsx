import React, { useEffect, useState, useRef, useCallback } from 'react'

const TrackTime = ({ userId, articleId }) => {
  const [startTime, setStartTime] = useState(Date.now())
  const [isTracking, setIsTracking] = useState(true)
  const timeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  const getInactiveTime = useCallback(() => {
    return window.matchMedia('(min-width: 1024px)').matches
      ? 3 * 60 * 1000 // 3 mins for large screens
      : window.matchMedia('(min-width: 768px)').matches
      ? 2 * 60 * 1000 // 2 mins for medium screens
      : 60 * 1000 // 1 min for small screens
  }, [])

  const handleUnload = useCallback(() => {
    const endTime = Date.now()
    const timeSpent = endTime - startTime

    const payload = JSON.stringify({
      userId,
      articleId,
      timeSpent,
    })

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/timeSpent', payload)
    } else {
      fetch('/api/timeSpent', {
        method: 'POST',
        body: payload,
        keepalive: true,
      })
    }
  }, [userId, articleId, startTime])

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      handleUnload()
      setIsTracking(false)
    } else {
      setStartTime(Date.now())
      setIsTracking(true)
      resetTimer()
    }
  }, [handleUnload])

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isTracking) {
      timeoutRef.current = setTimeout(() => {
        handleUnload()
        setIsTracking(false)
      }, getInactiveTime())
    }
  }, [isTracking, handleUnload, getInactiveTime])

  const handleUserActivity = useCallback(() => {
    const now = Date.now()
    if (now - lastActivityRef.current > 1000) {
      lastActivityRef.current = now
      if (!isTracking) {
        setStartTime(now)
        setIsTracking(true)
      }
      resetTimer()
    }
  }, [isTracking, resetTimer])

  useEffect(() => {
    const events = [
      'touchstart',
      'touchmove',
      'scroll',
      'mousemove',
      'mousedown',
      'keypress',
    ]

    events.forEach(event =>
      window.addEventListener(event, handleUserActivity, { passive: true }),
    )

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleUnload)
    window.addEventListener('pagehide', handleUnload)

    resetTimer()

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, handleUserActivity),
      )

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleUnload)
      window.removeEventListener('pagehide', handleUnload)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      handleUnload()
    }
  }, [handleUserActivity, handleVisibilityChange, handleUnload, resetTimer])

  return null
}

export default React.memo(TrackTime)
