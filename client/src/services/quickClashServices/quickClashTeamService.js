import axios from 'axios'

const toggleToken = (useToken) => {
  if (useToken) {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

const getAuthConfig = () => {
  const token = localStorage.getItem('token')
  return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
}

export const quickClashTeamService = {
  /**
   * Join a team using a invite code
   * @param {string} teamCode - The invite code
   * @returns {Promise<Object>} Response data
   */
  joinTeamByCode: async (teamCode) => {
    // Explicitly get token to ensure we have the latest one
    const token = localStorage.getItem('token')
    const config = {}

    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`
      }
    }

    // Also set default as a backup/side-effect
    toggleToken(true)

    const response = await axios.post('/api/quickClash/team/join', {
      teamCode
    }, config)

    return response.data
  },

  /**
   * Get all teams the current user is a member of
   * @returns {Promise<Object>} Response with teams array
   */
  getMyTeams: async () => {
    toggleToken(true)
    const response = await axios.get('/api/quickClash/teams', getAuthConfig())
    return response.data
  },

  /**
   * Invite a friend to a team from WiseWeb
   * @param {string} teamId - The team ID
   * @param {string} friendId - The friend's user ID
   * @returns {Promise<Object>} Response data
   */
  inviteFriendToTeam: async (teamId, friendId) => {
    toggleToken(true)
    const response = await axios.post(
      `/api/quickClash/team/${teamId}/invite-friend`,
      { friendId },
      getAuthConfig()
    )
    return response.data
  },

  /**
   * Create a new team
   * @param {string} name - The team name
   * @returns {Promise<Object>} Response with created team
   */
  createTeam: async (name) => {
    toggleToken(true)
    const response = await axios.post(
      '/api/quickClash/team',
      { name },
      getAuthConfig()
    )
    return response.data
  }
}
