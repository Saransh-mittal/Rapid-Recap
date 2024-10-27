import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { isClient } from '../utils/environment'

// Sound settings constants
export const SOUND_TYPES = {
  NOTE_MESSAGE: 'noteMessage',
  MILESTONE: 'milestone',
  CLICK: 'click',
  QUIZ: 'quiz',
}

export const SOUND_FILES = {
  [SOUND_TYPES.NOTE_MESSAGE]: '/sounds/notification.mp3',
  [SOUND_TYPES.MILESTONE]: '/sounds/milestone.mp3',
}

// Shared AudioContext instance
let sharedAudioContext

// Dynamic import for use-sound
let useCustomSound = () => [() => {}, {}]

if (isClient) {
  // Only import on client side
  try {
    const useSoundModule = require('use-sound')
    useCustomSound = useSoundModule.default || useSoundModule
  } catch (error) {
    console.warn('use-sound import failed:', error)
  }
}

const createSafeAudioContext = () => {
  if (!isClient) return null
  try {
    if (!sharedAudioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (AudioContextClass) {
        sharedAudioContext = new AudioContextClass()
      }
    }
    return sharedAudioContext
  } catch (error) {
    console.warn('AudioContext creation failed:', error)
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
  const { soundSettings } = useSelector(state => state.app)

  const audioContextRef = useRef(null)
  const gainNodeRef = useRef(null)
  const sourceNodeRef = useRef(null)

  // Initialize predefined sounds only on client side
  const [playNoteMessage] = isClient
    ? useCustomSound(SOUND_FILES[SOUND_TYPES.NOTE_MESSAGE], { volume })
    : [() => {}]
  const [playMilestone] = isClient
    ? useCustomSound(SOUND_FILES[SOUND_TYPES.MILESTONE], { volume })
    : [() => {}]

  useEffect(() => {
    if (!isClient || !enabled || !soundEnabled) return

    const initAudio = () => {
      try {
        audioContextRef.current = createSafeAudioContext()
        if (audioContextRef.current) {
          gainNodeRef.current = audioContextRef.current.createGain()
          gainNodeRef.current.connect(audioContextRef.current.destination)
          gainNodeRef.current.gain.value = volume
          setIsReady(true)
        }
      } catch (err) {
        console.error('Audio initialization failed:', err)
        setError(err)
        onError?.(err)
      }
    }

    initAudio()

    return () => {
      try {
        gainNodeRef.current?.disconnect()
        sourceNodeRef.current?.disconnect()
      } catch (err) {
        console.warn('Audio cleanup failed:', err)
      }
    }
  }, [enabled, soundEnabled, volume, onError])

  const createAndPlayOscillator = useCallback(
    (frequency, duration, type = 'sine', gain = 0.5) => {
      if (!isReady || !audioContextRef.current || !isClient) return

      try {
        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.type = type
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContextRef.current.currentTime,
        )
        gainNode.gain.setValueAtTime(gain, audioContextRef.current.currentTime)

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
        console.error('Sound playback failed:', err)
        setError(err)
        onError?.(err)
      }
    },
    [isReady, onPlay, onEnd, onError],
  )

  const playClick = useCallback(() => {
    createAndPlayOscillator(800, 0.1, 'sine', 0.3)
  }, [createAndPlayOscillator])

  const playEndChime = useCallback(() => {
    if (!isReady || !isClient) return

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        createAndPlayOscillator(freq, 0.5, 'sine', 0.4)
      }, index * 100)
    })
  }, [isReady, createAndPlayOscillator])

  const play30SecSound = useCallback(
    () => createAndPlayOscillator(330, 0.3),
    [createAndPlayOscillator],
  )
  const play20SecSound = useCallback(
    () => createAndPlayOscillator(440, 0.3),
    [createAndPlayOscillator],
  )
  const play10SecSound = useCallback(
    () => createAndPlayOscillator(880, 0.2),
    [createAndPlayOscillator],
  )

  return {
    isReady,
    isPlaying,
    error,
    playNoteMessageSound:
      isClient && soundSettings?.['NoteMessage'] ? playNoteMessage : () => {},
    playMilestoneSound:
      isClient && soundSettings?.['Milestone'] ? playMilestone : () => {},
    playClick:
      isClient && soundSettings?.['Click'] && isReady ? playClick : () => {},
    play30SecSound:
      isClient && soundSettings?.['Quiz'] && isReady
        ? play30SecSound
        : () => {},
    play20SecSound:
      isClient && soundSettings?.['Quiz'] && isReady
        ? play20SecSound
        : () => {},
    play10SecSound:
      isClient && soundSettings?.['Quiz'] && isReady
        ? play10SecSound
        : () => {},
    playEndChime:
      isClient && soundSettings?.['Quiz'] && isReady ? playEndChime : () => {},
    playCustomSound: isClient && isReady ? createAndPlayOscillator : () => {},
  }
}

export default useSafeSound
