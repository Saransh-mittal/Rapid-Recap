// services/quickClashServices/quickClashMVPService.js

/**
 * Service for calculating MVP awards and enhanced battle recognition
 * Updated with correct MVP criteria
 */

/**
 * Calculate MVP awards and special recognitions for a battle
 */
const calculateMVPAwards = (battle, userTeam) => {
  const awards = {
    matchMVP: null,
    teamMVP: null,
    pivotalPlayer: null,
    performanceRecognitions: [],
  }

  try {
    const winnerTeam = battle.winner
    const winnerTeamMembers =
      winnerTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
    const loserTeamMembers =
      winnerTeam === 'teamA' ? battle.teamBMembers : battle.teamAMembers
    const allMembers = [...battle.teamAMembers, ...battle.teamBMembers]

    // Helper function to check if a player won their category
    const didPlayerWinCategory = (playerId, teamKey) => {
      if (!battle.challenges || !playerId) return false

      // Find the challenge where this player participated
      const playerChallenge = battle.challenges.find(challenge => {
        if (teamKey === 'teamA') {
          return (
            challenge.teamAPlayer &&
            challenge.teamAPlayer.toString() === playerId.toString()
          )
        } else {
          return (
            challenge.teamBPlayer &&
            challenge.teamBPlayer.toString() === playerId.toString()
          )
        }
      })

      // Check if this player's team won their specific challenge
      return playerChallenge && playerChallenge.winner === teamKey
    }

    // Helper function to get player's category
    const getPlayerCategory = (playerId, teamKey) => {
      if (!battle.challenges || !playerId) return null

      const playerChallenge = battle.challenges.find(challenge => {
        if (teamKey === 'teamA') {
          return (
            challenge.teamAPlayer &&
            challenge.teamAPlayer.toString() === playerId.toString()
          )
        } else {
          return (
            challenge.teamBPlayer &&
            challenge.teamBPlayer.toString() === playerId.toString()
          )
        }
      })

      return playerChallenge ? playerChallenge.category : null
    }

    // 1. Match MVP - Winner team, won their category, highest RQM in team
    if (winnerTeam && winnerTeam !== 'tie' && winnerTeamMembers.length > 0) {
      // Filter members who won their individual categories
      const categoryWinners = winnerTeamMembers.filter(member => {
        return didPlayerWinCategory(member.user._id || member.user, winnerTeam)
      })

      if (categoryWinners.length > 0) {
        // Find the highest scorer among category winners
        const matchMVP = categoryWinners.reduce((highest, member) => {
          const memberScore = member.score || 0
          const highestScore = highest?.score || 0
          return memberScore > highestScore ? member : highest
        }, null)

        if (matchMVP && matchMVP.score > 0) {
          awards.matchMVP = {
            user: matchMVP.user,
            score: matchMVP.score,
            category: getPlayerCategory(
              matchMVP.user._id || matchMVP.user,
              winnerTeam,
            ),
            team: winnerTeam,
            title: 'Match MVP',
            description: `Highest scorer in the winning team who won their category with ${matchMVP.score} points`,
            wonCategory: true,
          }
        }
      }
    }

    // 2. Team MVP - Loser team, won their category, highest RQM in team
    if (winnerTeam && winnerTeam !== 'tie' && loserTeamMembers.length > 0) {
      const loserTeamKey = winnerTeam === 'teamA' ? 'teamB' : 'teamA'

      // Filter members who won their individual categories
      const categoryWinners = loserTeamMembers.filter(member => {
        return didPlayerWinCategory(
          member.user._id || member.user,
          loserTeamKey,
        )
      })

      if (categoryWinners.length > 0) {
        // Find the highest scorer among category winners
        const teamMVP = categoryWinners.reduce((highest, member) => {
          const memberScore = member.score || 0
          const highestScore = highest?.score || 0
          return memberScore > highestScore ? member : highest
        }, null)

        if (teamMVP && teamMVP.score > 0) {
          awards.teamMVP = {
            user: teamMVP.user,
            score: teamMVP.score,
            category: getPlayerCategory(
              teamMVP.user._id || teamMVP.user,
              loserTeamKey,
            ),
            team: loserTeamKey,
            title: 'Team MVP',
            description: `Top performer in the losing team who won their category with ${teamMVP.score} points`,
            wonCategory: true,
          }
        }
      }
    }

    // 3. Pivotal Player - Same category, highest difference (winner - loser)
    if (winnerTeam && winnerTeam !== 'tie' && battle.challenges) {
      let maxDifference = 0
      let pivotalChallenge = null

      battle.challenges.forEach((challenge, index) => {
        if (
          challenge.winner === winnerTeam &&
          challenge.teamAScore !== undefined &&
          challenge.teamBScore !== undefined &&
          challenge.teamAScore !== null &&
          challenge.teamBScore !== null
        ) {
          const difference = Math.abs(
            challenge.teamAScore - challenge.teamBScore,
          )
          if (difference > maxDifference) {
            maxDifference = difference
            pivotalChallenge = challenge
          }
        }
      })

      if (pivotalChallenge && maxDifference > 0) {
        // Find the winner team player in this challenge
        const winnerPlayerId =
          winnerTeam === 'teamA'
            ? pivotalChallenge.teamAPlayer
            : pivotalChallenge.teamBPlayer

        if (winnerPlayerId) {
          const winnerMember = winnerTeamMembers.find(
            m =>
              (m.user._id || m.user).toString() === winnerPlayerId.toString(),
          )

          if (winnerMember) {
            awards.pivotalPlayer = {
              user: winnerMember.user,
              score: winnerMember.score,
              category: pivotalChallenge.category,
              team: winnerTeam,
              difference: maxDifference,
              title: 'Pivotal Player',
              description: `Made the crucial difference in ${pivotalChallenge.category} with a ${maxDifference}-point margin`,
              challengeWinner: true,
            }
          }
        }
      }
    }

    // 4. Performance Recognitions based on RQM scores (unchanged)
    allMembers.forEach(member => {
      const score = member.score || 0
      let recognition = null
      const memberTeam = battle.teamAMembers.includes(member)
        ? 'teamA'
        : 'teamB'
      const wonCategory = didPlayerWinCategory(
        member.user._id || member.user,
        memberTeam,
      )

      if (score >= 100) {
        recognition = {
          level: 'legendary',
          title: 'Legendary Performance',
          color: 'purple',
          icon: 'Crown',
          threshold: 100,
        }
      } else if (score >= 75) {
        recognition = {
          level: 'excellent',
          title: 'Excellent Performance',
          color: 'green',
          icon: 'Trophy',
          threshold: 75,
        }
      } else if (score >= 50) {
        recognition = {
          level: 'good',
          title: 'Good Performance',
          color: 'blue',
          icon: 'Star',
          threshold: 50,
        }
      } else if (score >= 40) {
        recognition = {
          level: 'average',
          title: 'Average Performance',
          color: 'yellow',
          icon: 'Target',
          threshold: 40,
        }
      }

      if (recognition) {
        awards.performanceRecognitions.push({
          user: member.user,
          score: member.score,
          category: getPlayerCategory(
            member.user._id || member.user,
            memberTeam,
          ),
          team: memberTeam,
          wonCategory,
          ...recognition,
        })
      }
    })

    // Add debug information in development
    if (process.env.NODE_ENV === 'development') {
      console.log('MVP Awards Calculation:', {
        winnerTeam,
        matchMVP: awards.matchMVP
          ? {
              name: awards.matchMVP.user.name,
              score: awards.matchMVP.score,
              category: awards.matchMVP.category,
              wonCategory: awards.matchMVP.wonCategory,
            }
          : null,
        teamMVP: awards.teamMVP
          ? {
              name: awards.teamMVP.user.name,
              score: awards.teamMVP.score,
              category: awards.teamMVP.category,
              wonCategory: awards.teamMVP.wonCategory,
            }
          : null,
        pivotalPlayer: awards.pivotalPlayer
          ? {
              name: awards.pivotalPlayer.user.name,
              category: awards.pivotalPlayer.category,
              difference: awards.pivotalPlayer.difference,
            }
          : null,
      })
    }

    return awards
  } catch (error) {
    console.error('Error calculating MVP awards:', error)
    return awards
  }
}

/**
 * Get enhanced performance level with new thresholds
 */
const getEnhancedPerformanceLevel = score => {
  if (score >= 100) {
    return {
      levelKey: 'Legendary',
      color: 'purple',
      icon: 'Crown',
      gradient: 'linear(135deg, #A855F7, #8B5CF6)',
      threshold: 100,
      tier: 'S+',
    }
  }
  if (score >= 75) {
    return {
      levelKey: 'Excellent',
      color: 'green',
      icon: 'Trophy',
      gradient: 'linear(135deg, #22C55E, #10B981)',
      threshold: 75,
      tier: 'S',
    }
  }
  if (score >= 50) {
    return {
      levelKey: 'Good',
      color: 'blue',
      icon: 'Star',
      gradient: 'linear(135deg, #3B82F6, #2563EB)',
      threshold: 50,
      tier: 'A',
    }
  }
  if (score >= 40) {
    return {
      levelKey: 'Average',
      color: 'yellow',
      icon: 'Target',
      gradient: 'linear(135deg, #F59E0B, #D97706)',
      threshold: 40,
      tier: 'B',
    }
  }
  return {
    levelKey: 'Needs Improvement',
    color: 'red',
    icon: 'TrendingDown',
    gradient: 'linear(135deg, #EF4444, #DC2626)',
    threshold: 0,
    tier: 'C',
  }
}

/**
 * Calculate simplified trophy exchange (bonuses only)
 */
const getSimplifiedTrophyData = (battle, userMemberData) => {
  if (!battle?.trophyExchange || !userMemberData) {
    return {
      userTrophyChange: 0,
      activeBonuses: [],
      finalAmount: 0,
      perPlayerAmount: 0,
      showBaseAmount: false,
    }
  }

  const activeBonuses = Object.entries(battle.trophyExchange.bonuses || {})
    .filter(([_, bonusData]) => bonusData && bonusData.applied)
    .map(([key, data]) => ({ key, ...data }))

  return {
    userTrophyChange: userMemberData.trophyChange || 0,
    activeBonuses,
    finalAmount: battle.trophyExchange.finalAmount || 0,
    perPlayerAmount: battle.trophyExchange.perPlayerAmount || 0,
    showBaseAmount: false, // Always hide base amount as requested
    bonusTotalAmount: activeBonuses.reduce(
      (sum, bonus) => sum + (bonus.amount || 0),
      0,
    ),
  }
}

module.exports = {
  calculateMVPAwards,
  getEnhancedPerformanceLevel,
  getSimplifiedTrophyData,
}
