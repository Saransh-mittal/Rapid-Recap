import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Trophy, Zap, Brain, ArrowLeft, BookOpen } from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'
import { getCategoryInfo } from '../team/teamBattlePageComponents/categoriesSection/categoryUtils'

const BENCHMARK_CONFIG = {
  diamond: { label: 'Diamond', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  gold: { label: 'Gold', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  silver: { label: 'Silver', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  bronze: { label: 'Bronze', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  rookie: { label: 'Rookie', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
}

/* ─── Helper: find article section by sectionNumber ─── */
const findSection = (article, sectionNumber) =>
  article?.sections?.find(s => s.sectionNumber === sectionNumber)

/* ─── Helper: find quiz question by ID ─── */
const findQuizQuestion = (article, questionId) =>
  article?.quickClashQuiz?.questions?.find(q => q._id === questionId)

/* ─── Helper: get correct forge answer index ─── */
const getForgeCorrectIndex = (section) => {
  if (!section?.mcq) return null
  if (typeof section.mcq.correctAnswer === 'number') return section.mcq.correctAnswer
  if (typeof section.mcq.correctIndex === 'number') return section.mcq.correctIndex
  return null
}

/* ─── Forge Response Row (expanded detail) ─── */
const ForgeResponseDetail = ({ response, article }) => {
  const [showContent, setShowContent] = useState(false)
  const section = findSection(article, response.sectionNumber)
  if (!section) return null

  const question = section.mcq?.question || 'Question unavailable'
  const options = section.mcq?.options || []
  const correctIdx = getForgeCorrectIndex(section)
  const content = section.content
  const keyPoints = section.keyPoints || []
  const title = section.title || `Section ${response.sectionNumber}`

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
      <div className="px-3 py-2.5">
        {/* Section title + result badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{
                backgroundColor: response.isCorrect ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                color: response.isCorrect ? '#34d399' : '#f87171',
              }}
            >
              {response.isCorrect ? '✓' : '✗'}
            </div>
            <span className="text-xs font-semibold text-white truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {response.scoreBreakdown && (
              <span className="text-xs font-bold text-slate-300 tabular-nums">+{response.scoreBreakdown.total}</span>
            )}
            {response.timeSpent != null && (
              <span className="text-[10px] text-slate-500 tabular-nums">{(response.timeSpent / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>

        {/* Question */}
        <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{question}</p>

        {/* Options */}
        <div className="space-y-1">
          {options.map((opt, i) => {
            const isUserAnswer = i === response.userAnswer
            const isCorrectOpt = i === correctIdx
            let bg = 'rgba(30, 41, 59, 0.4)'
            let textColor = '#94a3b8'
            let borderL = 'transparent'

            if (isCorrectOpt) {
              bg = 'rgba(52, 211, 153, 0.08)'
              textColor = '#6ee7b7'
              borderL = '#34d399'
            } else if (isUserAnswer && !response.isCorrect) {
              bg = 'rgba(248, 113, 113, 0.08)'
              textColor = '#fca5a5'
              borderL = '#f87171'
            }

            return (
              <div
                key={i}
                className="flex items-center gap-2 py-1 px-2 rounded-lg text-[11px]"
                style={{ backgroundColor: bg, borderLeft: `2px solid ${borderL}`, color: textColor }}
              >
                <span className="font-bold opacity-50 w-3">{String.fromCharCode(65 + i)}</span>
                <span className="flex-1">{opt}</span>
                {isUserAnswer && <span className="text-[9px] opacity-60">your answer</span>}
              </div>
            )
          })}
        </div>

        {/* Revealed content toggle */}
        {(content || keyPoints.length > 0) && (
          <button
            onClick={() => setShowContent(prev => !prev)}
            className="mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 hover:text-cyan-300 transition-colors"
          >
            <BookOpen size={10} />
            <span>{showContent ? 'Hide' : 'Show'} reading content</span>
          </button>
        )}

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 pt-2 border-t border-white/5">
                {content && (
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2 whitespace-pre-line">{content}</p>
                )}
                {keyPoints.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Key Points</p>
                    {keyPoints.map((kp, i) => (
                      <p key={i} className="text-[11px] text-slate-400 pl-2" style={{ borderLeft: '2px solid rgba(34,211,238,0.2)' }}>
                        {kp}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Quiz Response Row ─── */
const QuizResponseDetail = ({ response, index, article }) => {
  const question = findQuizQuestion(article, response.questionId)
  const questionText = question?.question || `Question ${index + 1}`
  const options = question?.options || {}
  const correctAnswer = question
    ? (question.correctAnswer || question.answer || null)
    : null

  return (
    <div className="rounded-xl overflow-hidden px-3 py-2.5" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{
              backgroundColor: response.isCorrect ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
              color: response.isCorrect ? '#34d399' : '#f87171',
            }}
          >
            {response.isCorrect ? '✓' : '✗'}
          </div>
          <span className="text-xs font-semibold text-white">Q{index + 1}</span>
        </div>
        {response.userAnswer && (
          <span className="text-[10px] text-slate-500">Answered: <span className="text-slate-300 font-semibold uppercase">{response.userAnswer}</span></span>
        )}
      </div>

      {/* Question text */}
      <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{questionText}</p>

      {/* Options */}
      {Object.keys(options).length > 0 && (
        <div className="space-y-1">
          {Object.entries(options).map(([key, val]) => {
            const isUserAnswer = key === response.userAnswer
            const isCorrectOpt = key === correctAnswer
            let bg = 'rgba(30, 41, 59, 0.4)'
            let textColor = '#94a3b8'
            let borderL = 'transparent'

            if (isCorrectOpt) {
              bg = 'rgba(52, 211, 153, 0.08)'
              textColor = '#6ee7b7'
              borderL = '#34d399'
            } else if (isUserAnswer && !response.isCorrect) {
              bg = 'rgba(248, 113, 113, 0.08)'
              textColor = '#fca5a5'
              borderL = '#f87171'
            }

            return (
              <div
                key={key}
                className="flex items-center gap-2 py-1 px-2 rounded-lg text-[11px]"
                style={{ backgroundColor: bg, borderLeft: `2px solid ${borderL}`, color: textColor }}
              >
                <span className="font-bold opacity-50 w-3 uppercase">{key}</span>
                <span className="flex-1">{val}</span>
                {isUserAnswer && <span className="text-[9px] opacity-60">your answer</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Drill History Card ─── */
const DrillHistoryCard = ({ session }) => {
  const [expanded, setExpanded] = useState(false)

  const categoryInfo = getCategoryInfo(session.category)
  const bench = BENCHMARK_CONFIG[session.benchmark] || BENCHMARK_CONFIG.rookie
  const completedDate = new Date(session.completedAt)
  const dateStr = completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeStr = completedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const forgeResponses = session.forgeProgress?.responses || []
  const quizResponses = session.quizAttempt?.responses || []
  const article = session.forgeArticle
  const articleTitle = article?.title || 'Unknown Article'

  const forgeCorrect = forgeResponses.filter(r => r.isCorrect).length
  const quizCorrect = quizResponses.filter(r => r.isCorrect).length

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)' }}
    >
      {/* Summary row */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors duration-200 hover:bg-white/[0.03]"
      >
        {/* Category icon */}
        <div
          className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${categoryInfo.primaryColor}15`,
            color: categoryInfo.primaryColor,
          }}
        >
          {categoryInfo.iconComponent && <categoryInfo.iconComponent size={20} strokeWidth={2} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate capitalize">
            {session.category}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {articleTitle} · {dateStr} {timeStr}
          </p>
        </div>

        {/* Score + benchmark */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-white tabular-nums">{session.totalScore}</p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: bench.color }}
            >
              {bench.label}
            </p>
          </div>

          <div className="text-slate-500 transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDown size={16} />
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Score breakdown cards */}
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl py-2.5 px-3 text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.08)' }}>
                  <Zap size={14} className="mx-auto mb-1 text-teal-400" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Forge</p>
                  <p className="text-base font-bold text-white">{session.forgeScore}</p>
                  <p className="text-[10px] text-slate-500">{forgeCorrect}/{forgeResponses.length}</p>
                </div>
                <div className="flex-1 rounded-xl py-2.5 px-3 text-center" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                  <Brain size={14} className="mx-auto mb-1 text-indigo-400" />
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Quiz</p>
                  <p className="text-base font-bold text-white">{session.quizScore}</p>
                  <p className="text-[10px] text-slate-500">{quizCorrect}/{quizResponses.length}</p>
                </div>
                {session.forgeProgress?.maxStreak > 0 && (
                  <div className="flex-1 rounded-xl py-2.5 px-3 text-center" style={{ backgroundColor: 'rgba(251, 191, 36, 0.08)' }}>
                    <Trophy size={14} className="mx-auto mb-1 text-amber-400" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Streak</p>
                    <p className="text-base font-bold text-white">{session.forgeProgress.maxStreak}</p>
                    <p className="text-[10px] text-slate-500">max</p>
                  </div>
                )}
              </div>

              {/* Forge responses — full Q&A */}
              {forgeResponses.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-500 mb-2">Forge Questions</p>
                  <div className="space-y-2">
                    {forgeResponses.map((r, i) => (
                      <ForgeResponseDetail key={i} response={r} article={article} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz responses — full Q&A */}
              {quizResponses.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-500 mb-2">Quiz Questions</p>
                  <div className="space-y-2">
                    {quizResponses.map((r, i) => (
                      <QuizResponseDetail key={i} response={r} index={i} article={article} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Main History Component ─── */
const SoloDrillHistory = () => {
  const {
    history,
    historyLoading,
    historyHasMore,
    historyPage,
    historyTotal,
    fetchHistory,
    resetDrill,
  } = useSoloDrill()

  useEffect(() => {
    fetchHistory(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = () => {
    if (!historyLoading && historyHasMore) {
      fetchHistory(historyPage + 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto w-full max-w-4xl flex flex-col gap-5 pb-6"
    >
      {/* Back button */}
      <button
        onClick={resetDrill}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors w-fit -mb-1"
      >
        <ArrowLeft size={14} />
        <span>Back to categories</span>
      </button>

      {/* Stats summary */}
      {historyTotal > 0 && (
        <p className="text-xs text-slate-500 font-medium -mt-2">
          {historyTotal} completed drill{historyTotal !== 1 ? 's' : ''}
        </p>
      )}

      {/* Sessions list */}
      <div className="flex flex-col gap-3">
        {history.map((session) => (
          <DrillHistoryCard key={session._id} session={session} />
        ))}
      </div>

      {/* Empty state */}
      {!historyLoading && history.length === 0 && (
        <div className="py-16 text-center">
          <Trophy size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400 font-medium">No completed drills yet</p>
          <p className="text-xs text-slate-500 mt-1">Complete a drill to see your history here</p>
        </div>
      )}

      {/* Load more */}
      {historyHasMore && (
        <button
          onClick={loadMore}
          disabled={historyLoading}
          className="mx-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: 'rgba(30, 41, 59, 0.45)' }}
        >
          {historyLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full" />
              Loading…
            </span>
          ) : (
            'Load more'
          )}
        </button>
      )}

      {/* Loading indicator for first load */}
      {historyLoading && history.length === 0 && (
        <div className="py-16 text-center">
          <span className="animate-spin inline-block h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full" />
        </div>
      )}
    </motion.div>
  )
}

export default SoloDrillHistory
