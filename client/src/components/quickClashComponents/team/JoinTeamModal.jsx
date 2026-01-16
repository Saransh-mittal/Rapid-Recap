// components/quickClashComponents/team/JoinTeamModal.jsx - Simplified version matching CreateTeamModal structure
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { UserPlus, Users, Key, Zap } from 'lucide-react'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

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
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

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

  // Animation variants - matching CreateTeamModal
  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
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

    quizAudioService.playGoButton()
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
    quizAudioService.playDismiss()
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
          max-w-md
          ${QUICK_CLASH_CLASSES.glassDark}
          border-2 border-cyan-600/60
          ${QUICK_CLASH_CLASSES.shadowCyan}
          backdrop-brightness-115
        `}
      >
        <MotionDiv
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header - matching CreateTeamModal structure */}
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                bg-cyan-500/20 border border-cyan-400
                ${QUICK_CLASH_CLASSES.shadowCyan}
              `}
              >
                <UserPlus className="w-5 h-5 text-cyan-400" />
              </div>
              <DialogTitle
                className={`
                text-xl font-bold
                ${QUICK_CLASH_CLASSES.textPrimary}
              `}
              >
                {t('Join Existing Team')}
              </DialogTitle>
            </div>
            <DialogDescription
              className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}
            >
              {t('Enter the team code to join your friends')}
            </DialogDescription>
          </DialogHeader>

          {/* Form Content */}
          <div className="space-y-6 py-4">
            {/* Team Code Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <Label
                  className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textBright}`}
                >
                  {t('Enter Team Code')}
                </Label>
              </div>

              <PinInput
                value={teamCode}
                onChange={handlePinChange}
                onComplete={handlePinComplete}
                disabled={loading}
              />

              <p className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                {t('Enter the 6-character code to join a team')}
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Team Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h4 className={`font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}>
                  {t('Team Information')}
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                    {t('You can get a team code from a team leader')}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                    {t('Teams can have up to 4 members')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - matching CreateTeamModal structure */}
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className={`
                ${QUICK_CLASH_CLASSES.glassMedium}
                border border-white/20 text-white/80 hover:text-white
                hover:bg-white/10 hover:border-white/30
                ${QUICK_CLASH_CLASSES.focusRing}
                transition-all duration-200
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
                ${QUICK_CLASH_CLASSES.transformHover}
                font-bold px-6
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:transform-none
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
