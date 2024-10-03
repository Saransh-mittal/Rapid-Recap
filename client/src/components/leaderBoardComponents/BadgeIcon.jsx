import React, { lazy, Suspense, useState } from 'react'
import { Box } from '@chakra-ui/react'

const TournamentBadge = lazy(() =>
  import('../tournamentComponents/TournamentBadges'),
)

const BadgeIcon = ({ user, size, onPopoverToggle }) => {
  const handlePopoverToggle = isOpen => {
    if (onPopoverToggle) {
      onPopoverToggle(isOpen)
    }
  }

  if (user?.displayedBadge) {
    return (
      <Suspense fallback={<Box w={size} h={size} />}>
        <TournamentBadge
          tournamentNumber={user.displayedBadge.tournamentNumber}
          rank={user.displayedBadge.rank}
          name={user.name}
          inGameName={user.inGameName}
          participantCnt={user.displayedBadge.participantCnt}
          size={size === '60px' ? 'md' : 'sm'}
          badgeName={{
            name: user.displayedBadge.badgeName,
            text: user.displayedBadge.text,
          }}
          onPopoverToggle={handlePopoverToggle}
        />
      </Suspense>
    )
  }

  return (
    <Box w={size} h={size} bg="gray.700" borderRadius="full" overflow="hidden">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient
            id="shieldGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2D3748" />
            <stop offset="100%" stopColor="#1A202C" />
          </linearGradient>
        </defs>
        <path
          d="M50 5 L90 25 V60 C90 75 75 90 50 95 C25 90 10 75 10 60 V25 Z"
          fill="url(#shieldGradient)"
        />
        <path
          d="M50 15 L82 31 V58 C82 70 70 82 50 86 C30 82 18 70 18 58 V31 Z"
          fill="none"
          stroke="#A0AEC0"
          strokeWidth="2"
        />
        <text
          x="50"
          y="60"
          fontFamily="Arial, sans-serif"
          fontSize="12"
          fill="#A0AEC0"
          textAnchor="middle"
        >
          No Badge
        </text>
      </svg>
    </Box>
  )
}

export default BadgeIcon
