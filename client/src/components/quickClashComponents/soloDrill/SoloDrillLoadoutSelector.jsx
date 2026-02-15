import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Clock, Target, Eye, X, Play } from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'

const POWERUPS = [
  { id: 'TIME_WARP', name: 'Time Warp', cost: 12, type: 'active', phase: 'both', icon: Clock, desc: '+15s to timer', accent: '#60A5FA' },
  { id: 'SCORE_SURGE', name: 'Score Surge', cost: 10, type: 'active', phase: 'both', icon: Zap, desc: '2x Forge / 1.1x Quiz', accent: '#FBBF24' },
  { id: 'ORACLES_EYE', name: "Oracle's Eye", cost: 8, type: 'active', phase: 'both', icon: Eye, desc: 'Remove 2 wrong options', accent: '#A855F7' },
  { id: 'STREAK_SHIELD', name: 'Streak Shield', cost: 5, type: 'passive', phase: 'forge', icon: Shield, desc: 'Protect streak on miss', accent: '#22C55E' },
  { id: 'PRECISION_PROTOCOL', name: 'Precision', cost: 12, type: 'passive', phase: 'quiz', icon: Target, desc: '+50 RQM if perfect', accent: '#F97316' },
]

const SINGLE_EQUIP_POWERUPS = new Set([
  'SCORE_SURGE',
  'STREAK_SHIELD',
  'PRECISION_PROTOCOL',
])

const SoloDrillLoadoutSelector = () => {
  const {
    selectedCategory,
    startSession,
    loading,
    error,
    goToCustomInput,
    setLoadout,
  } = useSoloDrill()

  const [loadout, setLocalLoadout] = useState([])
  const housingUsed = loadout.reduce((sum, item) => sum + item.cost, 0)
  const HOUSING_LIMIT = 30
  const housingPercent = Math.min(100, (housingUsed / HOUSING_LIMIT) * 100)
  const selectedCountById = useMemo(() => {
    return loadout.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] || 0) + 1
      return acc
    }, {})
  }, [loadout])

  const handleAdd = (powerup) => {
    const alreadySelected = selectedCountById[powerup.id] || 0
    const isSingleEquip = SINGLE_EQUIP_POWERUPS.has(powerup.id)
    if (isSingleEquip && alreadySelected > 0) return
    if (housingUsed + powerup.cost <= HOUSING_LIMIT) {
      setLocalLoadout([...loadout, { ...powerup, uniqueId: Date.now() + Math.random() }])
    }
  }

  const handleRemove = (uniqueId) => {
    setLocalLoadout(loadout.filter(p => p.uniqueId !== uniqueId))
  }

  const handleStart = () => {
    const formattedLoadout = loadout.map(p => ({
      powerupId: p.id,
      type: p.type,
      cost: p.cost,
      phase: p.phase,
    }))

    if (selectedCategory === 'Custom') {
      // Save loadout to Redux so CustomDrillInput can read it
      setLoadout(formattedLoadout)
      goToCustomInput()
      return
    }

    startSession(selectedCategory, formattedLoadout)
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-5">
      {/* Header with category */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 mb-1">Loadout</p>
        <p className="text-sm text-slate-400">
          Category: <span className="font-semibold text-cyan-300 capitalize">{selectedCategory}</span>
        </p>
      </div>

      {/* Housing Capacity — inline, not a card */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold text-slate-300">Housing</span>
          <span className={`text-sm font-bold tabular-nums ${housingUsed > HOUSING_LIMIT ? 'text-red-400' : 'text-white'}`}>
            {housingUsed}<span className="text-slate-500 font-normal"> / {HOUSING_LIMIT}</span>
          </span>
        </div>

        {/* Segmented capacity bar */}
        <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${housingUsed > HOUSING_LIMIT ? 'bg-red-500' : 'bg-gradient-to-r from-teal-400 to-cyan-400'}`}
            style={{
              width: `${housingPercent}%`,
              boxShadow: housingUsed > 0 ? (housingUsed > HOUSING_LIMIT ? '0 0 8px rgba(239,68,68,0.35)' : '0 0 8px rgba(34,211,238,0.35)') : 'none'
            }}
          />
        </div>
      </div>

      {/* Powerup Grid */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 mb-3">Powerups</p>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {POWERUPS.map(p => {
            const selectedCount = selectedCountById[p.id] || 0
            const isSingleEquip = SINGLE_EQUIP_POWERUPS.has(p.id)
            const isSingleAlreadyEquipped = isSingleEquip && selectedCount > 0
            const canAfford = housingUsed + p.cost <= HOUSING_LIMIT
            const canEquip = canAfford && !isSingleAlreadyEquipped

            return (
              <motion.button
                key={p.id}
                onClick={() => handleAdd(p)}
                disabled={!canEquip}
                whileHover={canEquip ? { scale: 1.03 } : {}}
                whileTap={canEquip ? { scale: 0.97 } : {}}
                className={`
                  relative flex flex-col items-start justify-between p-3 rounded-2xl transition-all duration-200 min-h-[120px] text-left
                  ${!canEquip
                    ? 'opacity-35 cursor-not-allowed'
                    : 'cursor-pointer'}
                `}
                style={{
                  backgroundColor: canEquip && selectedCount > 0
                    ? `${p.accent}10`
                    : 'rgba(30, 41, 59, 0.45)',
                  boxShadow: canEquip && selectedCount > 0
                    ? `inset 0 1px 0 ${p.accent}40, 0 4px 20px ${p.accent}12`
                    : '0 2px 12px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${p.accent}15` }}
                >
                  <p.icon size={17} style={{ color: p.accent }} />
                </div>

                <div className="mt-2">
                  <p className="text-sm font-semibold text-slate-100 leading-tight">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{p.desc}</p>
                  {isSingleEquip && (
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide font-semibold" style={{ color: `${p.accent}88` }}>single</p>
                  )}
                </div>

                <div className="mt-2 w-full flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400">{p.cost} pts</p>
                  {selectedCount > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                      style={{ backgroundColor: `${p.accent}20`, color: p.accent }}
                    >
                      x{selectedCount}
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Equipped Tray */}
      {loadout.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 mb-2">Equipped</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {loadout.map((item) => (
                <motion.div
                  key={item.uniqueId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  layout
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] sm:text-xs font-medium"
                  style={{
                    backgroundColor: `${item.accent}12`,
                    color: item.accent,
                  }}
                >
                  <span>{item.name}</span>
                  <button
                    onClick={() => handleRemove(item.uniqueId)}
                    className="p-0.5 rounded-full hover:bg-white/10 text-current opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Start Drill */}
      <motion.button
        onClick={handleStart}
        disabled={loading}
        whileHover={!loading ? { scale: 1.01, y: -2 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className="relative w-full h-12 rounded-xl text-white font-bold text-sm sm:text-base overflow-hidden disabled:opacity-45 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #0284C7 100%)',
          boxShadow: loading ? 'none' : '0 8px 28px rgba(6,182,212,0.25)',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/10" />
        <div className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Play size={18} className="text-white" />
              Start Drill
            </>
          )}
        </div>
      </motion.button>

      {error && (
        <p className="text-red-300 text-xs sm:text-sm text-center font-medium bg-red-950/25 py-1.5 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}

export default SoloDrillLoadoutSelector
