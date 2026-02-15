import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Sparkles, FileText, AlertCircle, Image,
  Camera, X, CheckCircle2, BookOpen, Brain, Wand2, Play,
  Zap, Target, Clock, Shield, Trophy,
} from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'

const MIN_CHARS = 50
const MAX_CHARS = 2500
const MAX_IMAGE_MB = 2

// ── Progress steps with estimated timing ──
const PROGRESS_STEPS = [
  { icon: BookOpen, label: 'Analyzing your content', sublabel: 'Understanding the material structure', durationMs: 8000 },
  { icon: Brain, label: 'Extracting key concepts', sublabel: 'Identifying core topics and themes', durationMs: 12000 },
  { icon: Wand2, label: 'Generating questions', sublabel: 'Crafting challenge questions', durationMs: 15000 },
  { icon: Sparkles, label: 'Preparing your drill', sublabel: 'Final optimization and quality check', durationMs: 15000 },
]

// Floating particles for visual richness on processing/ready screens
const FloatingParticle = ({ delay, size, x, y, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)',
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0.3, 0.6, 0],
      scale: [0.5, 1, 0.8, 1, 0.5],
      y: [0, -20, -10, -25, 0],
    }}
    transition={{
      duration: duration || 6,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
)

const CustomDrillInput = () => {
  const {
    customText,
    setCustomText,
    startCustomSession,
    processingCustom,
    error,
    loadout,
    customDrillLimits,
    resetDrill,
    phase,
    launchDrill,
  } = useSoloDrill()

  // Input mode: 'text' | 'gallery' | 'camera'
  const [mode, setMode] = useState('text')
  const [localText, setLocalText] = useState(customText || '')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [imageError, setImageError] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Progress bar state
  const [progressStep, setProgressStep] = useState(0)
  const progressTimerRef = useRef(null)

  const charCount = localText.trim().length
  const wordCount = localText.trim() ? localText.trim().split(/\s+/).length : 0
  const isTextValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS
  const isImageValid = !!imageBase64
  const canGenerate = mode === 'text' ? isTextValid : isImageValid
  const remaining = customDrillLimits?.totalCustomDrillsRemaining ?? null
  const isImageMode = mode === 'gallery' || mode === 'camera'
  const isReady = phase === 'custom_ready'

  // Auto-advance progress steps when processing
  useEffect(() => {
    if (processingCustom) {
      setProgressStep(0)
      let step = 0

      const advance = () => {
        if (step < PROGRESS_STEPS.length - 1) {
          step++
          setProgressStep(step)
          progressTimerRef.current = setTimeout(advance, PROGRESS_STEPS[step].durationMs)
        }
      }

      progressTimerRef.current = setTimeout(advance, PROGRESS_STEPS[0].durationMs)
    }

    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current)
    }
  }, [processingCustom])

  const processFile = (file) => {
    if (!file) return
    setImageError(null)

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file (JPEG or PNG)')
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_IMAGE_MB}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      setImageBase64(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageSelect = (e) => processFile(e.target.files?.[0])

  const clearImage = () => {
    setImagePreview(null)
    setImageBase64(null)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const switchToMode = (newMode) => {
    setMode(newMode)
    if (newMode === 'text') clearImage()
  }

  const handleGenerate = async () => {
    if (!canGenerate || processingCustom) return

    if (mode === 'text') {
      setCustomText(localText.trim())
      await startCustomSession(localText.trim(), loadout)
    } else {
      await startCustomSession(null, loadout, imageBase64)
    }
  }

  // ═══════════════════════════════════════════════════════
  // READY SCREEN — shown after generation, before drill
  // ═══════════════════════════════════════════════════════
  if (isReady) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto w-full max-w-4xl flex flex-col items-center py-4 relative overflow-hidden"
        style={{ minHeight: '420px' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Floating particles */}
        <FloatingParticle delay={0} size={6} x={15} y={20} duration={7} />
        <FloatingParticle delay={1.5} size={4} x={80} y={30} duration={5} />
        <FloatingParticle delay={0.8} size={8} x={25} y={70} duration={8} />
        <FloatingParticle delay={2} size={5} x={75} y={60} duration={6} />
        <FloatingParticle delay={3} size={3} x={50} y={15} duration={5} />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-6 w-full mt-6">
          {/* Success icon with rings */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="h-20 w-20 rounded-full flex items-center justify-center relative z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(20,184,166,0.15) 100%)',
                border: '2px solid rgba(16,185,129,0.4)',
              }}
            >
              <CheckCircle2 size={36} className="text-emerald-400" />
            </motion.div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(16,185,129,0.2)' }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(16,185,129,0.15)' }}
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            />
          </div>

          <div className="text-center space-y-2">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-white"
            >
              Drill Ready!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-slate-400 max-w-xs mx-auto"
            >
              Your AI-powered drill has been generated from your content.
            </motion.p>
          </div>

          {/* Drill info cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-3 w-full max-w-xs"
          >
            {[
              { icon: Target, label: '5 Rounds', sublabel: 'Forge Phase', color: '#14b8a6' },
              { icon: Clock, label: '~3 min', sublabel: 'Estimated', color: '#22d3ee' },
              { icon: Trophy, label: 'Score', sublabel: 'Up to 250', color: '#fbbf24' },
            ].map(({ icon: Icon, label, sublabel, color }, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
              >
                <Icon size={16} style={{ color }} />
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[10px] text-slate-500">{sublabel}</p>
              </div>
            ))}
          </motion.div>

          {/* Start Drill CTA */}
          <motion.button
            onClick={launchDrill}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full max-w-xs py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2.5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #0284C7 100%)',
              boxShadow: '0 8px 28px rgba(6,182,212,0.25)',
            }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/10" />
            <span className="relative z-10 flex items-center gap-2">
              <Play size={18} />
              Start Drill
            </span>
          </motion.button>

          {/* Back option */}
          <motion.button
            onClick={resetDrill}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={10} />
            Back to categories
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // PROCESSING SCREEN — enriched progress indicator
  // ═══════════════════════════════════════════════════════
  if (processingCustom) {
    const currentStep = PROGRESS_STEPS[progressStep]

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto w-full max-w-4xl flex flex-col items-center py-4 relative overflow-hidden"
        style={{ minHeight: '420px' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Floating particles */}
        <FloatingParticle delay={0} size={5} x={10} y={25} duration={6} />
        <FloatingParticle delay={1} size={7} x={85} y={35} duration={7} />
        <FloatingParticle delay={2} size={4} x={20} y={65} duration={5} />
        <FloatingParticle delay={0.5} size={6} x={70} y={55} duration={8} />
        <FloatingParticle delay={3} size={3} x={45} y={80} duration={5} />
        <FloatingParticle delay={1.5} size={5} x={55} y={15} duration={6} />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-7 w-full mt-4">
          {/* Animated icon circle with orbiting ring */}
          <div className="relative">
            <motion.div
              key={progressStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="h-20 w-20 rounded-full flex items-center justify-center relative z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(6,182,212,0.12) 100%)',
                border: '2px solid rgba(20,184,166,0.3)',
              }}
            >
              <currentStep.icon size={32} className="text-teal-400" />
            </motion.div>

            {/* Orbiting dot — wrapper rotates, dot sits at top edge */}
            <motion.div
              className="absolute inset-[-12px] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ pointerEvents: 'none' }}
            >
              <div
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#14b8a6',
                  boxShadow: '0 0 6px rgba(20,184,166,0.5)',
                  top: '-3px',
                  left: '50%',
                  marginLeft: '-3px',
                }}
              />
            </motion.div>
          </div>

          {/* Step label + sublabel */}
          <div className="text-center space-y-1.5">
            <AnimatePresence mode="wait">
              <motion.p
                key={`label-${progressStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-base font-semibold text-white"
              >
                {currentStep.label}
              </motion.p>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${progressStep}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-slate-500"
              >
                {currentStep.sublabel}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Step cards — vertical timeline */}
          <div className="w-full max-w-xs space-y-0">
            {PROGRESS_STEPS.map((step, i) => {
              const StepIcon = step.icon
              const isActive = i === progressStep
              const isDone = i < progressStep

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 py-2.5"
                >
                  {/* Step icon */}
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500"
                    style={{
                      backgroundColor: isDone
                        ? 'rgba(16,185,129,0.15)'
                        : isActive
                        ? 'rgba(20,184,166,0.15)'
                        : 'rgba(51, 65, 85, 0.3)',
                      border: isActive
                        ? '1px solid rgba(20,184,166,0.3)'
                        : '1px solid transparent',
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <StepIcon
                        size={14}
                        className={`transition-colors duration-300 ${isActive ? 'text-teal-400' : 'text-slate-500'}`}
                      />
                    )}
                  </div>

                  {/* Step label */}
                  <p
                    className={`text-xs font-medium transition-colors duration-300 ${
                      isDone ? 'text-emerald-400/70' : isActive ? 'text-white' : 'text-slate-400/60'
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Time estimate */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
          >
            <Clock size={12} className="text-slate-500" />
            <p className="text-[11px] text-slate-500">
              Usually takes 45–60 seconds
            </p>
          </motion.div>

          {/* Error during processing */}
          {error && (
            <div className="px-3 py-2 rounded-lg text-xs text-red-400 w-full max-w-xs" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              {error}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // ═══════════════════════════════════════════════════════
  // INPUT SCREEN — text / gallery / camera
  // ═══════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto w-full max-w-4xl flex flex-col gap-4"
    >
      {/* Top bar: back + remaining */}
      <div className="flex items-center justify-between">
        <button
          onClick={resetDrill}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>

        {remaining !== null && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              backgroundColor: remaining > 0 ? 'rgba(20, 184, 166, 0.12)' : 'rgba(251, 191, 36, 0.12)',
              color: remaining > 0 ? '#5eead4' : '#fbbf24',
            }}
          >
            <Zap size={10} />
            {remaining > 0
              ? `${remaining} drill${remaining !== 1 ? 's' : ''} left`
              : 'No drills left'}
          </span>
        )}
      </div>

      {/* Header — compact */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">Paste text, upload, or snap a photo</p>
        <p className="text-xs text-slate-500">We'll generate a timed drill from your content.</p>
      </div>

      {/* Mode Toggle — 3 tabs, cyan accent */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
        {[
          { key: 'text', icon: FileText, label: 'Text' },
          { key: 'gallery', icon: Image, label: 'Gallery' },
          { key: 'camera', icon: Camera, label: 'Camera' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => switchToMode(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              backgroundColor: mode === key ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
              color: mode === key ? '#5eead4' : '#64748b',
              border: mode === key ? '1px solid rgba(20,184,166,0.15)' : '1px solid transparent',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Text Input ── */}
      {mode === 'text' && (
        <div className="relative">
          <textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="Paste your text here (lecture notes, textbook excerpt, article, etc.)..."
            disabled={processingCustom}
            className="w-full h-44 sm:h-52 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 resize-none focus:outline-none transition-all"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.45)',
              border: '1px solid rgba(100, 116, 139, 0.12)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(20,184,166,0.3)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(100, 116, 139, 0.12)'}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-3 text-[11px] font-medium">
            <span className={charCount < MIN_CHARS ? 'text-amber-400' : charCount > MAX_CHARS ? 'text-red-400' : 'text-slate-600'}>
              {charCount}/{MAX_CHARS}
            </span>
            <span className="text-slate-700">{wordCount} words</span>
          </div>
        </div>
      )}

      {/* Text Validation */}
      {mode === 'text' && charCount > 0 && charCount < MIN_CHARS && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
          <AlertCircle size={11} />
          <span>Need at least {MIN_CHARS - charCount} more characters</span>
        </div>
      )}
      {mode === 'text' && charCount > MAX_CHARS && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={11} />
          <span>Text is too long ({charCount - MAX_CHARS} over limit)</span>
        </div>
      )}

      {/* ── Gallery / Camera Image Input ── */}
      {isImageMode && (
        <div>
          {!imagePreview ? (
            <label
              className="flex flex-col items-center justify-center w-full h-44 sm:h-52 rounded-xl cursor-pointer transition-all duration-200 group"
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.35)',
                border: '2px dashed rgba(100, 116, 139, 0.2)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(20,184,166,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)'}
            >
              {mode === 'camera' ? (
                <>
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(20,184,166,0.1)' }}
                  >
                    <Camera size={22} className="text-teal-400/60 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <span className="text-sm text-slate-400 font-medium">Take a photo</span>
                  <span className="text-xs text-slate-600 mt-0.5">Photo of your study material</span>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </>
              ) : (
                <>
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'rgba(20,184,166,0.1)' }}
                  >
                    <Image size={22} className="text-teal-400/60 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <span className="text-sm text-slate-400 font-medium">Upload screenshot</span>
                  <span className="text-xs text-slate-600 mt-0.5">JPEG or PNG, max {MAX_IMAGE_MB}MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </>
              )}
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(30, 41, 59, 0.35)' }}>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-52 object-contain"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image error */}
      {imageError && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={11} />
          <span>{imageError}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-2 rounded-lg text-xs text-red-400" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          {error}
        </div>
      )}

      {/* Generate button */}
      <motion.button
        onClick={handleGenerate}
        disabled={!canGenerate || processingCustom || remaining === 0}
        whileHover={canGenerate && !processingCustom ? { scale: 1.01, y: -1 } : {}}
        whileTap={canGenerate && !processingCustom ? { scale: 0.98 } : {}}
        className="relative w-full h-12 rounded-xl text-white font-bold text-sm overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        style={{
          background: canGenerate && !processingCustom
            ? 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #0284C7 100%)'
            : 'rgba(51, 65, 85, 0.4)',
          boxShadow: canGenerate && !processingCustom
            ? '0 6px 24px rgba(6,182,212,0.2)'
            : 'none',
        }}
      >
        {canGenerate && !processingCustom && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/10" />
          </>
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Sparkles size={15} />
          Generate Drill
        </span>
      </motion.button>
    </motion.div>
  )
}

export default CustomDrillInput
