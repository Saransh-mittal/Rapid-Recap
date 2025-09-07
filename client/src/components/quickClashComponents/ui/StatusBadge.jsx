// components/quickClashComponents/ui/StatusBadge.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React from 'react'
import { Clock, Zap, PlayCircle, Check, X, HourglassIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install these components: npx shadcn-ui@latest add badge tooltip
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Enhanced StatusBadge - Shows challenge status with blue-cyan theme integration
 *
 * Key improvements:
 * - Updated to blue-cyan harmony color scheme
 * - Enhanced badge styling with better visual hierarchy
 * - Improved accessibility with proper tooltips
 * - Better responsive design
 * - Maintained all original conditional logic
 *
 * @param {String} status - Challenge status (pending, active, in_progress, completed, rejected)
 * @param {Boolean} isChallenger - Whether current user is the challenger
 * @param {String} expiresAt - Challenge expiry timestamp
 */
const StatusBadge = ({ status, isChallenger, expiresAt }) => {
  const { t } = useTranslation('QuickClash')

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          variant: 'secondary',
          className: `
            ${QUICK_CLASH_CLASSES.statusPending}
            border border-orange-400/40
            shadow-lg shadow-orange-500/20
            hover:shadow-orange-500/30
          `,
          text: isChallenger ? t('Awaiting') : t('New'),
          icon: Clock,
        }
      case 'active':
        return {
          variant: 'secondary',
          className: `
            ${QUICK_CLASH_CLASSES.statusActive}
            border border-green-400/40
            shadow-lg shadow-green-500/20
            hover:shadow-green-500/30
            animate-pulse
          `,
          text: t('Ready'),
          icon: Zap,
        }
      case 'in_progress':
        return {
          variant: 'secondary',
          className: `
            ${QUICK_CLASH_CLASSES.statusInfo}
            border border-blue-400/40
            shadow-lg shadow-blue-500/20
            hover:shadow-blue-500/30
          `,
          text: t('Progress'),
          icon: PlayCircle,
        }
      case 'completed':
        return {
          variant: 'secondary',
          className: `
            ${QUICK_CLASH_CLASSES.statusCompleted}
            border border-cyan-400/40
            shadow-lg shadow-cyan-500/20
            hover:shadow-cyan-500/30
          `,
          text: t('Done'),
          icon: Check,
        }
      case 'rejected':
        return {
          variant: 'secondary',
          className: `
            ${QUICK_CLASH_CLASSES.statusRejected}
            border border-red-400/40
            shadow-lg shadow-red-500/20
            hover:shadow-red-500/30
          `,
          text: t('Rejected'),
          icon: X,
        }
      default:
        return {
          variant: 'secondary',
          className: `
            ${QUICK_CLASH_CLASSES.glassMedium}
            text-white/70
            border border-white/20
          `,
          text: status,
          icon: null,
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon
  const isExpired = new Date(expiresAt) < new Date()

  // Don't show status badge for expired or completed challenges
  if ((isExpired && status !== 'rejected') || status === 'completed') {
    return null
  }

  return (
    <div className="flex w-full justify-between items-center">
      <Badge
        variant={config.variant}
        className={`
          ${config.className}
          flex items-center gap-1.5
          px-3 py-1.5
          rounded-full
          text-xs font-medium
          transition-all duration-200
          hover:scale-105
          ${QUICK_CLASH_CLASSES.focusRing}
        `}
      >
        {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
        <span>{config.text}</span>
      </Badge>

      {/* Show expiry time only for active and pending challenges */}
      {(status === 'active' || status === 'pending') && expiresAt && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`
                  ${QUICK_CLASH_CLASSES.glassMedium}
                  ${QUICK_CLASH_CLASSES.textMuted}
                  border border-white/20
                  hover:border-white/30
                  flex items-center gap-1
                  rounded-full
                  px-2 py-1
                  text-xs
                  ml-auto
                  transition-all duration-200
                  hover:bg-white/5
                  ${QUICK_CLASH_CLASSES.focusRing}
                `}
              >
                <HourglassIcon className="w-3 h-3" />
                <span className="font-medium">
                  {formatDistanceToNow(new Date(expiresAt), {
                    addSuffix: true,
                  })}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('Time left until expiry')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export default StatusBadge
