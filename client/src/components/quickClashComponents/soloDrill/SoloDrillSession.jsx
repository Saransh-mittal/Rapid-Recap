import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'
import ForgeReadingPhase from '../forge/ForgeReadingPhase'
import GamifiedQuiz from '../../quizComponents/GamifiedQuiz'
import forgeService from '../../../services/forgeService'
import { quizAudioService } from '../../../services/quizAudioService'

/* Full-screen pause overlay — rendered at session level for both phases */
const PauseOverlay = ({ isPaused, onTogglePause, onClose }) => {
  if (!isPaused) return null
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800/90 backdrop-blur-xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.50)]">
        <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400" />
        <div className="p-6 text-center">
          <p className="text-cyan-300/80 text-[11px] uppercase tracking-[0.22em] font-semibold">Solo Drill</p>
          <h3 className="mt-1.5 text-2xl font-extrabold text-white">Paused</h3>
          <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">Your timers are frozen. Resume whenever you are ready.</p>
          <motion.button
            type="button"
            onClick={onTogglePause}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-5 w-full h-12 rounded-xl text-white font-bold text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)',
              boxShadow: '0 6px 20px rgba(6,182,212,0.25)',
            }}
          >
            Resume Drill
          </motion.button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-2.5 w-full h-10 rounded-xl bg-slate-700/50 hover:bg-slate-700/80 text-slate-300 hover:text-white font-semibold text-sm transition-all duration-200"
            >
              Close Drill
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const SoloDrillSession = ({ onClose = null }) => {
    const {
        sessionId,
        phase,
        activeSession,
        initialForgeQuestion,
        resumeSession,
        setQuizResult,
        loading,
        markPowerupUsed
    } = useSoloDrill()

    const [quizTimeLeft, setQuizTimeLeft] = useState(50)
    const [, setQuizLoading] = useState(false)
    const [quizInitSessionId, setQuizInitSessionId] = useState(null)
    const [timeWarpApplied, setTimeWarpApplied] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const noop = useCallback(() => {}, [])
    const handleTogglePause = useCallback(() => {
        setIsPaused(prev => !prev)
    }, [])

    useEffect(() => {
        setIsPaused(false)
    }, [phase, sessionId])

    useEffect(() => {
        if (phase !== 'quiz' || !sessionId || !activeSession) return
        if (quizInitSessionId === sessionId) return

        setQuizInitSessionId(sessionId)

        const quizPowerups = activeSession.activePowerups || activeSession.loadout || []
        const availableTimeWarps = quizPowerups.filter(
            p =>
                p.powerupId === 'TIME_WARP' &&
                !p.used &&
                (p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both')
        )

        if (availableTimeWarps.length === 0) {
            setQuizTimeLeft(50)
            setTimeWarpApplied(false)
            return
        }

        const totalBonusSeconds = availableTimeWarps.length * 15
        setQuizTimeLeft(50 + totalBonusSeconds)
        setTimeWarpApplied(true)
        quizAudioService.playTimeWarp()

        let cancelled = false

        const persistTimeWarpUsage = async () => {
            for (let i = 0; i < availableTimeWarps.length; i += 1) {
                try {
                    await forgeService.usePowerup(sessionId, 'TIME_WARP', { isSoloDrill: true })
                    if (cancelled) return
                    markPowerupUsed('TIME_WARP')
                } catch (error) {
                    if (cancelled) return
                    console.error('[SOLO_DRILL] Failed to persist Time Warp usage:', error)
                    return
                }
            }
        }

        persistTimeWarpUsage()

        return () => {
            cancelled = true
        }
    }, [phase, sessionId, activeSession, quizInitSessionId, markPowerupUsed])

    if (loading || !activeSession) {
        return (
            <div className="relative flex items-center justify-center h-full min-h-[400px]">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 text-white transition-colors flex items-center justify-center"
                        aria-label="Close drill"
                    >
                        <X size={16} />
                    </button>
                )}
                <div className="w-12 h-12 border-4 border-cyan-900/50 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
        )
    }

    const { forgeArticle, forgeProgress } = activeSession

    // Render Forge Phase
    if (phase === 'forge') {
        const currentSectionNum = forgeProgress?.currentSection || 0
        const currentSection = forgeArticle?.sections?.find(s => s.sectionNumber === currentSectionNum)

        if (!currentSection) return (
            <div className="flex items-center justify-center h-full">
                <p className="text-center text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
                    Error loading section
                </p>
            </div>
        )

        return (
            <div className="relative h-full w-full">
                <PauseOverlay isPaused={isPaused} onTogglePause={handleTogglePause} onClose={onClose} />
                <ForgeReadingPhase
                    sessionId={sessionId}
                    category={activeSession.category}
                    isSoloDrill={true}
                    activePowerups={activeSession.activePowerups || activeSession.loadout}
                    initialData={initialForgeQuestion}
                    onComplete={() => resumeSession(sessionId)}
                    onPowerupUsed={markPowerupUsed}
                    isPaused={isPaused}
                    onTogglePause={handleTogglePause}
                    onClose={onClose}
                />
            </div>
        )
    }

    // Render Quiz Phase
    if (phase === 'quiz') {
        return (
            <div className="relative h-full w-full">
                <PauseOverlay isPaused={isPaused} onTogglePause={handleTogglePause} onClose={onClose} />
                <GamifiedQuiz
                    sessionId={sessionId}
                    isSoloDrill={true}
                    activePowerups={activeSession.activePowerups || activeSession.loadout || []}
                    onPowerupUsed={markPowerupUsed}
                    onComplete={setQuizResult}
                    setStopTimerOnQuizSubmit={noop}
                    quizTimeLeft={quizTimeLeft}
                    setQuizTimeLeft={setQuizTimeLeft}
                    setLoadingQuiz={setQuizLoading}
                    timeWarpApplied={timeWarpApplied}
                    isPaused={isPaused}
                    onTogglePause={handleTogglePause}
                    onClose={onClose}
                />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-400">Invalid Phase</p>
        </div>
    )
}

SoloDrillSession.propTypes = {
    onClose: PropTypes.func,
}

export default SoloDrillSession
