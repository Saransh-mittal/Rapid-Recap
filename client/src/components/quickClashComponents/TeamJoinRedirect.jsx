// components/quickClashComponents/TeamJoinRedirect.jsx
// Handles /play/join/:teamCode for logged-in users
// Redirects to /quickclash/teams with team info for success message

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const TeamJoinRedirect = () => {
  const { teamCode } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const joinTeam = async () => {
      if (!teamCode) {
        navigate('/quickclash', { replace: true })
        return
      }

      try {
        // Attempt to join the team directly
        const response = await axios.post('/api/quickClash/team/join', { teamCode })
        const teamName = response.data?.team?.name || 'the team'

        // Success - redirect to quickclash/teams with success message including team name
        navigate('/quickclash/teams', {
          replace: true,
          state: {
            teamJoined: true,
            teamJoinMessage: `Successfully joined "${teamName}"! 🎉`
          }
        })
      } catch (err) {
        // Handle specific error cases
        const errorMessage = err.response?.data?.message || 'Failed to join team'

        // Redirect to quickclash/teams with error info
        navigate('/quickclash/teams', {
          replace: true,
          state: {
            teamJoinError: true,
            teamJoinMessage: errorMessage,
            teamCode: teamCode // Pass the code so user can try manually
          }
        })
      }
    }

    joinTeam()
  }, [teamCode, navigate])

  // Show loading while joining
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/70 text-sm">Joining team...</p>
      </div>
    </div>
  )
}

export default TeamJoinRedirect
