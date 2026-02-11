import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import useSoloDrill from '../../../customHooks/useSoloDrill'
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

const MotionButton = motion.button

const SoloDrillButton = ({
  buttonWidth = { base: '100%', md: '50%' },
  onSoloDrillClick,
  isTutorialHighlighted = false,
}) => {
  const {
    fetchLimits,
    openDrillModal
  } = useSoloDrill()

  useEffect(() => {
    fetchLimits()
    // fetchLimits comes from a hook wrapper and is not a stable reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const widthClass = typeof buttonWidth === 'object' ? 'w-full' : 'w-full'
  const handleOpenDrill = () => {
    onSoloDrillClick?.()
    openDrillModal()
  }

  return (
    <MotionButton
      type="button"
      onClick={handleOpenDrill}
      whileHover={{
        scale: 1.02,
        y: -3,
        boxShadow: '0 16px 48px rgba(6,182,212,0.45), 0 0 0 1px rgba(6,182,212,0.30) inset'
      }}
      whileTap={{ scale: 0.98 }}
      animate={isTutorialHighlighted ? { scale: [1, 1.04, 1] } : {}}
      transition={isTutorialHighlighted ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : {}}
      className={`
        ${widthClass}
        ${QUICK_CLASH_CLASSES.focusRing}
        relative overflow-hidden rounded-2xl
        h-[48px] md:h-[56px] px-4 md:px-5 cursor-pointer
        transition-all duration-300
        flex items-center justify-center gap-3
        ${isTutorialHighlighted ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-900' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)',
        boxShadow: isTutorialHighlighted
          ? '0 10px 36px rgba(6,182,212,0.5), 0 0 18px rgba(34,211,238,0.45), 0 0 0 1px rgba(6,182,212,0.25) inset'
          : '0 8px 32px rgba(6,182,212,0.35), 0 0 0 1px rgba(6,182,212,0.15) inset',
      }}
      aria-label="Open solo drill"
    >
      {/* Glass layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/15" />

      {/* Animated shine sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2.5">
        <Target className="w-5 h-5 text-white" strokeWidth={2.4} />
        <span className="font-extrabold tracking-wide text-sm md:text-base text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
          SOLO DRILL
        </span>
      </div>
    </MotionButton>
  )
}

SoloDrillButton.propTypes = {
  buttonWidth: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      base: PropTypes.string,
      md: PropTypes.string,
    }),
  ]),
  onSoloDrillClick: PropTypes.func,
  isTutorialHighlighted: PropTypes.bool,
}

export default SoloDrillButton
