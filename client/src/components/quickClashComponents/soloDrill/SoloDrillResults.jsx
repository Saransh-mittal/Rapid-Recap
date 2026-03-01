import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw, ChevronDown, Activity, Zap, Brain,
  Target, Shield, Award, Star, Flame, Swords, Check, X,
  TrendingUp, Clock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSoloDrill from '../../../customHooks/useSoloDrill'

// --- PREMIUM SLEEK STYLES ---
const sleekStyles = `
.sleek-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);
}

.sleek-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background-color 0.2s ease;
}

.sleek-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.sleek-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.sleek-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.text-gradient {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
`

/* ─── Benchmark Configs ─── */
const BENCH = {
  diamond: { icon: Target, label: 'Diamond', hex: '#22d3ee', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]' },
  gold:    { icon: Star,   label: 'Gold',    hex: '#fbbf24', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' },
  silver:  { icon: Shield, label: 'Silver',  hex: '#94a3b8', text: 'text-slate-300', glow: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]' },
  bronze:  { icon: Award,  label: 'Bronze',  hex: '#f97316', text: 'text-orange-400', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' },
  rookie:  { icon: Activity, label: 'Rookie', hex: '#a78bfa', text: 'text-violet-400', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.3)]' },
}

/* ─── Single Q&A Row (Ultra Minimal) ─── */
const QARow = ({ q, index, isForge }) => {
  const [open, setOpen] = useState(false)

  const optionEntries = useMemo(() => {
    if (Array.isArray(q.options)) {
      return q.options.map((text, i) => ({ key: String.fromCharCode(65 + i), text }))
    }
    if (q.options && typeof q.options === 'object') {
      return Object.entries(q.options).map(([k, v]) => ({ key: k.toUpperCase(), text: v }))
    }
    return []
  }, [q.options])

  const correctAnswer = q.answer || ''
  const userAnswer = q.userAnswer || ''
  const isCorrect = q.isCorrect

  const getRealityCheck = (isCorrect, confidence, telemetry = {}) => {
    if (confidence === undefined || confidence === null) return null;
    const { fidgetTouches = 0, tapDuration = 0, screenFreezeDuration = 0, swaps = 0 } = telemetry;

    let insights = [];
    if (swaps > 0) insights.push('Swapped answer.');
    if (fidgetTouches > 0) insights.push('Fidgeting detected.');
    if (screenFreezeDuration > 1500) insights.push('Screen frozen.');
    if (tapDuration > 1000) insights.push('Long tap duration.');

    let detailText = insights.length > 0 ? insights.join(' ') : (confidence < 100) ? 'Time penalty applied.' : (isCorrect ? 'Seamless execution.' : 'Confident but incorrect.');

    if (isCorrect && confidence >= 80) return { title: 'Mastery', color: 'text-emerald-400', desc: detailText }
    if (isCorrect && confidence < 80) return { title: 'Hesitant', color: 'text-amber-400', desc: `Correct. ${detailText}` }
    if (!isCorrect && confidence >= 80) return { title: 'Oversight', color: 'text-rose-400', desc: `Wrong. ${detailText}` }
    if (!isCorrect && confidence < 80) return { title: 'Knowledge Gap', color: 'text-indigo-400', desc: `Uncertain & Wrong. ${detailText}` }
    return { title: 'Steady', color: 'text-sky-400', desc: 'Balanced approach.' }
  }

  const realityCheck = getRealityCheck(q.isCorrect, q.confidenceScore, q.telemetry)

  return (
    <div className="sleek-row py-4 px-2 group cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-start gap-4 w-full">
        {/* Number & Icon */}
        <div className="flex flex-col items-center mt-1">
          <span className="text-[10px] font-medium text-slate-500 mb-1 leading-none">{String(index + 1).padStart(2, '0')}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-baseline justify-between gap-4 mb-1">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">{isForge ? 'Forge' : 'Quiz'}</span>
            <div className="flex gap-3 text-[10px] font-semibold tracking-wider text-slate-300">
              {q.confidenceScore != null && <span>CNF <span className="text-white">{q.confidenceScore}%</span></span>}
              {q.score != null && q.score > 0 && <span>+<span className="text-white">{q.score}</span> PTS</span>}
            </div>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-snug group-hover:text-white transition-colors">{q.question}</p>
        </div>

        <ChevronDown size={14} className="text-slate-600 mt-2 transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-8 pr-4 pt-4 pb-2 space-y-4">
              <p className="text-[14px] text-slate-200 leading-relaxed font-normal">{q.question}</p>

              {realityCheck && (
                <div className="mt-1 mb-2 pt-1 pb-1 pl-3 border-l-2 border-white/10">
                  <h4 className={`text-[10px] font-bold tracking-wider uppercase mb-0.5 ${realityCheck.color}`}>
                    {realityCheck.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                    {realityCheck.desc}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-1.5">
                {optionEntries.map(({ key, text }) => {
                  const normKey = key.toLowerCase()
                  const normCorrect = correctAnswer.toLowerCase?.() ?? ''
                  const normUser = userAnswer.toLowerCase?.() ?? ''
                  const isCorrectOpt = isForge ? text === correctAnswer : normKey === normCorrect
                  const isUserOpt = isForge ? text === userAnswer : normKey === normUser

                  return (
                    <div key={key} className={`flex items-start gap-3 p-2.5 rounded-md text-[14px] transition-colors ${isCorrectOpt ? 'bg-emerald-500/15 text-emerald-200' : isUserOpt && !q.isCorrect ? 'bg-rose-500/15 text-rose-200' : 'text-slate-200'}`}>
                      <span className="font-semibold opacity-60 min-w-[1.2rem]">{key}.</span>
                      <span className="font-normal leading-snug flex-1">{text}</span>
                      {isUserOpt && <span className="text-[9px] uppercase tracking-widest font-bold opacity-70 mt-0.5">Selected</span>}
                    </div>
                  )
                })}
              </div>

              {q.explanation && (
                <div className="mt-2 pt-3 border-t border-white/10 text-[13px] text-slate-300 font-normal flex items-start gap-2">
                  <Brain size={14} className="mt-0.5 opacity-60 flex-shrink-0" />
                  <span className="leading-relaxed">{q.explanation}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Results Component ─── */
const SoloDrillResults = () => {
  const navigate = useNavigate()
  const { lastResult, activeSession, sessionId, resumeSession, resetDrill, closeDrillModal, fetchLimits } = useSoloDrill()
  const reportFetchStartedRef = useRef(false)
  const limitsFetchStartedRef = useRef(false)

  useEffect(() => {
    if (limitsFetchStartedRef.current) return
    limitsFetchStartedRef.current = true
    fetchLimits()
  }, [fetchLimits])

  useEffect(() => {
    if (!sessionId || reportFetchStartedRef.current) return
    reportFetchStartedRef.current = true
    resumeSession(sessionId)
  }, [sessionId, resumeSession])

  const totalScore = lastResult?.totalScore || 0
  const benchmark = lastResult?.benchmark || 'rookie'
  const forgeScore = lastResult?.forgeScore || 0
  const quizScore = lastResult?.quizScore || 0
  const bench = BENCH[benchmark] || BENCH.rookie

  const detailedReport = useMemo(() => {
    if (!activeSession?.forgeArticle) return null

    const quizQuestions = activeSession.forgeArticle?.quickClashQuiz?.questions || []
    const quizResponses = activeSession.quizAttempt?.responses || []
    const quizQuestionsReport = quizResponses.map(response => {
      const question = quizQuestions.find(q => q._id?.toString?.() === response.questionId?.toString?.())
      return {
        question: question?.question || 'Question unavailable',
        options: question?.options || { a: '', b: '', c: '', d: '' },
        answer: question?.answer || question?.correctAnswer || '',
        explanation: question?.explanation || 'No explanation available',
        userAnswer: response.userAnswer || '',
        isCorrect: !!response.isCorrect,
        confidenceScore: response.confidenceScore,
        telemetry: response.telemetry
      }
    })

    const sections = activeSession.forgeArticle?.sections || []
    const forgeResponses = activeSession.forgeProgress?.responses || []
    const forgeQuestionsReport = forgeResponses.map(response => {
      const byNumber = sections.find(s => s.sectionNumber === response.sectionNumber)
      const byIndex = sections[response.sectionNumber]
      const section = byNumber || byIndex
      const options = section?.mcq?.options || []
      const correctIndex = typeof section?.mcq?.correctIndex === 'number' ? section.mcq.correctIndex : section?.mcq?.correctOptionIndex

      return {
        question: section?.mcq?.question || 'Forge question unavailable',
        options,
        userAnswer: typeof response.userAnswer === 'number' && options[response.userAnswer] ? options[response.userAnswer] : 'Not answered',
        answer: typeof correctIndex === 'number' && options[correctIndex] ? options[correctIndex] : 'N/A',
        isCorrect: !!response.isCorrect,
        confidenceScore: response.confidenceScore,
        score: response.scoreBreakdown?.total || 0,
        telemetry: response.telemetry,
        explanation: section?.mcq?.contextNugget || section?.mcq?.hint || section?.title || 'No explanation available',
      }
    })

    const quizCorrect = quizQuestionsReport.filter(q => q.isCorrect).length
    const forgeCorrect = forgeQuestionsReport.filter(q => q.isCorrect).length
    const quizTotal = quizQuestionsReport.length
    const forgeTotal = forgeQuestionsReport.length

    const quizConfidenceSum = quizResponses.reduce((sum, r) => sum + (typeof r.confidenceScore === 'number' ? r.confidenceScore : 0), 0)
    const forgeConfidenceSum = forgeResponses.reduce((sum, r) => sum + (typeof r.confidenceScore === 'number' ? r.confidenceScore : 0), 0)
    const validConfidencesCount = [...quizResponses, ...forgeResponses].filter(r => typeof r.confidenceScore === 'number').length
    const averageConfidence = validConfidencesCount > 0 ? Math.round((quizConfidenceSum + forgeConfidenceSum) / validConfidencesCount) : null

    return {
      quizQuestionsReport, forgeQuestionsReport,
      quizCorrect, forgeCorrect, quizTotal, forgeTotal,
      speedBonus: forgeResponses.reduce((sum, r) => sum + (r.scoreBreakdown?.speedBonus || 0), 0),
      averageConfidence
    }
  }, [activeSession])

  if (!lastResult) return null

  const overallAccuracy = detailedReport && (detailedReport.quizTotal + detailedReport.forgeTotal) > 0
    ? ((detailedReport.quizCorrect + detailedReport.forgeCorrect) / (detailedReport.quizTotal + detailedReport.forgeTotal)) * 100 : 0

  const getOverallProfile = (accuracy, confidence) => {
    if (confidence == null) return null
    const isPassing = accuracy >= 50
    if (isPassing && confidence >= 80) return { title: 'Sharpshooter', bg: 'bg-emerald-500', desc: 'Incredible speed. Zero hesitation.' }
    if (isPassing && confidence < 50) return { title: 'Survivor', bg: 'bg-amber-500', desc: 'Accurate, but biometric data indicates severe guessing.' }
    if (!isPassing && confidence >= 80) return { title: 'Ghost', bg: 'bg-rose-500', desc: 'Overconfident execution, but missed targets.' }
    if (!isPassing && confidence < 50) return { title: 'Rookie', bg: 'bg-indigo-500', desc: 'Heavy hesitation. Low hit rate. Needs recalibration.' }
    return { title: 'Standard', bg: 'bg-sky-500', desc: 'Nominal tactical execution.' }
  }

  const overallProfile = getOverallProfile(overallAccuracy, detailedReport?.averageConfidence)
  const BenchIcon = bench.icon

  return (
    <div className="w-full h-full flex flex-col gap-6 text-slate-100 pb-20 selection:bg-cyan-500/30 font-sans">
      <style>{sleekStyles}</style>

      {/* SLEEK HERO COMPONENT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="sleek-panel rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]"
      >
        {/* Very subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[80px] opacity-20 pointer-events-none rounded-full" style={{ background: bench.hex }} />

        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-500 mb-6 relative z-10">Mission Complete</span>

        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-[80px] md:text-[120px] font-light tracking-tight text-white">{totalScore}</span>
            <span className="text-xl font-normal text-slate-500 uppercase tracking-wider">RQM</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 relative z-10">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
            <BenchIcon size={12} className={bench.text} />
            <span className={`text-[10px] uppercase font-medium tracking-widest ${bench.text}`}>{bench.label} Tier</span>
          </div>

          {overallProfile && (
            <div className="flex flex-col items-center gap-2 mt-4 max-w-xs text-center">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                <div className={`w-1.5 h-1.5 rounded-full ${overallProfile.bg}`} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">{overallProfile.title} Class</span>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed">{overallProfile.desc}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* SLEEK COMPACT METRICS */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3">
        <div className="sleek-panel rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Zap size={14} className="text-teal-400 mb-2 opacity-80" />
          <span className="text-2xl font-light text-slate-200">{forgeScore}</span>
          <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Forge</span>
        </div>
        <div className="sleek-panel rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Brain size={14} className="text-indigo-400 mb-2 opacity-80" />
          <span className="text-2xl font-light text-slate-200">{quizScore}</span>
          <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Quiz</span>
        </div>
        <div className="sleek-panel rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Target size={14} className="text-pink-400 mb-2 opacity-80" />
          <span className="text-2xl font-light text-slate-200">{detailedReport?.averageConfidence || '--'}%</span>
          <span className="text-[8px] uppercase tracking-widest text-slate-500 mt-1 whitespace-nowrap">Confidence </span>
        </div>
      </motion.div>

      {/* SLEEK ACTIONS */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-3 mt-2">
        <button onClick={resetDrill} className="sleek-button rounded-2xl py-3.5 flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-slate-300">
          <RotateCcw size={14} /> New Drill
        </button>
        <button
          onClick={() => {
            closeDrillModal();
            navigate('/quickclash', { state: { autoMatchmaking: true } })
          }}
          className="sleek-button rounded-2xl py-3.5 flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-cyan-300"
          style={{ background: 'rgba(34, 211, 238, 0.05)' }}
        >
          <Swords size={14} /> Battle
        </button>
      </motion.div>

      {/* SLEEK LOG LIST */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 sleek-panel rounded-3xl overflow-hidden p-2">
        <div className="px-4 py-4 flex items-center justify-between border-b border-white/[0.04]">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">Execution Log</h2>
          {detailedReport && (
            <span className="text-[10px] font-medium text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-md">
              {detailedReport.forgeTotal + detailedReport.quizTotal} Items
            </span>
          )}
        </div>

        {!detailedReport ? (
          <div className="py-12 flex items-center justify-center">
             <span className="text-[10px] uppercase tracking-widest text-slate-500">Loading Data...</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {detailedReport.forgeQuestionsReport.map((q, i) => <QARow key={`f-${i}`} q={q} index={i} isForge={true} />)}
            {detailedReport.quizQuestionsReport.map((q, i) => <QARow key={`q-${i}`} q={q} index={i} isForge={false} />)}
          </div>
        )}
      </motion.div>

    </div>
  )
}

export default SoloDrillResults
