// components/quickClashComponents/v2/OnboardingOverlay.jsx
// First-time user onboarding overlay - explains the Quick Clash experience
// 4-slide carousel covering: battle format, gameplay loop, scoring, and competitive spirit

import React, { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Swords,
  Brain,
  Zap,
  Trophy,
  ChevronRight,
  ChevronLeft,
  X,
  Timer,
  Target,
  Sparkles,
} from 'lucide-react'

// Audio and haptic feedback
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'
import axios from 'axios'
import usePlayer from '../../../hooks/usePlayer'

// Slide content configuration
const ONBOARDING_SLIDES = [
  {
    id: 'battle',
    icon: Swords,
    emoji: '⚔️',
    title: '3-Minute Brain Battles',
    subtitle: 'Fast. Intense. Unforgettable.',
    description: 'Each Quick Clash is a rapid-fire showdown. Answer questions, race the clock, and outsmart your opponents in just 5 minutes.',
    accent: 'from-cyan-500 to-blue-500',
    iconBg: 'from-cyan-500/30 to-blue-500/30',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'gameplay',
    icon: Brain,
    emoji: '🧠',
    title: 'Guess → Learn → Answer',
    subtitle: 'The secret to winning.',
    description: 'First, make your best guess. Then learn the answer. Finally, prove you remember under pressure. This loop trains your brain to recall faster.',
    accent: 'from-purple-500 to-pink-500',
    iconBg: 'from-purple-500/30 to-pink-500/30',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    id: 'scoring',
    icon: Zap,
    emoji: '⚡',
    title: 'Speed + Accuracy = Score',
    subtitle: 'Every millisecond counts.',
    description: 'Correct answers earn points. Faster answers earn MORE points. Master the balance between speed and precision to dominate.',
    accent: 'from-amber-500 to-orange-500',
    iconBg: 'from-amber-500/30 to-orange-500/30',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    id: 'compete',
    icon: Trophy,
    emoji: '🏆',
    title: 'Compete, Don\'t Just Solve',
    subtitle: 'This isn\'t a quiz app.',
    description: 'You\'re not just answering questions—you\'re battling opponents, climbing leaderboards, and proving you\'re the fastest brain in the arena.',
    accent: 'from-emerald-500 to-cyan-500',
    iconBg: 'from-emerald-500/30 to-cyan-500/30',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
]

// Progress dots component
const ProgressDots = memo(({ currentSlide, totalSlides, onDotClick }) => (
  <div className="flex items-center justify-center gap-2">
    {Array.from({ length: totalSlides }).map((_, index) => (
      <button
        key={index}
        onClick={() => onDotClick(index)}
        className="relative p-1"
        aria-label={`Go to slide ${index + 1}`}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          animate={{
            scale: currentSlide === index ? 1.3 : 1,
            backgroundColor: currentSlide === index
              ? 'rgb(34, 211, 238)'
              : 'rgba(255, 255, 255, 0.3)',
          }}
          transition={{ duration: 0.2 }}
        />
        {currentSlide === index && (
          <motion.div
            layoutId="activeDot"
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)',
            }}
          />
        )}
      </button>
    ))}
  </div>
))
ProgressDots.displayName = 'ProgressDots'

// Single slide component
const OnboardingSlide = memo(({ slide, isActive, direction }) => {
  const Icon = slide.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : (direction > 0 ? -100 : 100) }}
      exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8"
    >
      {/* Icon with animated glow */}
      <motion.div
        className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.iconBg} flex items-center justify-center mb-6`}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 30px ${slide.glowColor}`,
            `0 0 50px ${slide.glowColor}`,
            `0 0 30px ${slide.glowColor}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />

        {/* Floating emoji */}
        <motion.span
          className="absolute -top-2 -right-2 text-2xl"
          animate={{ y: [-2, 2, -2], rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {slide.emoji}
        </motion.span>
      </motion.div>

      {/* Title */}
      <motion.h2
        className={`text-2xl md:text-3xl font-bold text-center mb-2 bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {slide.title}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="text-white/60 text-sm font-medium mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {slide.subtitle}
      </motion.p>

      {/* Description */}
      <motion.p
        className="text-white/80 text-center text-sm md:text-base leading-relaxed max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {slide.description}
      </motion.p>
    </motion.div>
  )
})
OnboardingSlide.displayName = 'OnboardingSlide'

// Main overlay component
const OnboardingOverlay = memo(({ isOpen, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)

  const { isSession, refresh, player } = usePlayer()

  const handleComplete = useCallback(async () => {
    try {
      const endpoint = isSession ? '/api/play/session/tutorial-progress' : '/api/user/tutorial-progress'
      await axios.post(endpoint, {
        tutorial: 'quickClashOnboarding',
        completed: true,
        sessionId: player?.sessionId
      })
      if (isSession) refresh() // Refresh session data
    } catch (err) {
      console.error('Failed to save onboarding progress:', err)
    }

    onComplete()
  }, [isSession, refresh, onComplete, player])

  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1
  const isFirstSlide = currentSlide === 0

  const handleNext = useCallback(() => {
    haptics.light()
    quizAudioService.playButtonClick()

    if (isLastSlide) {
      handleComplete()
    } else {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    }
  }, [isLastSlide, onComplete])

  const handlePrev = useCallback(() => {
    if (isFirstSlide) return
    haptics.light()
    quizAudioService.playButtonClick()
    setDirection(-1)
    setCurrentSlide(prev => prev - 1)
  }, [isFirstSlide])

  const handleSkip = useCallback(() => {
    haptics.selection()
    quizAudioService.playButtonClick()
    handleComplete()
  }, [handleComplete])

  const handleDotClick = useCallback((index) => {
    haptics.selection()
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }, [currentSlide])

  const currentSlideData = ONBOARDING_SLIDES[currentSlide]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}
        >
          {/* Background gradient effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                `radial-gradient(circle at 50% 30%, ${currentSlideData.glowColor} 0%, transparent 50%)`,
              ],
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Modal container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md h-[500px] rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 0 60px ${currentSlideData.glowColor}`,
            }}
          >
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs font-medium transition-all flex items-center gap-1"
            >
              Skip
              <X className="w-3 h-3" />
            </button>

            {/* Slide content area */}
            <div className="relative h-[380px] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <OnboardingSlide
                  key={currentSlide}
                  slide={currentSlideData}
                  isActive={true}
                  direction={direction}
                />
              </AnimatePresence>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
              {/* Progress dots */}
              <ProgressDots
                currentSlide={currentSlide}
                totalSlides={ONBOARDING_SLIDES.length}
                onDotClick={handleDotClick}
              />

              {/* Navigation buttons */}
              <div className="flex items-center gap-3">
                {/* Back button */}
                <motion.button
                  onClick={handlePrev}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isFirstSlide}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isFirstSlide
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                {/* Next/Start button */}
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-shadow`}
                  style={{
                    background: `linear-gradient(135deg, ${currentSlideData.accent.replace('from-', '').replace(' to-', ', ').split(', ').map(c => {
                      const colorMap = {
                        'cyan-500': '#06b6d4',
                        'blue-500': '#3b82f6',
                        'purple-500': '#a855f7',
                        'pink-500': '#ec4899',
                        'amber-500': '#f59e0b',
                        'orange-500': '#f97316',
                        'emerald-500': '#10b981',
                      }
                      return colorMap[c] || c
                    }).join(', ')})`,
                    boxShadow: `0 4px 25px ${currentSlideData.glowColor}`,
                  }}
                >
                  {isLastSlide ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Let's Battle!
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

OnboardingOverlay.displayName = 'OnboardingOverlay'
export default OnboardingOverlay
