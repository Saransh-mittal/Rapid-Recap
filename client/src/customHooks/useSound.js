import { useCallback, useState } from 'react'

// Custom hook for playing sound
const useSound = () => {
  const [audio] = useState(
    () => new (window.AudioContext || window.webkitAudioContext)(),
  )

  const playClick = useCallback(() => {
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
  }, [audio])

  return { playClick }
}

export default useSound
