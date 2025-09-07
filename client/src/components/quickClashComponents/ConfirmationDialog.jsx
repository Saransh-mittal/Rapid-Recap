// components/quickClashComponents/ConfirmationDialog.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

// You'll need to install this component first: npx shadcn-ui@latest add alert-dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const MotionDiv = motion.div

/**
 * Enhanced ConfirmationDialog - Faithful conversion with consistent color scheme
 *
 * Key improvements:
 * - Migrated from Chakra UI to Shadcn/ui for better maintainability
 * - Implemented centralized color scheme from quickClashColors.js
 * - Enhanced animations using Framer Motion
 * - Improved accessibility with proper focus management
 * - Responsive design with Tailwind utilities
 */
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = true,
}) => {
  const { t } = useTranslation('QuickClash')

  // Determine color scheme based on action type
  const colorScheme = isDangerous ? 'red' : 'cyan'

  const iconColorClass = isDangerous ? 'text-red-400' : 'text-yellow-400'
  const confirmButtonClass = isDangerous
    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    : QUICK_CLASH_CLASSES.btnPrimary

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className={`
          ${QUICK_CLASH_CLASSES.glassMedium}
          border-2
          ${isDangerous ? 'border-red-500/50' : 'border-cyan-500/50'}
          rounded-2xl
          shadow-2xl
          backdrop-blur-[20px]
          max-w-md
          ${QUICK_CLASH_CLASSES.focusRing}
        `}
      >
        <AlertDialogHeader className="pb-4">
          <AlertDialogTitle
            className={`
            ${QUICK_CLASH_CLASSES.textPrimary}
            text-lg font-bold
            flex items-center gap-3
            border-b border-white/10 pb-4
          `}
          >
            <MotionDiv
              animate={{
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            >
              <AlertTriangle className={`w-6 h-6 ${iconColorClass}`} />
            </MotionDiv>
            {title || t('Confirm Action')}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription
          className={`
          ${QUICK_CLASH_CLASSES.textSecondary}
          py-4
          text-base
          leading-relaxed
        `}
        >
          {message}
        </AlertDialogDescription>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <AlertDialogCancel
            onClick={onClose}
            className={`
              ${QUICK_CLASH_CLASSES.glassMedium}
              ${QUICK_CLASH_CLASSES.textPrimary}
              ${QUICK_CLASH_CLASSES.hoverCyan}
              border-white/20
              hover:bg-white/10
              hover:border-white/30
              rounded-lg
              px-6 py-2.5
              text-sm md:text-base
              transition-all duration-200
              ${QUICK_CLASH_CLASSES.focusRing}
              min-w-[100px]
            `}
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`
              ${confirmButtonClass}
              ${QUICK_CLASH_CLASSES.textPrimary}
              border border-white/10
              rounded-lg
              px-6 py-2.5
              text-sm md:text-base
              font-medium
              transition-all duration-200
              hover:scale-105
              hover:shadow-lg
              ${
                isDangerous
                  ? 'hover:shadow-red-500/25'
                  : QUICK_CLASH_CLASSES.shadowCyan
              }
              ${QUICK_CLASH_CLASSES.focusRing}
              min-w-[100px]
            `}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmationDialog
