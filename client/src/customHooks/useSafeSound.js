/**
 * SSR-safe sound hook with robust error handling and performance optimization
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { isClient } from '../utils/environment'

const createAudioContext = () => {
  if (!isClient) return null
  try {
    return new (window.AudioContext || window.webkitAudioContext)()
  } catch (error) {
    console.warn('AudioContext not supported:', error)
    return null
  }
}

const useSafeSound = (options = {}) => {
  const {
    volume = 0.5,
    enabled = true,
    soundEnabled = true,
    onPlay,
    onEnd,
    onError,
  } = options

  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)

  const audioContextRef = useRef(null)
  const gainNodeRef = useRef(null)
  const sourceNodeRef = useRef(null)

  // Initialize audio context
  useEffect(() => {
    if (!isClient || !enabled || !soundEnabled) return

    const initAudio = () => {
      try {
        audioContextRef.current = createAudioContext()
        if (audioContextRef.current) {
          gainNodeRef.current = audioContextRef.current.createGain()
          gainNodeRef.current.connect(audioContextRef.current.destination)
          gainNodeRef.current.gain.value = volume
          setIsReady(true)
        }
      } catch (err) {
        console.error('Error initializing audio:', err)
        setError(err)
        onError?.(err)
      }
    }

    initAudio()

    return () => {
      try {
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close()
        }
      } catch (err) {
        console.warn('Error closing audio context:', err)
      }
    }
  }, [enabled, soundEnabled, volume, onError])

  // Play sound with frequency and duration
  const playSound = useCallback(
    (frequency, duration) => {
      if (!isReady || !audioContextRef.current || isPlaying) return

      try {
        const oscillator = audioContextRef.current.createOscillator()
        sourceNodeRef.current = oscillator

        oscillator.connect(gainNodeRef.current)
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContextRef.current.currentTime,
        )

        oscillator.start()
        setIsPlaying(true)
        onPlay?.()

        setTimeout(() => {
          oscillator.stop()
          setIsPlaying(false)
          onEnd?.()
        }, duration)
      } catch (err) {
        console.error('Error playing sound:', err)
        setError(err)
        onError?.(err)
      }
    },
    [isReady, isPlaying, onPlay, onEnd, onError],
  )

  // Play click sound
  const playClick = useCallback(() => {
    if (!isReady) return
    playSound(800, 100)
  }, [isReady, playSound])

  // Play success sound
  const playSuccess = useCallback(() => {
    if (!isReady) return

    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playSound(freq, 150)
      }, index * 200)
    })
  }, [isReady, playSound])

  // Play warning sound
  const playWarning = useCallback(() => {
    if (!isReady) return
    playSound(440, 300) // A4 note
  }, [isReady, playSound])

  // Play error sound
  const playError = useCallback(() => {
    if (!isReady) return
    playSound(220, 400) // A3 note
  }, [isReady, playSound])

  // Play notification sound
  const playNotification = useCallback(() => {
    if (!isReady) return

    const frequencies = [880, 0, 880] // A5 note with pause
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        if (freq > 0) playSound(freq, 100)
      }, index * 150)
    })
  }, [isReady, playSound])

  return {
    isReady,
    isPlaying,
    error,
    playClick,
    playSuccess,
    playWarning,
    playError,
    playNotification,
    playSound,
  }
}

export default useSafeSound
