import { useCallback, useEffect, useRef, useState } from 'react'
import { useSound as useCustomSound } from 'use-sound'
import { SOUND_FILES, SOUND_TYPES } from '../models/soundSettings'
import { useSelector } from 'react-redux'
import { isClient } from '../utils/environment'

let sharedAudioContext

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
  const { soundSettings } = useSelector(state => state.app)

  const audioContextRef = useRef(null)
  const gainNodeRef = useRef(null)
  const sourceNodeRef = useRef(null)

  // Use the use-sound hook for predefined sound types only on client side
  const [playNoteMessage] = isClient
    ? useCustomSound(SOUND_FILES[SOUND_TYPES.NOTE_MESSAGE])
    : [() => {}]
  const [playMilestone] = isClient
    ? useCustomSound(SOUND_FILES[SOUND_TYPES.MILESTONE])
    : [() => {}]

  // Initialize audio context
  useEffect(() => {
    if (!isClient || !enabled || !soundEnabled) return

    const createAudioContext = () => {
      if (!isClient) return null
      try {
        if (!sharedAudioContext) {
          sharedAudioContext = new (window.AudioContext ||
            window.webkitAudioContext)()
        }
        return sharedAudioContext
      } catch (error) {
        console.warn('AudioContext not supported:', error)
        return null
      }
    }

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
        // Don't close shared context, just cleanup local refs
        gainNodeRef.current?.disconnect()
        sourceNodeRef.current?.disconnect()
      } catch (err) {
        console.warn('Error cleaning up audio nodes:', err)
      }
    }
  }, [enabled, soundEnabled, volume, onError])

  const playSound = useCallback(
    (frequency, duration) => {
      if (!isReady || !audioContextRef.current || !isClient) return

      try {
        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContextRef.current.currentTime,
        )
        gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime)

        oscillator.start()
        setIsPlaying(true)
        onPlay?.()

        gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          audioContextRef.current.currentTime + duration,
        )
        oscillator.stop(audioContextRef.current.currentTime + duration)

        setTimeout(() => {
          setIsPlaying(false)
          onEnd?.()
        }, duration * 1000)
      } catch (err) {
        console.error('Error playing sound:', err)
        setError(err)
        onError?.(err)
      }
    },
    [isReady, onPlay, onEnd, onError],
  )

  const playClick = useCallback(() => {
    if (!isReady || !isClient) return
    const audio = audioContextRef.current
    if (!audio) return

    try {
      const oscillator = audio.createOscillator()
      const gainNode = audio.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audio.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, audio.currentTime)
      gainNode.gain.setValueAtTime(0.3, audio.currentTime)

      oscillator.start()
      gainNode.gain.exponentialRampToValueAtTime(
        0.00001,
        audio.currentTime + 0.1,
      )
      oscillator.stop(audio.currentTime + 0.1)
    } catch (err) {
      console.error('Error playing click sound:', err)
      setError(err)
      onError?.(err)
    }
  }, [isReady, onError])

  const playEndChime = useCallback(() => {
    if (!isReady || !isClient) return
    const audio = audioContextRef.current
    if (!audio) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const oscillator = audio.createOscillator()
        const gainNode = audio.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audio.destination)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(
          freq,
          audio.currentTime + index * 0.1,
        )

        gainNode.gain.setValueAtTime(0, audio.currentTime + index * 0.1)
        gainNode.gain.linearRampToValueAtTime(
          0.5,
          audio.currentTime + index * 0.1 + 0.01,
        )
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audio.currentTime + index * 0.1 + 0.5,
        )

        oscillator.start(audio.currentTime + index * 0.1)
        oscillator.stop(audio.currentTime + index * 0.1 + 0.5)
      })
    } catch (err) {
      console.error('Error playing end chime:', err)
      setError(err)
      onError?.(err)
    }
  }, [isReady, onError])

  const playGetSetGoSound = useCallback(
    (frequency, duration) => {
      if (!isReady || !isClient) return
      playSound(frequency, duration)
    },
    [isReady, playSound],
  )

  const play30SecSound = useCallback(() => playSound(330, 0.3), [playSound])
  const play20SecSound = useCallback(() => playSound(440, 0.3), [playSound])
  const play10SecSound = useCallback(() => playSound(880, 0.2), [playSound])

  // Return all sound functions with sound settings checks
  return {
    isReady,
    isPlaying,
    error,
    playNoteMessageSound:
      isClient && soundSettings?.['NoteMessage'] ? playNoteMessage : () => {},
    playMilestoneSound:
      isClient && soundSettings?.['Milestone'] ? playMilestone : () => {},
    playClick: isClient && soundSettings?.['Click'] ? playClick : () => {},
    play30SecSound:
      isClient && soundSettings?.['Quiz'] ? play30SecSound : () => {},
    play20SecSound:
      isClient && soundSettings?.['Quiz'] ? play20SecSound : () => {},
    play10SecSound:
      isClient && soundSettings?.['Quiz'] ? play10SecSound : () => {},
    playEndChime: isClient && soundSettings?.['Quiz'] ? playEndChime : () => {},
    playGetSetGoSound:
      isClient && soundSettings?.['Quiz'] ? playGetSetGoSound : () => {},
  }
}

export default useSafeSound
