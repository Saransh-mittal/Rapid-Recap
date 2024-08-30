import { useCallback, useRef, useEffect } from 'react'
import { useSound } from 'use-sound'
import { SOUND_FILES, SOUND_TYPES } from '../models/soundSettings'
import { useSelector } from 'react-redux'

// Shared AudioContext instance
let sharedAudioContext

// Custom hook for playing sound
const useCustomSound = () => {
  const audioRef = useRef(null)

  // Use the use-sound hook for predefined sound types
  const [playNoteMessage] = useSound(SOUND_FILES[SOUND_TYPES.NOTE_MESSAGE])
  const [playMilestone] = useSound(SOUND_FILES[SOUND_TYPES.MILESTONE])
  const { soundSettings } = useSelector(state => state.app)

  useEffect(() => {
    // Initialize the shared AudioContext if it doesn't exist
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext ||
        window.webkitAudioContext)()
    }
    audioRef.current = sharedAudioContext
  }, [])

  const playSound = useCallback((frequency, duration) => {
    const audio = audioRef.current
    if (!audio) return

    const oscillator = audio.createOscillator()
    const gainNode = audio.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audio.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime)
    gainNode.gain.setValueAtTime(0.5, audio.currentTime)

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      audio.currentTime + duration,
    )
    oscillator.stop(audio.currentTime + duration)
  }, [])

  const playClick = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    const oscillator = audio.createOscillator()
    const gainNode = audio.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audio.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, audio.currentTime)
    gainNode.gain.setValueAtTime(0.3, audio.currentTime)

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audio.currentTime + 0.1)
    oscillator.stop(audio.currentTime + 0.1)
  }, [])

  const playEndChime = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    console.log('playing end chime')
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const oscillator = audio.createOscillator()
      const gainNode = audio.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audio.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, audio.currentTime + index * 0.1)

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
  }, [])

  const playGetSetGoSound = useCallback((frequency, duration) => {
    const audio = audioRef.current
    if (!audio) return

    const oscillator = audio.createOscillator()
    const gainNode = audio.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audio.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime)
    gainNode.gain.setValueAtTime(0.5, audio.currentTime)

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      audio.currentTime + duration,
    )
    oscillator.stop(audio.currentTime + duration)
  }, [])

  const play30SecSound = useCallback(() => playSound(330, 0.3), [playSound])
  const play20SecSound = useCallback(() => playSound(440, 0.3), [playSound])
  const play10SecSound = useCallback(() => playSound(880, 0.2), [playSound])

  return {
    playNoteMessageSound: soundSettings['noteMessage']
      ? playNoteMessage
      : () => {},

    playMilestoneSound: soundSettings['milestone'] ? playMilestone : () => {},
    playClick: soundSettings['Click'] ? playClick : () => {},
    play30SecSound: soundSettings['Quiz'] ? play30SecSound : () => {},
    play20SecSound: soundSettings['Quiz'] ? play20SecSound : () => {},
    play10SecSound: soundSettings['Quiz'] ? play10SecSound : () => {},
    playEndChime: soundSettings['Quiz'] ? playEndChime : () => {},
    playGetSetGoSound: soundSettings['Quiz'] ? playGetSetGoSound : () => {},
  }
}

export default useCustomSound
