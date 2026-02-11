import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import {
  RotateCcw, X, ChevronDown, Zap, Brain, Trophy, Target, Shield,
  Award, Star, Flame, CheckCircle2, XCircle, Clock
} from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'

/* ─── Benchmark Configs ─── */
const BENCH = {
  diamond: { icon: Trophy, label: 'Diamond', color: '#22d3ee', glow: 'rgba(34,211,238,0.30)', accent: 'from-cyan-400 to-sky-300' },
  gold:    { icon: Star,   label: 'Gold',    color: '#fbbf24', glow: 'rgba(251,191,36,0.30)', accent: 'from-amber-400 to-yellow-300' },
  silver:  { icon: Shield, label: 'Silver',  color: '#94a3b8', glow: 'rgba(148,163,184,0.25)', accent: 'from-slate-300 to-slate-200' },
  bronze:  { icon: Award,  label: 'Bronze',  color: '#f97316', glow: 'rgba(249,115,22,0.30)', accent: 'from-orange-400 to-amber-300' },
  rookie:  { icon: Target, label: 'Rookie',  color: '#a78bfa', glow: 'rgba(167,139,250,0.30)', accent: 'from-violet-400 to-purple-300' },
}

/* ─── Animated counter ─── */
const AnimatedNumber = ({ value, duration = 1.2 }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / (duration * 60)
    let raf
    const tick = () => {
      start += step
      if (start >= value) { setDisplay(value); return }
      setDisplay(Math.floor(start))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{display}</>
}

/* ─── Single Q&A Row ─── */
const QARow = ({ q, index, isForge }) => {
  const [open, setOpen] = useState(false)

  // Normalize options for display
  const optionEntries = useMemo(() => {
    if (Array.isArray(q.options)) {
      return q.options.map((text, i) => ({ key: String.fromCharCode(65 + i), text }))
    }
    if (q.options && typeof q.options === 'object') {
      return Object.entries(q.options).map(([k, v]) => ({ key: k.toUpperCase(), text: v }))
    }
    return []
  }, [q.options])

  // Determine correct/user keys
  const correctAnswer = q.answer || ''
  const userAnswer = q.userAnswer || ''

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <div
          className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            backgroundColor: q.isCorrect ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            color: q.isCorrect ? '#34d399' : '#f87171',
          }}
        >
          {q.isCorrect ? '✓' : '✗'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-300 leading-snug truncate">
            {isForge ? `Forge ${index + 1}` : `Quiz ${index + 1}`}: {q.question}
          </p>
        </div>
        {q.score != null && (
          <span className="text-[10px] font-bold text-slate-400 tabular-nums flex-shrink-0">+{q.score}</span>
        )}
        <ChevronDown
          size={12}
          className="text-slate-500 transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              <p className="text-[11px] text-slate-400 leading-relaxed">{q.question}</p>
              {optionEntries.map(({ key, text }) => {
                const normKey = key.toLowerCase()
                const normCorrect = correctAnswer.toLowerCase?.() ?? ''
                const normUser = userAnswer.toLowerCase?.() ?? ''
                // For array-based (forge) options: correct/user are by text match
                const isCorrectOpt = isForge
                  ? text === correctAnswer
                  : normKey === normCorrect
                const isUserOpt = isForge
                  ? text === userAnswer
                  : normKey === normUser

                let bg = 'rgba(30,41,59,0.4)'
                let textColor = '#94a3b8'
                let borderL = 'transparent'

                if (isCorrectOpt) { bg = 'rgba(52,211,153,0.08)'; textColor = '#6ee7b7'; borderL = '#34d399' }
                else if (isUserOpt && !q.isCorrect) { bg = 'rgba(248,113,113,0.08)'; textColor = '#fca5a5'; borderL = '#f87171' }

                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 py-1 px-2 rounded-lg text-[11px]"
                    style={{ backgroundColor: bg, borderLeft: `2px solid ${borderL}`, color: textColor }}
                  >
                    <span className="font-bold opacity-50 w-3 uppercase">{key}</span>
                    <span className="flex-1">{text}</span>
                    {isUserOpt && <span className="text-[9px] opacity-60">your answer</span>}
                  </div>
                )
              })}
              {q.explanation && (
                <p className="text-[10px] text-slate-500 italic pt-1 border-t border-white/5">{q.explanation}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Results ─── */
const SoloDrillResults = () => {
  const {
    lastResult,
    activeSession,
    sessionId,
    resumeSession,
    resetDrill,
    closeDrillModal,
    fetchLimits
  } = useSoloDrill()

  const reportFetchStartedRef = useRef(false)
  const limitsFetchStartedRef = useRef(false)

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    if (limitsFetchStartedRef.current) return
    limitsFetchStartedRef.current = true
    fetchLimits()
  }, [fetchLimits])

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!sessionId || reportFetchStartedRef.current) return
    reportFetchStartedRef.current = true
    resumeSession(sessionId)
  }, [sessionId, resumeSession])

  const totalScore = lastResult?.totalScore || 0
  const benchmark = lastResult?.benchmark || 'rookie'
  const forgeScore = lastResult?.forgeScore || 0
  const quizScore = lastResult?.quizScore || 0
  const isHighTier = ['diamond', 'gold'].includes(benchmark)
  const bench = BENCH[benchmark] || BENCH.rookie
  const BenchIcon = bench.icon

  const detailedReport = useMemo(() => {
    if (!activeSession?.forgeArticle) return null

    const quizQuestions = activeSession.forgeArticle?.quickClashQuiz?.questions || []
    const quizResponses = activeSession.quizAttempt?.responses || []
    const quizQuestionsReport = quizResponses.map(response => {
      const question = quizQuestions.find(
        q => q._id?.toString?.() === response.questionId?.toString?.()
      )
      return {
        question: question?.question || 'Question unavailable',
        options: question?.options || { a: '', b: '', c: '', d: '' },
        answer: question?.answer || question?.correctAnswer || '',
        explanation: question?.explanation || 'No explanation available',
        userAnswer: response.userAnswer || '',
        isCorrect: !!response.isCorrect,
      }
    })

    const sections = activeSession.forgeArticle?.sections || []
    const forgeResponses = activeSession.forgeProgress?.responses || []
    const forgeQuestionsReport = forgeResponses.map(response => {
      const byNumber = sections.find(s => s.sectionNumber === response.sectionNumber)
      const byIndex = sections[response.sectionNumber]
      const section = byNumber || byIndex
      const options = section?.mcq?.options || []
      const correctIndex =
        typeof section?.mcq?.correctIndex === 'number'
          ? section.mcq.correctIndex
          : section?.mcq?.correctOptionIndex

      return {
        question: section?.mcq?.question || 'Forge question unavailable',
        options,
        userAnswer:
          typeof response.userAnswer === 'number' && options[response.userAnswer]
            ? options[response.userAnswer]
            : 'Not answered',
        answer:
          typeof correctIndex === 'number' && options[correctIndex]
            ? options[correctIndex]
            : 'N/A',
        isCorrect: !!response.isCorrect,
        score: response.scoreBreakdown?.total || 0,
        explanation:
          section?.mcq?.contextNugget ||
          section?.mcq?.hint ||
          section?.title ||
          'No explanation available',
      }
    })

    const quizCorrect = quizQuestionsReport.filter(q => q.isCorrect).length
    const forgeCorrect = forgeQuestionsReport.filter(q => q.isCorrect).length

    return {
      quizQuestionsReport,
      forgeQuestionsReport,
      activePowerups: activeSession.activePowerups || [],
      quizCorrect,
      forgeCorrect,
      quizTotal: quizQuestionsReport.length,
      forgeTotal: forgeQuestionsReport.length,
      speedBonus: forgeResponses.reduce(
        (sum, r) => sum + (r.scoreBreakdown?.speedBonus || 0), 0
      ),
    }
  }, [activeSession, benchmark, totalScore])

  if (!lastResult) return null

  return (
    <div className="flex flex-col relative items-center w-full max-w-lg mx-auto">
      {/* Confetti for high tiers */}
      {isHighTier && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={180} />
        </div>
      )}

      {/* ─── Hero Section: Score + Benchmark ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center pt-6 pb-8 relative"
      >
        {/* Ambient glow behind score */}
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
          style={{ background: bench.glow }}
        />

        {/* Benchmark icon in glass circle */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="relative mb-3"
        >
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${bench.glow} 0%, transparent 70%)`,
              border: `2px solid ${bench.color}40`,
            }}
          >
            <BenchIcon size={32} style={{ color: bench.color }} strokeWidth={1.8} />
          </div>
        </motion.div>

        {/* Tier label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs font-bold uppercase tracking-[0.25em] mb-1"
          style={{ color: bench.color }}
        >
          {bench.label}
        </motion.p>

        {/* Huge score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
          className="flex items-baseline gap-1.5"
        >
          <span
            className={`text-7xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b ${bench.accent}`}
          >
            <AnimatedNumber value={totalScore} />
          </span>
          <span className="text-lg font-bold text-white/30 uppercase tracking-wider">rqm</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[11px] text-slate-500 mt-2 font-medium"
        >
          Solo Drill Complete
        </motion.p>
      </motion.div>

      {/* ─── Score Breakdown Chips ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full px-5 mb-5"
      >
        <div className="flex gap-2.5">
          {/* Forge chip */}
          <div
            className="flex-1 rounded-2xl p-4 text-center relative overflow-hidden"
            style={{ backgroundColor: 'rgba(20, 184, 166, 0.06)' }}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500/40 to-transparent" />
            <Zap size={14} className="mx-auto mb-1.5 text-teal-400" />
            <p className="text-[9px] text-teal-300/60 uppercase tracking-[0.2em] font-bold mb-1">Forge</p>
            <p className="text-2xl font-black text-white tabular-nums">{forgeScore}</p>
            {detailedReport && (
              <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                {detailedReport.forgeCorrect}/{detailedReport.forgeTotal} correct
              </p>
            )}
          </div>

          {/* Quiz chip */}
          <div
            className="flex-1 rounded-2xl p-4 text-center relative overflow-hidden"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.06)' }}
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/40 to-transparent" />
            <Brain size={14} className="mx-auto mb-1.5 text-indigo-400" />
            <p className="text-[9px] text-indigo-300/60 uppercase tracking-[0.2em] font-bold mb-1">Quiz</p>
            <p className="text-2xl font-black text-white tabular-nums">{quizScore}</p>
            {detailedReport && (
              <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                {detailedReport.quizCorrect}/{detailedReport.quizTotal} correct
              </p>
            )}
          </div>
        </div>

        {/* Bonus row */}
        {detailedReport?.speedBonus > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-1.5 mt-3"
          >
            <Flame size={12} className="text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-300/70">Speed +{detailedReport.speedBonus}</span>
          </motion.div>
        )}
      </motion.div>

      {/* ─── Detailed Report (Expandable) ─── */}
      {!detailedReport && sessionId && (
        <div className="w-full px-5 mb-4">
          <div className="rounded-2xl py-4 text-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">Loading report…</p>
          </div>
        </div>
      )}

      {detailedReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full px-5 mb-5"
        >
          {/* Toggle header */}
          <button
            onClick={() => setShowReport(p => !p)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-150 group"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase tracking-[0.15em] font-bold text-slate-300 group-hover:text-white transition-colors">
                Q&A Review
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums"
                style={{
                  backgroundColor: 'rgba(34,211,238,0.12)',
                  color: '#67e8f9',
                }}
              >
                {(detailedReport.forgeTotal || 0) + (detailedReport.quizTotal || 0)}
              </span>
            </div>
            <ChevronDown
              size={18}
              className="text-cyan-400/70 group-hover:text-cyan-300 transition-all duration-200"
              style={{ transform: showReport ? 'rotate(180deg)' : 'rotate(0)' }}
            />
          </button>

          <AnimatePresence>
            {showReport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pb-2">
                  {/* Forge questions */}
                  {detailedReport.forgeQuestionsReport.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-teal-400/60 mb-2 flex items-center gap-1.5">
                        <Zap size={10} />
                        Forge Questions
                      </p>
                      <div className="space-y-1.5">
                        {detailedReport.forgeQuestionsReport.map((q, i) => (
                          <QARow key={`f-${i}`} q={q} index={i} isForge={true} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quiz questions */}
                  {detailedReport.quizQuestionsReport.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-indigo-400/60 mb-2 flex items-center gap-1.5">
                        <Brain size={10} />
                        Quiz Questions
                      </p>
                      <div className="space-y-1.5">
                        {detailedReport.quizQuestionsReport.map((q, i) => (
                          <QARow key={`q-${i}`} q={q} index={i} isForge={false} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Powerups used */}
                  {detailedReport.activePowerups.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-slate-500 mb-2">
                        Powerups Used
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {detailedReport.activePowerups.map((p, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: p.used ? 'rgba(52,211,153,0.08)' : 'rgba(100,116,139,0.1)',
                              color: p.used ? '#6ee7b7' : '#64748b',
                            }}
                          >
                            {p.used ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                            {p.powerupId?.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Separator ─── */}
      <div className="w-full px-5">
        <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(148,163,184,0.15), transparent)' }} />
      </div>

      {/* ─── Actions ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full px-5 pt-5 pb-6 flex flex-col gap-2.5"
      >
        <motion.button
          onClick={resetDrill}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm transition-all"
          style={{
            background: `linear-gradient(135deg, ${bench.color}dd 0%, ${bench.color}88 100%)`,
            boxShadow: `0 8px 24px ${bench.glow}`,
          }}
        >
          <RotateCcw size={16} />
          Drill Again
        </motion.button>

        <button
          onClick={closeDrillModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-all"
        >
          <X size={14} />
          Close
        </button>
      </motion.div>
    </div>
  )
}

export default SoloDrillResults
