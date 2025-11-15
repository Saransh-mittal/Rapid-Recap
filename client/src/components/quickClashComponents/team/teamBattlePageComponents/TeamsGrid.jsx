// components/quickClashComponents/team/teamBattlePageComponents/TeamsGrid.jsx
import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Users, CheckCircle, Clock, Star } from 'lucide-react'

// Shadcn UI Components
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

/**
 * Professional Teams Grid - Clear Comparison
 *
 * Design fixes:
 * - Both teams visible at once
 * - Side-by-side comparison
 * - Clean cards without garish colors
 * - Proper visual hierarchy
 * - Scores are prominent
 */
const TeamsGrid = memo(({ currentBattle, userTeam, userId }) => {
  const { t } = useTranslation('QuickClash')

  const { leftTeam, rightTeam } = useMemo(() => {
    if (!currentBattle) return { leftTeam: null, rightTeam: null }

    const isUserTeamA = userTeam === 'teamA'
    const isUserTeamB = userTeam === 'teamB'

    const teamAData = {
      data: currentBattle.teamA || { name: t('Team A'), avgTrophies: 0 },
      members: currentBattle.teamAMembers || [],
      wins: currentBattle.teamAWins || 0,
      totalScore: currentBattle.teamATotalScore || 0,
      type: 'teamA',
      isUserTeam: isUserTeamA,
    }

    const teamBData = {
      data: currentBattle.teamB || { name: t('Team B'), avgTrophies: 0 },
      members: currentBattle.teamBMembers || [],
      wins: currentBattle.teamBWins || 0,
      totalScore: currentBattle.teamBTotalScore || 0,
      type: 'teamB',
      isUserTeam: isUserTeamB,
    }

    if (isUserTeamA) return { leftTeam: teamAData, rightTeam: teamBData }
    if (isUserTeamB) return { leftTeam: teamBData, rightTeam: teamAData }
    return { leftTeam: teamAData, rightTeam: teamBData }
  }, [currentBattle, userTeam, t])

  if (!leftTeam || !rightTeam) return null

  return (
    <div className="px-4 mb-4 sm:px-6 sm:mb-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-center">
        {/* Left Team (User's Team) */}
        <TeamCard team={leftTeam} side="left" userId={userId} />

        {/* VS Divider */}
        <div className="flex items-center justify-center md:flex-col gap-2 md:gap-3 py-2 md:py-0">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 md:px-3 md:py-4">
            <div className="flex items-center gap-3 md:flex-col md:gap-2">
              <div className="text-3xl md:text-4xl font-black text-cyan-400">
                {leftTeam.wins}
              </div>
              <div className="text-lg font-bold text-white/60">VS</div>
              <div className="text-3xl md:text-4xl font-black text-red-400">
                {rightTeam.wins}
              </div>
            </div>
          </div>
        </div>

        {/* Right Team (Opponent) */}
        <TeamCard team={rightTeam} side="right" userId={userId} />
      </div>
    </div>
  )
})

/**
 * Clean Team Card - No garish colors
 */
const TeamCard = memo(({ team, side, userId }) => {
  const { t } = useTranslation('QuickClash')
  const isUserTeam = team.isUserTeam
  const completedCount = team.members.filter(m => m.completed).length

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border-2 ${
          isUserTeam ? 'border-cyan-500/30' : 'border-white/10'
        }`}
      >
        {/* Subtle indicator for user's team */}
        {isUserTeam && (
          <div className="absolute -top-2 left-4">
            <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold px-2 py-0.5">
              {t('Your Team')}
            </Badge>
          </div>
        )}

        {/* Team name */}
        <h3
          className={`text-lg font-bold mb-3 truncate ${
            isUserTeam ? 'text-cyan-300' : 'text-white'
          } ${isUserTeam ? 'mt-2' : ''}`}
        >
          {team.data?.name ||
            (team.type === 'teamA' ? t('Team A') : t('Team B'))}
        </h3>

        {/* Stats row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs font-semibold"
          >
            <Trophy className="w-3 h-3 mr-1" />
            {team.data?.avgTrophies || 0}
          </Badge>
          <Badge
            variant="outline"
            className="border-white/20 text-white/80 text-xs font-semibold"
          >
            <Star className="w-3 h-3 mr-1" />
            {team.totalScore} pts
          </Badge>
        </div>

        {/* Avatars */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members?.slice(0, 4).map(member => (
              <Avatar
                key={member.user._id}
                className={`w-9 h-9 border-2 ${
                  member.user._id === userId
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                    : member.completed
                    ? 'border-green-400'
                    : 'border-white/30'
                }`}
              >
                <AvatarImage src={member.user.pic} />
                <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
                  {(member.user.name ||
                    member.user.inGameName ||
                    'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {team.members?.length > 4 && (
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-700 border-2 border-white/30 text-white text-xs font-bold">
                +{team.members.length - 4}
              </div>
            )}
          </div>

          {/* View all */}
          {team.members?.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-white/70 hover:text-white hover:bg-white/10 h-8 px-2"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {team.members.length}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-slate-800/95 backdrop-blur-xl border-slate-700">
                <TeamMembersPopover members={team.members} userId={userId} />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Progress */}
        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
          {completedCount} / {team.members.length} {t('completed')}
        </div>
      </div>
    </motion.div>
  )
})

/**
 * Team Members Popover
 */
const TeamMembersPopover = memo(({ members, userId }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
        <Users className="w-4 h-4" />
        {t('Team Members')}
      </h4>
      {members.map(member => (
        <div
          key={member.user._id}
          className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
            member.user._id === userId
              ? 'bg-cyan-500/20 border border-cyan-500/30'
              : 'bg-slate-700/50'
          }`}
        >
          <Avatar className="w-7 h-7">
            <AvatarImage src={member.user.pic} />
            <AvatarFallback className="bg-slate-600 text-white text-xs font-bold">
              {(member.user.name ||
                member.user.inGameName ||
                'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate text-xs">
              {member.user.inGameName || member.user.name || t('Unnamed')}
            </p>
            {member.user._id === userId && (
              <Badge
                variant="outline"
                className="text-xs border-cyan-500/50 mt-0.5 h-4 px-1"
              >
                {t('You')}
              </Badge>
            )}
          </div>

          <Badge
            variant="outline"
            className={`text-xs ${
              member.completed
                ? 'border-green-500/50 text-green-300'
                : member.participated
                ? 'border-yellow-500/50 text-yellow-300'
                : 'border-slate-500/50 text-slate-300'
            }`}
          >
            {member.completed ? (
              <>
                <CheckCircle className="w-3 h-3 mr-0.5" />
                {member.score}
              </>
            ) : member.participated ? (
              <>
                <Clock className="w-3 h-3 mr-0.5" />
                {t('Playing')}
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-0.5" />
                {t('Waiting')}
              </>
            )}
          </Badge>
        </div>
      ))}
    </div>
  )
})

TeamCard.displayName = 'TeamCard'
TeamMembersPopover.displayName = 'TeamMembersPopover'
TeamsGrid.displayName = 'TeamsGrid'

export default TeamsGrid
