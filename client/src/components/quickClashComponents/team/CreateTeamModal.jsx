// components/quickClashComponents/team/CreateTeamModal.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Shield } from 'lucide-react'

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

const CreateTeamModal = ({ isOpen, onClose, onCreate }) => {
  const { t } = useTranslation('QuickClash')

  // Form state - EXACTLY as original
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal animation variants - EXACTLY as original
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

  // Handle form submission - EXACTLY as original
  const handleSubmit = async e => {
    e.preventDefault()

    if (!name.trim()) return

    quizAudioService.playGoButton() // Energetic sound for creating team
    setLoading(true)

    try {
      await onCreate({ name })
      // Reset form
      setName('')
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle close - EXACTLY as original
  const handleClose = () => {
    quizAudioService.playDismiss() // Sound for closing modal
    setName('')
    onClose()
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
          {/* Enhanced Header */}
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                bg-cyan-500/20 border border-cyan-400
                ${QUICK_CLASH_CLASSES.shadowCyan}
              `}
              >
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <DialogTitle
                className={`
                text-xl font-bold
                ${QUICK_CLASH_CLASSES.textPrimary}
              `}
              >
                {t('Create New Team')}
              </DialogTitle>
            </div>
            <DialogDescription
              className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}
            >
              {t('Create a team to compete in 4v4 battles with your friends')}
            </DialogDescription>
          </DialogHeader>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            id="create-team-form"
            className="space-y-6 py-4"
          >
            {/* Team Name Input */}
            <div className="space-y-2">
              <Label
                htmlFor="team-name"
                className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textBright}`}
              >
                {t('Team Name')}
              </Label>
              <Input
                id="team-name"
                placeholder={t('Enter team name')}
                value={name}
                onChange={e => setName(e.target.value)}
                className={`
                  ${QUICK_CLASH_CLASSES.glassMedium}
                  border-white/30 text-white placeholder:text-white/50
                  focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50
                  hover:border-cyan-400/60
                  transition-all duration-200
                `}
                required
              />
              <p className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                {t('Choose a name for your team')}
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Team Benefits Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h4 className={`font-bold ${QUICK_CLASH_CLASSES.textPrimary}`}>
                  {t('Team Benefits')}
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                    {t('Participate in 4v4 team battles')}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                    {t('Earn team bonuses and rewards')}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                    {t('Climb the team leaderboards')}
                  </p>
                </div>
              </div>
            </div>
          </form>

          {/* Enhanced Footer */}
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
              type="submit"
              form="create-team-form"
              disabled={loading || !name.trim()}
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
                  {t('Creating...')}
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {t('Create Team')}
                </>
              )}
            </Button>
          </DialogFooter>
        </MotionDiv>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTeamModal
