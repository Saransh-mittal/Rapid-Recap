// client/src/services/quizAudioService.js
// Central audio service for Quick Clash and Team Battle sounds
// Uses Howler.js (via use-sound dependency) for reliable cross-browser audio

import { Howl, Howler } from 'howler'

// Import sound files
import quizStartSound from '../assets/sounds/navigation/quiz-start.ogg'
import newQuestionSound from '../assets/sounds/navigation/new-question.wav'
import quizCompleteSound from '../assets/sounds/navigation/quiz-complete.wav'
import timeWarningSound from '../assets/sounds/urgency/time-warning.wav'
import optionClickSound from '../assets/sounds/interactions/option-click.wav'
import submitSound from '../assets/sounds/interactions/submit.wav'
import correctRevealedSound from '../assets/sounds/results/correct-revealed.wav'
import wrongRevealedSound from '../assets/sounds/results/wrong-revealed.wav'
import highScoreSound from '../assets/sounds/results/high-score.wav'
import mediumScoreSound from '../assets/sounds/results/medium-score.wav'
import lowScoreSound from '../assets/sounds/results/low-score.wav'

// Check if we're on client side
const isClient = typeof window !== 'undefined'

// Volume conversion: dB to Howler.js scale (0-1)
// Formula: volume = 10^(dB/20) / 10
const VOLUMES = {
  quizStart: 0.5,       // -12dB - noticeable but not jarring
  newQuestion: 0.35,    // -15dB - subtle notification
  quizComplete: 0.63,   // -10dB - clear milestone
  timeWarning: 0.56,    // -11dB - urgent but controlled
  optionClick: 0.25,    // -16dB - very subtle
  submit: 0.5,          // -12dB - confirmation
  correctRevealed: 0.6, // -9dB - celebratory
  wrongRevealed: 0.5,   // -12dB - gentle
  highScore: 0.7,       // -8dB - victory celebration
  mediumScore: 0.63,    // -10dB - encouraging
  lowScore: 0.5,        // -12dB - supportive
}

// Sprite definitions for trimming longer sounds
// Format: [startMs, durationMs]
const SPRITES = {
  optionClick: { short: [0, 200] },   // Trim 1.0s → 0.2s
  submit: { short: [0, 400] },        // Trim 1.46s → 0.4s
  newQuestion: { short: [0, 300] },   // Trim 1.13s → 0.3s
  quizStart: { short: [0, 1500] },    // Trim 2.83s → 1.5s (keep dramatic)
}

// Sound instances (lazy-loaded)
let sounds = null

/**
 * Initialize all sound instances
 * Called lazily on first use
 */
const initializeSounds = () => {
  if (!isClient || sounds) return sounds

  sounds = {
    // Navigation sounds
    quizStart: new Howl({
      src: [quizStartSound],
      volume: VOLUMES.quizStart,
      sprite: SPRITES.quizStart,
      preload: true,
    }),
    newQuestion: new Howl({
      src: [newQuestionSound],
      volume: VOLUMES.newQuestion,
      sprite: SPRITES.newQuestion,
      preload: true,
    }),
    quizComplete: new Howl({
      src: [quizCompleteSound],
      volume: VOLUMES.quizComplete,
      preload: true,
    }),

    // Urgency sounds
    timeWarning: new Howl({
      src: [timeWarningSound],
      volume: VOLUMES.timeWarning,
      preload: true,
    }),

    // Interaction sounds
    optionClick: new Howl({
      src: [optionClickSound],
      volume: VOLUMES.optionClick,
      sprite: SPRITES.optionClick,
      preload: true,
    }),
    submit: new Howl({
      src: [submitSound],
      volume: VOLUMES.submit,
      sprite: SPRITES.submit,
      preload: true,
    }),
    // Quick submit sound for Continue buttons (200ms)
    submitFull: new Howl({
      src: [submitSound],
      volume: VOLUMES.submit,
      sprite: { half: [0, 200] },  // Play first 200ms
      preload: true,
    }),

    // Result reveal sounds
    correctRevealed: new Howl({
      src: [correctRevealedSound],
      volume: VOLUMES.correctRevealed,
      preload: true,
    }),
    wrongRevealed: new Howl({
      src: [wrongRevealedSound],
      volume: VOLUMES.wrongRevealed,
      preload: true,
    }),

    // Score sounds
    highScore: new Howl({
      src: [highScoreSound],
      volume: VOLUMES.highScore,
      preload: true,
    }),
    mediumScore: new Howl({
      src: [mediumScoreSound],
      volume: VOLUMES.mediumScore,
      preload: true,
    }),
    lowScore: new Howl({
      src: [lowScoreSound],
      volume: VOLUMES.lowScore,
      preload: true,
    }),
  }

  return sounds
}

// Debounce tracking to prevent audio spam
let lastPlayTime = {}
const DEBOUNCE_MS = 50

/**
 * Play a sound with debounce protection
 */
const playSound = (soundKey, sprite = null) => {
  if (!isClient) return

  const now = Date.now()
  if (lastPlayTime[soundKey] && now - lastPlayTime[soundKey] < DEBOUNCE_MS) {
    return // Skip if played too recently
  }
  lastPlayTime[soundKey] = now

  const soundInstances = initializeSounds()
  if (!soundInstances || !soundInstances[soundKey]) return

  try {
    if (sprite) {
      soundInstances[soundKey].play(sprite)
    } else {
      soundInstances[soundKey].play()
    }
  } catch (error) {
    console.debug('[QuizAudio] Play failed:', soundKey, error)
  }
}

/**
 * Quiz Audio Service
 * Main API for playing sounds throughout Quick Clash and Team Battle
 */
export const quizAudioService = {
  // ══════════════════════════════════════════════════════
  // Navigation / Quiz Flow Sounds
  // ══════════════════════════════════════════════════════

  /**
   * Play when quiz/battle session starts
   * Usage: Quiz loads, battle begins, session initialized
   */
  playQuizStart: () => playSound('quizStart', 'short'),

  /**
   * Play when new question appears
   * Usage: Each new question in sequence
   */
  playNewQuestion: () => playSound('newQuestion', 'short'),

  /**
   * Play when all questions are completed
   * Usage: Transition to results screen
   */
  playQuizComplete: () => playSound('quizComplete'),

  // ══════════════════════════════════════════════════════
  // Urgency Sounds
  // ══════════════════════════════════════════════════════

  /**
   * Play when timer is running low (15 seconds)
   * Usage: Play ONCE when timeRemaining === 15
   */
  playTimeWarning: () => playSound('timeWarning'),

  // ══════════════════════════════════════════════════════
  // Interaction Sounds
  // ══════════════════════════════════════════════════════

  /**
   * Play when user selects an option
   * Usage: Option tap/click (neutral feedback)
   */
  playOptionClick: () => playSound('optionClick', 'short'),

  /**
   * Play when user submits/confirms
   * Usage: Submit button, Next button, confirmation
   */
  playSubmit: () => playSound('submit'),

  /**
   * Play short submit sound and wait for completion
   * Usage: Continue button where transition should wait for sound to finish
   * @returns {Promise} Resolves when sound finishes playing (~500ms)
   */
  playSubmitFull: () => {
    return new Promise((resolve) => {
      if (!isClient) {
        resolve()
        return
      }
      const soundInstances = initializeSounds()
      if (!soundInstances || !soundInstances.submitFull) {
        resolve()
        return
      }
      try {
        const id = soundInstances.submitFull.play('half')
        soundInstances.submitFull.once('end', resolve, id)
        // Fallback timeout in case 'end' event doesn't fire
        setTimeout(resolve, 600)
      } catch (error) {
        console.debug('[QuizAudio] Play failed: submitFull', error)
        resolve()
      }
    })
  },

  // ══════════════════════════════════════════════════════
  // Result Reveal Sounds
  // ══════════════════════════════════════════════════════

  /**
   * Play when correct answer is revealed
   * Usage: Results screen showing correct answer
   */
  playCorrectRevealed: () => playSound('correctRevealed'),

  /**
   * Play when wrong answer is revealed
   * Usage: Results screen showing incorrect answer
   */
  playWrongRevealed: () => playSound('wrongRevealed'),

  // ══════════════════════════════════════════════════════
  // Score Sounds
  // ══════════════════════════════════════════════════════

  /**
   * Play high score celebration (80%+)
   */
  playHighScore: () => playSound('highScore'),

  /**
   * Play medium score encouragement (50-79%)
   */
  playMediumScore: () => playSound('mediumScore'),

  /**
   * Play low score support (<50%)
   */
  playLowScore: () => playSound('lowScore'),

  /**
   * Play appropriate score sound based on percentage
   * @param {number} percentage - Score percentage (0-100)
   */
  playScoreSummary: (percentage) => {
    if (percentage >= 80) {
      playSound('highScore')
    } else if (percentage >= 50) {
      playSound('mediumScore')
    } else {
      playSound('lowScore')
    }
  },

  // ══════════════════════════════════════════════════════
  // Global Controls
  // ══════════════════════════════════════════════════════

  /**
   * Mute all sounds
   */
  mute: () => {
    if (isClient) Howler.mute(true)
  },

  /**
   * Unmute all sounds
   */
  unmute: () => {
    if (isClient) Howler.mute(false)
  },

  /**
   * Set global volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume: (volume) => {
    if (isClient) Howler.volume(volume)
  },

  /**
   * Stop all currently playing sounds
   */
  stopAll: () => {
    if (isClient) Howler.stop()
  },

  /**
   * Check if audio is supported
   */
  isSupported: () => isClient && Howler.usingWebAudio,

  // ══════════════════════════════════════════════════════
  // Synthetic Sounds (Web Audio API - no files needed)
  // ══════════════════════════════════════════════════════

  /**
   * Play donate sound - ascending chime for successful donation
   * Usage: PowerupDonationModal after successful donation
   */
  playDonate: () => playSyntheticSound('donate'),

  /**
   * Play equip sound - power-up snap for equipping
   * Usage: PowerupSelectionModal after successful equip
   */
  playEquip: () => playSyntheticSound('equip'),

  /**
   * Play unequip sound - soft release
   * Usage: PowerupSelectionModal after unequipping
   */
  playUnequip: () => playSyntheticSound('unequip'),

  /**
   * Play Go button sound - energetic launch
   * Usage: "Let's Go!" button in TeamBattlePageV2
   */
  playGoButton: () => playSyntheticSound('goButton'),

  /**
   * Play dismiss sound - quick pop for closing modals
   * Usage: Close/X buttons on modals
   */
  playDismiss: () => playSyntheticSound('dismiss'),

  /**
   * Play default button click - subtle tick
   * Usage: Global default for buttons without dedicated sounds
   */
  playButtonClick: () => playSyntheticSound('buttonClick'),

  /**
   * Play match found fanfare - triumphant ascending arpeggio
   * Usage: When a battle match is found in global matchmaking
   */
  playMatchFound: () => playSyntheticSound('matchFound'),

  /**
   * Play Time Warp sound - clock rewind/slow-mo effect
   * Usage: Time Warp powerup activation
   */
  playTimeWarp: () => playSyntheticSound('timeWarp'),

  /**
   * Play Score Surge sound - power boost whoosh
   * Usage: Score Surge (2x multiplier) powerup activation
   */
  playScoreSurge: () => playSyntheticSound('scoreSurge'),

  /**
   * Play Oracle's Eye sound - mystical reveal chime
   * Usage: Oracle's Eye (eliminate options) powerup activation
   */
  playOraclesEye: () => playSyntheticSound('oraclesEye'),
}

// ══════════════════════════════════════════════════════
// Web Audio API Synthetic Sound Generator
// ══════════════════════════════════════════════════════

let audioContext = null

/**
 * Get or create AudioContext (lazy initialization)
 */
const getAudioContext = () => {
  if (!isClient) return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume if suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

/**
 * Synthetic sound definitions
 */
const SYNTHETIC_SOUNDS = {
  // Ascending chime - magical donation feel
  donate: (ctx, now) => {
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'triangle'
    osc1.frequency.setValueAtTime(523, now) // C5
    osc1.frequency.exponentialRampToValueAtTime(784, now + 0.15) // G5
    osc2.frequency.setValueAtTime(659, now) // E5
    osc2.frequency.exponentialRampToValueAtTime(1047, now + 0.15) // C6

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.3)
    osc2.stop(now + 0.3)
  },

  // Power-up snap - energetic equip
  equip: (ctx, now) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.15)
  },

  // Time Warp - clock-like rewind swoosh with descending pitch
  timeWarp: (ctx, now) => {
    // Create layered time-warping effect
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    const mainGain = ctx.createGain()

    // Main oscillator - descending sweep (rewind feel)
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1200, now)
    osc1.frequency.exponentialRampToValueAtTime(300, now + 0.4)

    // Secondary oscillator - harmonic layer
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(800, now)
    osc2.frequency.exponentialRampToValueAtTime(200, now + 0.4)

    // LFO for wobble effect (time distortion)
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(15, now)
    lfoGain.gain.setValueAtTime(50, now)

    lfo.connect(lfoGain)
    lfoGain.connect(osc1.frequency)

    // Envelope
    mainGain.gain.setValueAtTime(0.15, now)
    mainGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    osc1.connect(mainGain)
    osc2.connect(mainGain)
    mainGain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    lfo.start(now)
    osc1.stop(now + 0.5)
    osc2.stop(now + 0.5)
    lfo.stop(now + 0.5)
  },

  // Score Surge - energetic power-up burst with ascending notes
  scoreSurge: (ctx, now) => {
    // Rapid ascending power burst
    const frequencies = [392, 523, 659, 784, 1047] // G4, C5, E5, G5, C6

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, now + i * 0.05)

      gain.gain.setValueAtTime(0, now + i * 0.05)
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.05 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.05)
      osc.stop(now + i * 0.05 + 0.15)
    })

    // Final power surge
    const finalOsc = ctx.createOscillator()
    const finalGain = ctx.createGain()

    finalOsc.type = 'sine'
    finalOsc.frequency.setValueAtTime(1047, now + 0.25)
    finalOsc.frequency.exponentialRampToValueAtTime(1319, now + 0.35) // E6

    finalGain.gain.setValueAtTime(0.18, now + 0.25)
    finalGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    finalOsc.connect(finalGain)
    finalGain.connect(ctx.destination)

    finalOsc.start(now + 0.25)
    finalOsc.stop(now + 0.5)
  },

  // Oracle's Eye - mystical reveal with ethereal chime
  oraclesEye: (ctx, now) => {
    // Ethereal shimmer effect
    const notes = [
      { freq: 880, delay: 0 },      // A5
      { freq: 1109, delay: 0.08 },  // C#6
      { freq: 1319, delay: 0.16 },  // E6
      { freq: 1760, delay: 0.24 },  // A6 (octave up)
    ]

    notes.forEach(({ freq, delay }) => {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      // Crystal-like tone
      osc1.type = 'sine'
      osc2.type = 'triangle'
      osc1.frequency.setValueAtTime(freq, now + delay)
      osc2.frequency.setValueAtTime(freq * 1.5, now + delay) // Perfect fifth

      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.25)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now + delay)
      osc2.start(now + delay)
      osc1.stop(now + delay + 0.3)
      osc2.stop(now + delay + 0.3)
    })

    // Mystical "reveal" sweep
    const sweepOsc = ctx.createOscillator()
    const sweepGain = ctx.createGain()

    sweepOsc.type = 'sine'
    sweepOsc.frequency.setValueAtTime(2000, now + 0.3)
    sweepOsc.frequency.exponentialRampToValueAtTime(4000, now + 0.45)

    sweepGain.gain.setValueAtTime(0.05, now + 0.3)
    sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    sweepOsc.connect(sweepGain)
    sweepGain.connect(ctx.destination)

    sweepOsc.start(now + 0.3)
    sweepOsc.stop(now + 0.5)
  },

  // Soft release - gentle unequip
  unequip: (ctx, now) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(500, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.12)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  },

  // Energetic launch - Go button
  goButton: (ctx, now) => {
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sawtooth'
    osc2.type = 'sine'
    osc1.frequency.setValueAtTime(200, now)
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.1)
    osc2.frequency.setValueAtTime(400, now)
    osc2.frequency.exponentialRampToValueAtTime(800, now + 0.15)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.2)
    osc2.stop(now + 0.2)
  },

  // Quick pop - dismiss/close
  dismiss: (ctx, now) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.08)
  },

  // Subtle tick - default button click
  buttonClick: (ctx, now) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03)

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  },

  // Match Found Fanfare - triumphant ascending arpeggio
  matchFound: (ctx, now) => {
    // Create a triumphant 4-note ascending fanfare
    const notes = [
      { freq: 523, delay: 0 },      // C5
      { freq: 659, delay: 0.1 },    // E5
      { freq: 784, delay: 0.2 },    // G5
      { freq: 1047, delay: 0.35 },  // C6 (held longer)
    ]

    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      // Rich sound with harmonics
      osc.type = 'sine'
      osc2.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + delay)
      osc2.frequency.setValueAtTime(freq * 2, now + delay) // Octave harmonic

      const isLastNote = delay === 0.35
      const duration = isLastNote ? 0.4 : 0.15
      const volume = isLastNote ? 0.2 : 0.12

      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(volume, now + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + duration)

      osc.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + delay)
      osc2.start(now + delay)
      osc.stop(now + delay + duration)
      osc2.stop(now + delay + duration)
    })
  },
}

// Debounce for synthetic sounds
let lastSyntheticPlayTime = {}
const SYNTHETIC_DEBOUNCE_MS = 30

/**
 * Play a synthetic sound
 */
const playSyntheticSound = (soundKey) => {
  if (!isClient) return

  const now = Date.now()
  if (lastSyntheticPlayTime[soundKey] && now - lastSyntheticPlayTime[soundKey] < SYNTHETIC_DEBOUNCE_MS) {
    return
  }
  lastSyntheticPlayTime[soundKey] = now

  const ctx = getAudioContext()
  if (!ctx) return

  const soundFn = SYNTHETIC_SOUNDS[soundKey]
  if (!soundFn) return

  try {
    soundFn(ctx, ctx.currentTime)
  } catch (error) {
    console.debug('[QuizAudio] Synthetic sound failed:', soundKey, error)
  }
}

export default quizAudioService
