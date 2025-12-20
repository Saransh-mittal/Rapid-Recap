// components/quickClashComponents/globalmatchmaking/components/TeamSelectionPanel.jsx
// REDESIGNED - Premium team selection with visual hierarchy
import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  User,
  UserPlus,
  CheckCircle2,
  Loader2,
  Shield,
} from 'lucide-react'

import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'
import { Badge } from '@/components/ui/badge'

const MotionDiv = motion.div

/**
 * Individual selection option component
 * Design Philosophy: Clear visual indication of selection state
 */
const SelectionOption = React.memo(({ option, isSelected, onSelectTeam }) => {
  const { t } = useTranslation('QuickClash')

  const handleSelect = useCallback(() => {
    onSelectTeam(option.id)
  }, [onSelectTeam, option.id])

  const IconComponent = option.isSolo ? User : Users

  return (
    <MotionDiv
      onClick={handleSelect}
      className={`
        ${QUICK_CLASH_CLASSES.glassLight}
        rounded-xl p-4
        border-2 transition-all duration-200
        cursor-pointer
        hover:scale-[1.01] active:scale-[0.99]
        ${
          isSelected
            ? 'border-cyan-400/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        }
      `}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Icon and name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon container */}
          <div
            className={`
              w-12 h-12 rounded-xl
              flex items-center justify-center
              border transition-all
              ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400/50'
                  : 'bg-white/5 border-white/10'
              }
            `}
          >
            <IconComponent
              className={`w-6 h-6 ${
                isSelected ? 'text-cyan-300' : 'text-white/70'
              }`}
            />
          </div>

          {/* Team/Player name */}
          <div className="flex-1 min-w-0">
            <p
              className={`
                font-bold truncate
                ${
                  isSelected
                    ? QUICK_CLASH_CLASSES.textPrimary
                    : QUICK_CLASH_CLASSES.textSecondary
                }
              `}
            >
              {option.name}
            </p>
            <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs mt-0.5`}>
              {option.isSolo ? t('Join as individual') : t('Join with team')}
            </p>
          </div>
        </div>

        {/* Right side - Badge and checkmark */}
        <div className="flex items-center gap-2">
          <Badge
            className={`
              ${
                option.isSolo
                  ? 'bg-teal-500/20 text-teal-300 border-teal-400/40'
                  : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
              }
              border font-bold text-xs px-2.5 py-1
            `}
          >
            {option.isSolo ? t('Solo') : option.badgeContent}
          </Badge>

          {isSelected && (
            <MotionDiv
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </MotionDiv>
          )}
        </div>
      </div>

      {/* Team member count indicator for teams */}
      {!option.isSolo && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <MotionDiv
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{
                  width: option.badgeContent
                    ? `${
                        (parseInt(option.badgeContent.split('/')[0]) / 4) * 100
                      }%`
                    : '0%',
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span
              className={`${QUICK_CLASH_CLASSES.textMuted} text-xs font-mono`}
            >
              {option.badgeContent}
            </span>
          </div>
        </div>
      )}
    </MotionDiv>
  )
})
SelectionOption.displayName = 'SelectionOption'

/**
 * TeamSelectionPanel - REDESIGNED
 *
 * Key Features:
 * - Visual team previews with member counts
 * - Clear selection states
 * - Solo option prominently featured
 * - Loading and empty states
 */
const TeamSelectionPanel = React.memo(
  ({ myTeams, loadingTeams, selectedTeamId, onSelectTeam }) => {
    const { t } = useTranslation('QuickClash')

    const soloOption = {
      id: null,
      name: t('Join Individually'),
      isSolo: true,
    }

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3
              className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-base`}
            >
              {t('Choose Your Entry')}
            </h3>
          </div>
          {!loadingTeams && (
            <Badge className="bg-white/10 text-white/70 border-white/20">
              {myTeams?.length
                ? `${myTeams.length} ${t('teams')}`
                : t('No teams')}
            </Badge>
          )}
        </div>

        {/* Loading state */}
        {loadingTeams ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`
                  ${QUICK_CLASH_CLASSES.glassLight}
                  rounded-xl p-4
                  border border-white/10
                  animate-pulse
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              <p className={`${QUICK_CLASH_CLASSES.textMuted} text-sm`}>
                {t('Loading your teams...')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {/* Solo option - always first */}
            <SelectionOption
              option={soloOption}
              isSelected={!selectedTeamId}
              onSelectTeam={onSelectTeam}
            />

            {/* User's teams */}
            {myTeams && myTeams.length > 0 ? (
              myTeams.map(team => (
                <SelectionOption
                  key={team._id}
                  option={{
                    id: team._id,
                    name: team.name,
                    isSolo: false,
                    badgeContent: `${team.members.length}/4`,
                  }}
                  isSelected={selectedTeamId === team._id}
                  onSelectTeam={onSelectTeam}
                />
              ))
            ) : (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  ${QUICK_CLASH_CLASSES.glassLight}
                  rounded-xl p-6
                  border border-white/10
                  text-center
                `}
              >
                <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p
                  className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm font-medium mb-1`}
                >
                  {t('No Teams Yet')}
                </p>
                <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                  {t('Join individually or create a team to get started')}
                </p>
              </MotionDiv>
            )}
          </div>
        )}

        {/* Info hint */}
        {!loadingTeams && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`
              ${QUICK_CLASH_CLASSES.glassLight}
              rounded-xl p-3
              border border-cyan-400/30
              bg-gradient-to-r from-cyan-500/5 to-blue-500/5
            `}
          >
            <div className="flex items-start gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p
                className={`${QUICK_CLASH_CLASSES.textMuted} text-xs leading-relaxed`}
              >
                {selectedTeamId
                  ? t(
                      'Your team will be matched with others to form a complete 4v4 squad',
                    )
                  : t(
                      "You'll be automatically assigned to a team with other solo players",
                    )}
              </p>
            </div>
          </MotionDiv>
        )}

        {/* Custom scrollbar */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(6, 182, 212, 0.4);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(6, 182, 212, 0.6);
          }
        `}</style>
      </div>
    )
  },
)

TeamSelectionPanel.displayName = 'TeamSelectionPanel'
export default TeamSelectionPanel
