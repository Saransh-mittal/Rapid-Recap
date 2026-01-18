// components/quickClashComponents/team/TeamCardV2.jsx
// Premium Team Card with Accordion Style + Member Actions

import React, { memo, useMemo, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Trophy,
  Crown,
  UserPlus,
  LogOut,
  ChevronDown,
  Swords,
  UserMinus,
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/button'

// Haptic feedback
import { haptics } from '../../../utils/haptics'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Default avatar fallback
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect fill='%231e293b' width='40' height='40'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%2394a3b8'/%3E%3Cpath d='M8 36c0-8 5-12 12-12s12 4 12 12' fill='%2394a3b8'/%3E%3C/svg%3E"

// ============================================================================
// MEMBER ROW - With action menu for leaders
// ============================================================================

const MemberRow = memo(({ member, userId, isLeader, isInMatch, onRemove, onTransferLeadership }) => {
  const { t } = useTranslation('QuickClash')
  const isCurrentUser = member?.user?._id === userId
  const isMemberLeader = member?.role === 'leader'

  // Determine if this is a session player or a user
  const userData = member?.user || member?.sessionPlayer
  const isSessionPlayer = !member?.user && !!member?.sessionPlayer

  // Confirmation dialogs
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)

  const avatarUrl = userData?.pic || userData?.picture || DEFAULT_AVATAR
  const displayName = userData?.name || userData?.inGameName || 'Player'
  const memberTrophies = userData?.quickClashTrophies || userData?.trophies || 1000

  // Show action menu only for leaders viewing other members (not themselves, not other leaders)
  const showActionMenu = isLeader && !isCurrentUser && !isMemberLeader && !isInMatch

  const handleRemove = useCallback(() => {
    onRemove(userData?._id)
    setShowRemoveDialog(false)
  }, [onRemove, userData?._id])

  const handleTransfer = useCallback(() => {
    onTransferLeadership(userData?._id)
    setShowTransferDialog(false)
  }, [onTransferLeadership, userData?._id])

  return (
    <>
      {showActionMenu ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full focus:outline-none">
            <div className={`
              grid grid-cols-[auto_1fr_auto] gap-2 items-center py-2 px-2 rounded-lg
              cursor-pointer hover:bg-white/5 active:bg-white/10
              transition-colors duration-150
            `}>
              {/* Avatar */}
              <div className="relative">
                <Avatar className={`w-7 h-7 ring-1 ${isMemberLeader ? 'ring-yellow-400/70' : isCurrentUser ? 'ring-cyan-400/60' : 'ring-white/20'}`}>
                  <AvatarImage src={avatarUrl} alt={displayName} onError={(e) => { e.target.src = DEFAULT_AVATAR }} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-[10px] font-bold">
                    {displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isMemberLeader && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <Crown className="w-2 h-2 text-yellow-900" />
                  </div>
                )}
              </div>

              {/* Name + Badges */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm truncate text-white/90">
                  {displayName}
                </span>
              </div>

              {/* Trophies - Fixed width for alignment */}
              <div className="flex items-center gap-1 justify-end w-16">
                <Trophy className="w-3 h-3 text-yellow-500/60" />
                <span className="text-xs text-yellow-400/80 font-medium tabular-nums">
                  {memberTrophies.toLocaleString()}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-slate-900/95 border-white/10 backdrop-blur-lg">
            <DropdownMenuItem
              onClick={() => setShowTransferDialog(true)}
              className="text-yellow-300 focus:text-yellow-200 focus:bg-yellow-500/10 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 mr-2" />
              Make Leader
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowRemoveDialog(true)}
              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
            >
              <UserMinus className="w-3.5 h-3.5 mr-2" />
              Remove from Team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className={`
          grid grid-cols-[auto_1fr_auto] gap-2 items-center py-2 px-2
          ${isCurrentUser ? 'bg-cyan-500/10 rounded-lg' : ''}
        `}>
          {/* Avatar */}
          <div className="relative">
            <Avatar className={`w-7 h-7 ring-1 ${isMemberLeader ? 'ring-yellow-400/70' : isCurrentUser ? 'ring-cyan-400/60' : 'ring-white/20'}`}>
              <AvatarImage src={avatarUrl} alt={displayName} onError={(e) => { e.target.src = DEFAULT_AVATAR }} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-[10px] font-bold">
                {displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isMemberLeader && (
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-yellow-900" />
              </div>
            )}
          </div>

          {/* Name + Badges */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-sm truncate ${isCurrentUser ? 'text-cyan-200 font-medium' : 'text-white/90'}`}>
              {displayName}
            </span>
            {isCurrentUser && (
              <Badge className="bg-cyan-500/25 text-cyan-300 border-0 text-[8px] px-1 py-0 h-3.5 font-semibold">
                YOU
              </Badge>
            )}
            {isSessionPlayer && (
              <Badge className="bg-purple-500/25 text-purple-300 border-0 text-[8px] px-1 py-0 h-3.5 font-semibold">
                GUEST
              </Badge>
            )}
            {isMemberLeader && (
              <Badge className="bg-yellow-500/25 text-yellow-300 border-0 text-[8px] px-1 py-0 h-3.5 font-semibold">
                LEADER
              </Badge>
            )}
          </div>

          {/* Trophies - Fixed width for alignment */}
          <div className="flex items-center gap-1 justify-end w-16">
            <Trophy className="w-3 h-3 text-yellow-500/60" />
            <span className="text-xs text-yellow-400/80 font-medium tabular-nums">
              {memberTrophies.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="bg-slate-900/95 border-white/10 backdrop-blur-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-red-400" />
              Remove {displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will remove {displayName} from your team. They can rejoin using the team code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-red-500/80 hover:bg-red-500 text-white border-0"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Leadership Confirmation Dialog */}
      <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <AlertDialogContent className="bg-slate-900/95 border-white/10 backdrop-blur-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Transfer Leadership?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              You will make <span className="text-cyan-300 font-medium">{displayName}</span> the new team leader. You will become a regular member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransfer}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-yellow-900 border-0 font-semibold"
            >
              <Crown className="w-4 h-4 mr-1.5" />
              Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})
MemberRow.displayName = 'MemberRow'

// ============================================================================
// EMPTY SLOT
// ============================================================================

const EmptySlot = memo(({ isLeader, onInvite }) => (
  <div
    onClick={isLeader ? onInvite : undefined}
    className={`
      grid grid-cols-[auto_1fr_auto] gap-2 items-center py-2 px-2
      ${isLeader ? 'cursor-pointer hover:bg-cyan-500/5 rounded-lg group' : 'opacity-40'}
    `}
  >
    <div className="w-7 h-7 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
      <UserPlus className={`w-3 h-3 text-white/30 ${isLeader ? 'group-hover:text-cyan-400' : ''}`} />
    </div>
    <span className={`text-xs text-white/30 ${isLeader ? 'group-hover:text-cyan-300/60' : ''}`}>
      {isLeader ? 'Tap to invite player' : 'Empty slot'}
    </span>
    <div className="w-16" />
  </div>
))
EmptySlot.displayName = 'EmptySlot'

// ============================================================================
// MAIN ACCORDION TEAM CARD
// ============================================================================

const TeamCardV2 = memo(({
  team,
  isLeader,
  userId,
  onLeave,
  onRemoveMember,
  onTransferLeadership,
  onInvite,
}) => {
  const { t } = useTranslation('QuickClash')
  const [isOpen, setIsOpen] = useState(false) // Default closed

  const teamMembers = useMemo(() => team.members || [], [team.members])
  const isTeamFull = useMemo(() => teamMembers.length >= team.maxMembers, [teamMembers.length, team.maxMembers])
  const emptySlots = useMemo(() => team.maxMembers - teamMembers.length, [team.maxMembers, teamMembers.length])



  const handleLeave = useCallback(() => {
    haptics.warning() // Tactile feedback for leave action
    onLeave(team?._id)
  }, [onLeave, team?._id])
  const handleInvite = useCallback(() => {
    haptics.light() // Tactile feedback on invite
    onInvite(team)
  }, [onInvite, team])

  return (
    <Collapsible open={isOpen} onOpenChange={(open) => {
      haptics.selection() // Tactile feedback on accordion toggle
      setIsOpen(open)
    }}>
      <div className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900/60 to-slate-950/70 backdrop-blur-lg border border-white/10 shadow-lg">
        {/* ===== ACCORDION HEADER (Always Visible) ===== */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Team icon */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                {isLeader && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <Crown className="w-2.5 h-2.5 text-yellow-900" />
                  </div>
                )}
              </div>

              {/* Team name + status */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{team.name}</h3>
                  {team.isInMatch && (
                    <Badge className="bg-green-500/20 text-green-300 border-0 text-[8px] px-1 py-0 h-3.5 animate-pulse">
                      <Swords className="w-2 h-2 mr-0.5" />
                      BATTLE
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                  <span className="font-mono">{team.teamCode}</span>
                  <span>•</span>
                  <span>{teamMembers.length}/{team.maxMembers} members</span>
                </div>
              </div>
            </div>

            {/* Avg Trophy + Chevron */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/25">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-300 font-bold text-xs tabular-nums">
                  {team.avgTrophies || 0}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-white/40" />
              </motion.div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* ===== COLLAPSIBLE CONTENT ===== */}
        <CollapsibleContent>
          <div>
            {/* Members Table */}
            <div className="border-t border-white/5 px-1 py-1">
              {teamMembers.map((member) => (
                <MemberRow
                  key={member?._id || member?.user?._id || member?.sessionPlayer?._id}
                  member={member}
                  userId={userId}
                  isLeader={isLeader}
                  isInMatch={team.isInMatch}
                  onRemove={(memberId) => onRemoveMember(team._id, memberId)}
                  onTransferLeadership={(newLeaderId) => onTransferLeadership(team._id, newLeaderId)}
                />
              ))}
              {!isTeamFull && Array.from({ length: emptySlots }).map((_, i) => (
                <EmptySlot key={`empty-${i}`} isLeader={isLeader} onInvite={handleInvite} />
              ))}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/5 px-3 py-2 flex items-center justify-end">
              {/* Leave */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLeave}
                disabled={team.isInMatch}
                className="h-7 px-2 text-xs text-red-400/60 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Leave
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
})

TeamCardV2.displayName = 'TeamCardV2'

export default TeamCardV2
