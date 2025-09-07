// components/quickClashComponents/team/JoinTeamModal.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { UserPlus, Users, Key, Zap, Crown, Star, X } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install these components:
// npx shadcn-ui@latest add dialog
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add input
// npx shadcn-ui@latest add separator
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

/**
 * Enhanced Join Team Modal - Converted to Tailwind CSS with blue-cyan theme
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui Dialog
 * - Created custom pin input component using standard Input elements
 * - Implemented sophisticated blue-cyan theme with glassmorphic effects
 * - Enhanced animations with floating background elements
 * - Maintained all original functionality and validation
 * - Improved responsive design and accessibility
 * - Added premium visual effects and micro-animations
 */
const JoinTeamModal = ({ isOpen, onClose, onJoin }) => {
  const { t } = useTranslation('QuickClash')
  const [teamCode, setTeamCode] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTeamCode('')
    }
  }, [isOpen])

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 280, damping: 24, mass: 0.9 },
    },
    exit: {
      opacity: 0,
      y: 30,
      scale: 0.92,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
  }

  const starVariants = {
    initial: { scale: 0, rotate: -45, opacity: 0 },
    animate: {
      scale: [0, 1.3, 1],
      rotate: [-45, 15, 0],
      opacity: [0, 1, 1],
      transition: { duration: 0.6, delay: 0.9, ease: [0.25, 1, 0.5, 1] },
    },
  }

  // Custom Pin Input Component
  const PinInput = ({ value, onChange, onComplete, disabled }) => {
    const handleInputChange = (index, inputValue) => {
      const newValue = value.split('')

      // Handle single character input
      if (inputValue.length === 1) {
        newValue[index] = inputValue.toUpperCase()
        const newTeamCode = newValue.join('')
        onChange(newTeamCode)

        // Auto-focus next input
        if (index < 5 && inputValue) {
          const nextInput = document.getElementById(`pin-${index + 1}`)
          if (nextInput) nextInput.focus()
        }

        // Call onComplete when all fields are filled
        if (newTeamCode.length === 6) {
          onComplete(newTeamCode)
        }
      }

      // Handle backspace
      if (inputValue === '' && value[index]) {
        newValue[index] = ''
        onChange(newValue.join(''))

        // Auto-focus previous input on backspace
        if (index > 0) {
          const prevInput = document.getElementById(`pin-${index - 1}`)
          if (prevInput) prevInput.focus()
        }
      }
    }

    const handleKeyDown = (index, e) => {
      // Handle backspace when field is empty
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        const prevInput = document.getElementById(`pin-${index - 1}`)
        if (prevInput) prevInput.focus()
      }

      // Handle paste
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        navigator.clipboard.readText().then(text => {
          const cleanText = text.replace(/\s/g, '').toUpperCase().slice(0, 6)
          onChange(cleanText)
          if (cleanText.length === 6) {
            onComplete(cleanText)
          }
        })
      }
    }

    return (
      <div className="flex justify-center gap-2 sm:gap-3">
        {[0, 1, 2, 3, 4, 5].map(index => (
          <Input
            key={index}
            id={`pin-${index}`}
            type="text"
            maxLength={1}
            value={value[index] || ''}
            onChange={e => handleInputChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            disabled={disabled}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold
              ${QUICK_CLASH_CLASSES.glassMedium}
              border-2 border-cyan-500/25 text-white
              focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50
              hover:border-cyan-400/60 rounded-lg
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            autoFocus={index === 0}
          />
        ))}
      </div>
    )
  }

  const handleSubmit = async e => {
    if (e) e.preventDefault()
    if (teamCode.length !== 6 || loading) return

    setLoading(true)
    try {
      await onJoin(teamCode)
    } catch (error) {
      console.error('Error joining team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTeamCode('')
    onClose()
  }

  const handlePinChange = value => {
    setTeamCode(value)
  }

  const handlePinComplete = value => {
    setTimeout(() => handleSubmit(), 200)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`
          max-w-md overflow-hidden
          ${QUICK_CLASH_CLASSES.glassDark}
          border-2 border-cyan-600/40
          ${QUICK_CLASH_CLASSES.shadowCyan}
          backdrop-brightness-115
          relative
        `}
        asChild
      >
        <MotionDiv
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={`
                absolute -top-32 -left-8 w-64 h-64 opacity-60
                bg-gradient-to-br from-cyan-500/20 to-blue-500/10
                rounded-full blur-3xl
                animate-pulse
              `}
            />
            <div
              className={`
                absolute -bottom-32 -right-8 w-64 h-64 opacity-40
                bg-gradient-to-br from-blue-500/15 to-cyan-500/5
                rounded-full blur-3xl
                animate-pulse
              `}
              style={{ animationDelay: '1s' }}
            />
          </div>

          {/* Enhanced Header */}
          <div
            className={`
            relative border-b border-white/10
            bg-gradient-to-b from-slate-800/30 to-slate-900/20
            -m-6 px-6 pt-6 pb-5 mb-6
          `}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400" />

            <DialogHeader className="space-y-4">
              <div className="flex flex-col items-center">
                <MotionDiv
                  className={`
                    mb-4 p-3 rounded-full relative
                    ${QUICK_CLASH_CLASSES.glassMedium}
                    border border-cyan-400/30
                    ${QUICK_CLASH_CLASSES.shadowCyan}
                  `}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <MotionDiv
                    className="absolute -top-2 -right-2"
                    variants={starVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </MotionDiv>
                </MotionDiv>

                <DialogTitle
                  className={`
                  text-xl font-bold text-center
                  ${QUICK_CLASH_CLASSES.textGradientCyan}
                  mb-2
                `}
                >
                  {t('Join Existing Team')}
                </DialogTitle>

                <DialogDescription
                  className={`
                  ${QUICK_CLASH_CLASSES.textMuted} text-sm text-center
                `}
                >
                  {t('Enter the team code to join your friends')}
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          {/* Form Content */}
          <div className="space-y-6 relative z-10">
            {/* Team Code Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Key className="w-5 h-5 text-blue-300" />
                <label
                  className={`
                  text-lg font-medium ${QUICK_CLASH_CLASSES.textBright}
                `}
                >
                  {t('Enter Team Code')}
                </label>
              </div>

              <PinInput
                value={teamCode}
                onChange={handlePinChange}
                onComplete={handlePinComplete}
                disabled={loading}
              />

              <p
                className={`text-xs text-center ${QUICK_CLASH_CLASSES.textMuted}`}
              >
                {t('Enter the 6-character code to join a team')}
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Team Information */}
            <div
              className={`
              p-4 rounded-xl relative overflow-hidden
              ${QUICK_CLASH_CLASSES.glassMedium}
              border border-white/10
              backdrop-brightness-110
            `}
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-300" />
                    <h4
                      className={`font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}
                    >
                      {t('Team Information')}
                    </h4>
                  </div>
                  <div className="h-1 w-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-blue-300 flex-shrink-0" />
                    <p
                      className={`text-sm ${QUICK_CLASH_CLASSES.textSecondary}`}
                    >
                      {t('You can get a team code from a team leader')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-blue-300 flex-shrink-0" />
                    <p
                      className={`text-sm ${QUICK_CLASH_CLASSES.textSecondary}`}
                    >
                      {t('Teams can have up to 4 members')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <DialogFooter className="gap-3 pt-6 border-t border-white/10 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className={`
                ${QUICK_CLASH_CLASSES.glassMedium}
                border border-white/20 text-white/70 hover:text-white
                hover:bg-white/10 hover:border-white/30
                ${QUICK_CLASH_CLASSES.focusRing}
                transition-all duration-200
                hover:scale-105
              `}
            >
              {t('Cancel')}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={teamCode.length !== 6 || loading}
              className={`
                ${QUICK_CLASH_CLASSES.btnPrimary}
                ${QUICK_CLASH_CLASSES.focusRing}
                font-bold px-6
                ${QUICK_CLASH_CLASSES.shadowCyan}
                hover:shadow-cyan-500/60
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:transform-none
                transition-all duration-200
                hover:scale-105
              `}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('Joining...')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('Join Team')}
                </>
              )}
            </Button>
          </DialogFooter>
        </MotionDiv>
      </DialogContent>
    </Dialog>
  )
}

export default JoinTeamModal
